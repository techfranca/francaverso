import { NextResponse } from 'next/server'
import YTDlpWrap from 'yt-dlp-wrap'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Caminho para o executável do yt-dlp
const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe')

// Diretório para downloads temporários
const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads')

// Garantir que o diretório existe
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true })
}

// Store global para jobs (compartilhado entre rotas)
const downloadJobs = global.downloadJobs || new Map()
global.downloadJobs = downloadJobs

// ============================================
// GET - VERIFICAR STATUS DO JOB
// ============================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'JobId não fornecido' }, { status: 400 })
    }

    const job = downloadJobs.get(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      jobId,
      status: job.status,
      total: job.total,
      completed: job.completed,
      progress: job.progress,
      current: job.current,
      results: job.results
    })
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do job' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - INICIAR DOWNLOAD
// ============================================
export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs inválidas' }, { status: 400 })
    }

    // Verificar se o executável existe
    if (!fs.existsSync(ytDlpPath)) {
      return NextResponse.json(
        {
          error: 'yt-dlp não encontrado',
          message: 'Por favor, coloque o yt-dlp.exe na pasta bin/'
        },
        { status: 500 }
      )
    }

    const supabase = createServerClient()
    const jobId = uuidv4()

    // Criar job no banco de dados (mantendo seu padrão)
    const { data: job, error: jobError } = await supabase
      .from('download_jobs')
      .insert({
        id: jobId,
        user_id: sessionUserId,
        status: 'processing',
        total_videos: urls.length,
        completed_videos: 0
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json(
        { error: 'Erro ao criar job de download' },
        { status: 500 }
      )
    }

    // Inicializar job na memória
    downloadJobs.set(jobId, {
      status: 'processing',
      total: urls.length,
      completed: 0,
      current: null,
      progress: 0,
      results: []
    })

    // Processar downloads em background
    processDownloads(jobId, urls, sessionUserId).catch((e) => {
      console.error('❌ Falha no processDownloads:', e)
    })

    return NextResponse.json({
      jobId,
      message: 'Download iniciado',
      total: urls.length
    })
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar downloads',
        message: error?.message ?? 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// ============================================
// HELPERS
// ============================================

// Remove parâmetros de playlist (YouTube Music / Mix etc)
// Mesmo com --no-playlist, o yt-dlp pode tentar resolver “list” antes.
function normalizeUrl(inputUrl) {
  let url = (inputUrl ?? '').trim()
  if (!url) return url

  // remove &list=... mantendo o watch?v=
  if (url.includes('&list=')) url = url.split('&list=')[0]
  // remove ?list=... em casos diferentes
  if (url.includes('?list=')) url = url.split('?list=')[0]

  return url
}

function sanitizeTitle(title) {
  const base = (title ?? 'Video')
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 100)
  return base || 'Video'
}

// ============================================
// PROCESSAR DOWNLOADS EM BACKGROUND
// ============================================
async function processDownloads(jobId, urls, userId) {
  const job = downloadJobs.get(jobId)
  const ytDlpWrap = new YTDlpWrap(ytDlpPath)
  const supabase = createServerClient()

  console.log('🚀 Iniciando downloads...')
  console.log('📁 Salvando em:', DOWNLOADS_DIR)

  for (let i = 0; i < urls.length; i++) {
    let url = normalizeUrl(urls[i])
    if (!url) continue

    console.log(`\n⬇️ Baixando ${i + 1}/${urls.length}: ${url}`)

    // Atualizar status do job na memória
    job.current = {
      index: i + 1,
      total: urls.length,
      url,
      title: 'Obtendo informações...'
    }
    job.progress = 0

    try {
      // Obter informações do vídeo COM TIMEOUT (mantido)
      console.log('📊 Obtendo informações do vídeo...')

      let videoInfo
      try {
        const infoPromise = ytDlpWrap.getVideoInfo(url)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Timeout ao obter informações do vídeo')),
            30000
          )
        )
        videoInfo = await Promise.race([infoPromise, timeoutPromise])
        console.log(`✅ Título: ${videoInfo.title}`)
      } catch (infoError) {
        console.error(
          '⚠️ Erro ao obter info, tentando download direto:',
          infoError.message
        )
        videoInfo = {
          title: `Video_${Date.now()}`,
          extractor_key: 'Unknown'
        }
      }

      job.current.title = videoInfo.title

      // Atualizar job no banco (mantido)
      await supabase
        .from('download_jobs')
        .update({
          current_video_title: videoInfo.title,
          current_video_progress: 0
        })
        .eq('id', jobId)

      const sanitizedTitle = sanitizeTitle(videoInfo.title)
      const filename = `${sanitizedTitle}_${Date.now()}.mp4`
      const outputPath = path.join(DOWNLOADS_DIR, filename)

      console.log(`💾 Baixando para: ${filename}`)

      // ======================================================
      // ✅ CORREÇÃO DEFINITIVA DO ERRO "reading 'on'"
      // - O retorno de exec() pode variar entre versões:
      //   às vezes é ChildProcess, às vezes wrapper/promise.
      // - Vamos normalizar e VALIDAR antes de usar .on/.stdout.
      // ======================================================

      const execResult = ytDlpWrap.exec([
        url,
        '-o', outputPath,
        '--format', 'best[ext=mp4]/best',
        '--no-playlist',
        '--newline',
        '--no-check-certificate',
        '--socket-timeout', '30'
      ])

      // Alguns builds retornam Promise. Se for Promise, aguarde e pegue o processo.
      const ytDlpProcess =
        typeof execResult?.then === 'function' ? await execResult : execResult

      if (!ytDlpProcess || typeof ytDlpProcess.on !== 'function') {
        throw new Error(
          'Falha ao iniciar o processo do yt-dlp (processo inválido)'
        )
      }

      let lastProgressSavedBucket = -1
      let lastProgressLoggedBucket = -1

      // Capturar progresso em tempo real (stdout pode ser null em alguns casos)
      if (ytDlpProcess.stdout && typeof ytDlpProcess.stdout.on === 'function') {
        ytDlpProcess.stdout.on('data', async (data) => {
          const output = data.toString()
          // console.log('📥', output.trim())

          const progressMatch = output.match(/(\d+\.?\d*)%/)
          if (!progressMatch) return

          const progress = parseFloat(progressMatch[1])
          if (Number.isNaN(progress)) return

          job.progress = progress

          // bucket de 1% pro log leve
          const logBucket = Math.floor(progress)
          if (logBucket !== lastProgressLoggedBucket) {
            lastProgressLoggedBucket = logBucket
            console.log(`📊 Progresso: ${logBucket}%`)
          }

          // bucket de 5% pro banco (evita martelar supabase)
          const dbBucket = Math.floor(progress / 5)
          if (dbBucket !== lastProgressSavedBucket) {
            lastProgressSavedBucket = dbBucket
            try {
              await supabase
                .from('download_jobs')
                .update({ current_video_progress: progress })
                .eq('id', jobId)
            } catch (e) {
              // não derruba download por falha de update
              console.error('⚠️ Falha ao atualizar progresso no banco:', e?.message)
            }
          }
        })
      } else {
        console.warn('⚠️ stdout indisponível; progresso em tempo real pode não aparecer.')
      }

      if (ytDlpProcess.stderr && typeof ytDlpProcess.stderr.on === 'function') {
        ytDlpProcess.stderr.on('data', (data) => {
          console.error('❌ Stderr:', data.toString().trim())
        })
      }

      // Aguardar fim do processo
      await new Promise((resolve, reject) => {
        ytDlpProcess.on('close', (code) => {
          if (code === 0) resolve()
          else reject(new Error(`yt-dlp erro: código ${code}`))
        })
        ytDlpProcess.on('error', (err) => reject(err))
      })

      console.log(`✅ Download completo: ${filename}`)

      // Verificar arquivo (mantido)
      if (!fs.existsSync(outputPath)) {
        throw new Error('Arquivo não foi criado')
      }

      const stats = fs.statSync(outputPath)
      const fileSize = stats.size

      console.log(`📦 Tamanho: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)

      // Salvar vídeo no banco (mantido)
      const { error: videoError } = await supabase
        .from('downloaded_videos')
        .insert({
          job_id: jobId,
          user_id: userId,
          title: videoInfo.title,
          original_url: url,
          filename: filename,
          file_path: `/downloads/${filename}`,
          file_size: fileSize,
          platform: videoInfo.extractor_key || 'Unknown',
          status: 'success'
        })

      if (videoError) {
        console.error('Error saving video to database:', videoError)
      }

      const result = {
        url,
        title: videoInfo.title,
        filename,
        downloadUrl: `/downloads/${filename}`,
        status: 'success',
        platform: videoInfo.extractor_key || 'Unknown',
        size: fileSize
      }

      job.results.push(result)
      job.completed++

      await supabase
        .from('download_jobs')
        .update({ completed_videos: job.completed })
        .eq('id', jobId)
    } catch (error) {
      console.error(`❌ Erro ao baixar ${url}:`, error.message)

      // Salvar erro no banco (mantido)
      await supabase.from('downloaded_videos').insert({
        job_id: jobId,
        user_id: userId,
        title: 'Erro',
        original_url: url,
        filename: '',
        file_path: '',
        platform: 'Unknown',
        status: 'error',
        error_message: error.message
      })

      job.results.push({
        url,
        title: 'Erro',
        status: 'error',
        error: error.message
      })
      job.completed++

      await supabase
        .from('download_jobs')
        .update({ completed_videos: job.completed })
        .eq('id', jobId)
    }
  }

  job.status = 'completed'
  job.current = null
  job.progress = 100

  await supabase
    .from('download_jobs')
    .update({
      status: 'completed',
      current_video_title: null,
      current_video_progress: 100
    })
    .eq('id', jobId)

  console.log('\n✅ Todos os downloads processados!')
}
