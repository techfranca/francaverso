import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads')

// ============================================
// GET - LISTAR HISTÓRICO DE DOWNLOADS
// ============================================
export async function GET() {
  try {
    // Validar sessão
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Garantir que o diretório existe
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      fs.mkdirSync(DOWNLOADS_DIR, { recursive: true })
    }

    const supabase = createServerClient()

    // Buscar vídeos do usuário no database
    const { data: videos, error } = await supabase
      .from('downloaded_videos')
      .select('*')
      .eq('user_id', sessionUserId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar histórico do database:', error)
      // Fallback: listar arquivos físicos se o database falhar
      return listPhysicalFiles()
    }

    // Mapear para o formato esperado pelo frontend
    // E verificar se o arquivo físico ainda existe
    const history = videos
      .filter(video => {
        const filePath = path.join(DOWNLOADS_DIR, video.filename)
        const exists = fs.existsSync(filePath)
        
        if (!exists) {
          console.warn(`⚠️ Arquivo não encontrado no disco: ${video.filename}`)
        }
        
        return exists // Só retorna se o arquivo existir
      })
      .map(video => ({
        filename: video.filename,
        downloadUrl: video.file_path,
        size: video.file_size,
        created: video.created_at,
        title: video.title,
        platform: video.platform
      }))

    return NextResponse.json(history)

  } catch (error) {
    console.error('Erro ao listar downloads:', error)
    
    // Fallback: tentar listar arquivos físicos
    return listPhysicalFiles()
  }
}

// ============================================
// FALLBACK - LISTAR ARQUIVOS FÍSICOS
// ============================================
function listPhysicalFiles() {
  try {
    console.log('⚠️ Usando fallback: listando arquivos físicos')
    
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(DOWNLOADS_DIR)
    
    const fileList = files
      .filter(filename => filename.endsWith('.mp4')) // Só vídeos
      .map(filename => {
        const stats = fs.statSync(path.join(DOWNLOADS_DIR, filename))
        return {
          filename: filename,
          size: stats.size,
          created: stats.birthtime,
          downloadUrl: `/downloads/${filename}`,
          title: filename.replace(/_\d+\.mp4$/, '').replace(/_/g, ' '),
          platform: 'Unknown'
        }
      })

    // Ordenar por data de criação (mais recente primeiro)
    fileList.sort((a, b) => new Date(b.created) - new Date(a.created))

    return NextResponse.json(fileList)
  } catch (error) {
    console.error('Erro no fallback:', error)
    return NextResponse.json(
      { error: 'Erro ao listar downloads' },
      { status: 500 }
    )
  }
}
``