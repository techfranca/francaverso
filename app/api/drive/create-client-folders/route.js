import { NextResponse } from 'next/server'
import { createClientFolderStructure, testDriveConnection } from '@/lib/google-drive'

export const dynamic = 'force-dynamic'

/**
 * POST - Criar estrutura de pastas para um cliente
 */
export async function POST(request) {
  try {
    const body = await request.json()

    const { nomeCliente, segmento, servicosContratados } = body

    // Validações
    if (!nomeCliente) {
      return NextResponse.json(
        { error: 'Nome do cliente é obrigatório' },
        { status: 400 }
      )
    }

    if (!segmento) {
      return NextResponse.json(
        { error: 'Segmento é obrigatório' },
        { status: 400 }
      )
    }

    // Criar estrutura de pastas
    const result = await createClientFolderStructure({
      nomeCliente,
      segmento,
      servicosContratados: servicosContratados || '',
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      alreadyExisted: result.alreadyExisted,
      folderId: result.folderId,
      folderLink: result.folderLink,
      servicosCriados: result.servicosCriados,
    })

  } catch (error) {
    console.error('Erro na API create-client-folders:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET - Testar conexão com o Drive
 */
export async function GET() {
  try {
    const result = await testDriveConnection()

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      folderName: result.folderName,
    })

  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return NextResponse.json(
      { error: 'Erro ao testar conexão com Drive', details: error.message },
      { status: 500 }
    )
  }
}
