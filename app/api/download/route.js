import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

const isVercel = process.env.VERCEL === '1'

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

    // VERCEL: Retorna links para cobalt.tools
    if (isVercel) {
      const results = urls.filter(u => u.trim()).map(url => ({
        url: url.trim(),
        status: 'redirect',
        cobaltUrl: `https://cobalt.tools/?u=${encodeURIComponent(url.trim())}`,
        platform: detectPlatform(url),
        title: 'Abrir no Cobalt'
      }))
      return NextResponse.json({ results, mode: 'redirect' })
    }

    // LOCAL: Usa yt-dlp
    const results = []
    
    for (const url of urls) {
      if (!url.trim()) continue
      
      try {
        console.log(`⬇️ Baixando: ${url}`)
        const result = await downloadWithYtDlp(url.trim())
        results.push(result)
      } catch (error) {
        console.error(`❌ Erro: ${error.message}`)
        results.push({
          url,
          status: 'error',
          error: error.message,
          title: 'Erro'
        })
      }
    }

    return NextResponse.json({ results, mode: 'local' })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function downloadWithYtDlp(url) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.cwd(), 'public', 'downloads')
    
    // Cria pasta se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s')
    
    // Detecta o executável
    const ytdlpPath = process.platform === 'win32' 
      ? path.join(process.cwd(), 'bin', 'yt-dlp.exe')
      : 'yt-dlp'

    const args = [
      url,
      '-o', outputTemplate,
      '-f', 'best[height<=720]/best',
      '--no-playlist',
      '--print', 'after_move:filepath',
      '--print', 'title',
      '--restrict-filenames'
    ]

    console.log(`🔧 Executando: ${ytdlpPath}`)

    const process_ytdlp = spawn(ytdlpPath, args)

    let output = ''
    let errorOutput = ''

    process_ytdlp.stdout.on('data', (data) => {
      output += data.toString()
    })

    process_ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString()
      console.log(`yt-dlp: ${data}`)
    })

    process_ytdlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput || 'Falha no download'))
        return
      }

      const lines = output.trim().split('\n')
      const title = lines[0] || 'Video'
      const filepath = lines[1] || ''
      const filename = path.basename(filepath)

      resolve({
        url,
        status: 'success',
        title,
        filename,
        downloadUrl: `/downloads/${filename}`,
        platform: detectPlatform(url)
      })
    })

    process_ytdlp.on('error', (err) => {
      reject(new Error(`yt-dlp não encontrado: ${err.message}`))
    })
  })
}

function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'YouTube'
  if (/instagram\.com/.test(url)) return 'Instagram'
  if (/tiktok\.com/.test(url)) return 'TikTok'
  if (/twitter\.com|x\.com/.test(url)) return 'Twitter/X'
  if (/facebook\.com/.test(url)) return 'Facebook'
  if (/reddit\.com/.test(url)) return 'Reddit'
  return 'Outro'
}