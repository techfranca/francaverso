import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads')

export async function GET() {
  try {
    // Garantir que o diretório existe
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      fs.mkdirSync(DOWNLOADS_DIR, { recursive: true })
      return NextResponse.json([])
    }

    const files = fs.readdirSync(DOWNLOADS_DIR)
    
    const fileList = files.map(filename => {
      const stats = fs.statSync(path.join(DOWNLOADS_DIR, filename))
      return {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        downloadUrl: `/downloads/${filename}`
      }
    })

    // Ordenar por data de criação (mais recente primeiro)
    fileList.sort((a, b) => new Date(b.created) - new Date(a.created))

    return NextResponse.json(fileList)
  } catch (error) {
    console.error('Erro ao listar downloads:', error)
    return NextResponse.json(
      { error: 'Erro ao listar downloads' },
      { status: 500 }
    )
  }
}