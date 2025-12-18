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
      return NextResponse.json(
        { error: 'JobId não fornecido' },
        { status: 400 }
      )
    }

    // Buscar job na memória
    const job = downloadJobs.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs inválidas' },
        { status: 400 }
      )
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

    // Criar job no banco de dados
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
    processDownloads(jobId, urls, sessionUserId)

    return NextResponse.json({
      jobId: jobId,
      message: 'Download iniciado',
      total: urls.length
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar downloads',
        message: error.message 
      },
      { status: 500 }
    )
  }
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
    const url = urls[i].trim()
    
    if (!url) continue

    console.log(`\n⬇️ Baixando ${i + 1}/${urls.length}: ${url}`)

    // Atualizar status do job na memória
    job.current = {
      index: i + 1,
      total: urls.length,
      url: url,
      title: 'Obtendo informações...'
    }
    job.progress = 0

    try {
      // Obter informações do vídeo COM TIMEOUT
      console.log('📊 Obtendo informações do vídeo...')
      
      let videoInfo
      try {
        // Criar promise com timeout de 30 segundos
        const infoPromise = ytDlpWrap.getVideoInfo(url)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao obter informações do vídeo')), 30000)
        )
        
        videoInfo = await Promise.race([infoPromise, timeoutPromise])
        console.log(`✅ Título: ${videoInfo.title}`)
      } catch (infoError) {
        console.error('⚠️ Erro ao obter info, tentando download direto:', infoError.message)
        // Se falhar ao obter info, usa título genérico
        videoInfo = {
          title: `Video_${Date.now()}`,
          extractor_key: 'Unknown'
        }
      }
      
      job.current.title = videoInfo.title

      // Atualizar job no banco
      await supabase
        .from('download_jobs')
        .update({
          current_video_title: videoInfo.title,
          current_video_progress: 0
        })
        .eq('id', jobId)
      
      // Nome do arquivo (sanitizado)
      const sanitizedTitle = videoInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 100)
      
      const filename = `${sanitizedTitle}_${Date.now()}.mp4`
      const outputPath = path.join(DOWNLOADS_DIR, filename)

      console.log(`💾 Baixando para: ${filename}`)

      // Baixar vídeo com progresso
      const ytDlpProcess = ytDlpWrap.exec([
        url,
        '-o', outputPath,
        '--format', 'best[ext=mp4]/best',
        '--no-playlist',
        '--newline',
        '--no-check-certificate',
        '--socket-timeout', '30'
      ])

      let lastProgress = 0

      // Capturar progresso
      ytDlpProcess.stdout.on('data', async (data) => {
        const output = data.toString()
        console.log('📥', output.trim())
        
        const progressMatch = output.match(/(\d+\.?\d*)%/)
        
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1])
          job.progress = progress

          // Atualizar no banco a cada 10%
          if (Math.floor(progress / 10) > Math.floor(lastProgress / 10)) {
            console.log(`📊 Progresso: ${Math.floor(progress)}%`)
            lastProgress = progress
            
            await supabase
              .from('download_jobs')
              .update({ current_video_progress: progress })
              .eq('id', jobId)
          }
        }
      })

      ytDlpProcess.stderr.on('data', (data) => {
        console.error('❌ Stderr:', data.toString().trim())
      })

      await ytDlpProcess

      console.log(`✅ Download completo: ${filename}`)

      // Verificar se o arquivo existe
      if (!fs.existsSync(outputPath)) {
        throw new Error('Arquivo não foi criado')
      }

      // Obter tamanho do arquivo
      const stats = fs.statSync(outputPath)
      const fileSize = stats.size

      console.log(`📦 Tamanho: ${(fileSize / 1024 / 1024).toFixed(2)} MB`)

      // Salvar vídeo no banco
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
        url: url,
        title: videoInfo.title,
        filename: filename,
        downloadUrl: `/downloads/${filename}`,
        status: 'success',
        platform: videoInfo.extractor_key || 'Unknown',
        size: fileSize
      }

      job.results.push(result)
      job.completed++

      // Atualizar job no banco
      await supabase
        .from('download_jobs')
        .update({
          completed_videos: job.completed
        })
        .eq('id', jobId)

    } catch (error) {
      console.error(`❌ Erro ao baixar ${url}:`, error.message)
      console.error('Stack:', error.stack)
      
      // Salvar erro no banco
      await supabase
        .from('downloaded_videos')
        .insert({
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
        url: url,
        title: 'Erro',
        status: 'error',
        error: error.message
      })
      job.completed++

      // Atualizar job no banco
      await supabase
        .from('download_jobs')
        .update({
          completed_videos: job.completed
        })
        .eq('id', jobId)
    }
  }

  job.status = 'completed'
  job.current = null
  job.progress = 100

  // Finalizar job no banco
  await supabase
    .from('download_jobs')
    .update({
      status: 'completed',
      current_video_title: null,
      current_video_progress: 100
    })
    .eq('id', jobId)

  console.log('\n✅ Todos os downloads processados!')
  console.log(`✅ Sucesso: ${job.results.filter(r => r.status === 'success').length}`)
  console.log(`❌ Erros: ${job.results.filter(r => r.status === 'error').length}`)
}