import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads')

export async function DELETE(request, { params }) {
  try {
    const { filename } = params
    const filePath = path.join(DOWNLOADS_DIR, filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return NextResponse.json({ message: 'Arquivo deletado com sucesso' })
    } else {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar arquivo' },
      { status: 500 }
    )
  }
}