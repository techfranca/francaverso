import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads')

// ============================
// GET — FORÇAR DOWNLOAD
// ============================
export async function GET(request, { params }) {
  try {
    const { filename } = params

    if (!filename) {
      return new NextResponse('Arquivo não informado', { status: 400 })
    }

    // Validar sessão
    const session = cookies().get('francaverso_session')?.value
    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const filePath = path.join(DOWNLOADS_DIR, filename)

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Arquivo não encontrado', { status: 404 })
    }

    const stat = fs.statSync(filePath)
    const stream = fs.createReadStream(filePath)

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}

// ============================
// DELETE — EXCLUIR ARQUIVO (FÍSICO + DATABASE)
// ============================
export async function DELETE(request, { params }) {
  try {
    const { filename } = params

    if (!filename) {
      return NextResponse.json(
        { error: 'Arquivo não informado' },
        { status: 400 }
      )
    }

    // Validar sessão
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const filePath = path.join(DOWNLOADS_DIR, filename)
    const supabase = createServerClient()

    console.log(`🗑️ Iniciando deleção: ${filename}`)

    // 1. DELETAR DO DATABASE
    console.log(`📊 Deletando do database...`)
    
    const { error: dbError, count } = await supabase
      .from('downloaded_videos')
      .delete({ count: 'exact' })
      .eq('filename', filename)
      .eq('user_id', sessionUserId) // Só pode deletar os próprios vídeos

    if (dbError) {
      console.error('❌ Erro ao deletar do database:', dbError)
      // Continua mesmo com erro no DB para tentar deletar o arquivo físico
    } else {
      console.log(`✅ Deletado do database: ${count} registro(s)`)
    }

    // 2. DELETAR ARQUIVO FÍSICO
    if (fs.existsSync(filePath)) {
      console.log(`📁 Deletando arquivo físico...`)
      fs.unlinkSync(filePath)
      console.log(`✅ Arquivo físico deletado`)
    } else {
      console.log(`⚠️ Arquivo físico não encontrado (já foi deletado?)`)
    }

    console.log(`✅ Deleção completa: ${filename}`)

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
      deletedFromDB: !dbError,
      deletedFromDisk: fs.existsSync(filePath) === false
    })

  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar arquivo', details: error.message },
      { status: 500 }
    )
  }
}