import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Buscar credenciais de um cliente
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente não fornecido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: credentials, error } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('client_id', clientId)
      .order('credential_type', { ascending: true })
      .order('platform_name', { ascending: true })

    if (error) {
      console.error('Error fetching credentials:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar credenciais' },
        { status: 500 }
      )
    }

    return NextResponse.json({ credentials: credentials || [] })

  } catch (error) {
    console.error('Credentials API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar credenciais de um cliente
export async function POST(request) {
  try {
    const { client_id, credentials } = await request.json()

    if (!client_id) {
      return NextResponse.json(
        { error: 'ID do cliente não fornecido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Deletar todas as credenciais existentes do cliente
    const { error: deleteError } = await supabase
      .from('client_credentials')
      .delete()
      .eq('client_id', client_id)

    if (deleteError) {
      console.error('Error deleting old credentials:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao atualizar credenciais' },
        { status: 500 }
      )
    }

    // Se não há credenciais para inserir, retornar sucesso
    if (!credentials || credentials.length === 0) {
      return NextResponse.json({ 
        success: true, 
        credentials: [] 
      })
    }

    // Filtrar credenciais vazias e preparar para inserção
    const validCredentials = credentials
      .filter(cred => cred.platform_name && (cred.login || cred.password))
      .map(cred => ({
        client_id,
        credential_type: cred.credential_type || 'custom',
        platform_name: cred.platform_name,
        login: cred.login || null,
        password: cred.password || null,
        notes: cred.notes || null
      }))

    if (validCredentials.length === 0) {
      return NextResponse.json({ 
        success: true, 
        credentials: [] 
      })
    }

    // Inserir novas credenciais
    const { data: insertedCredentials, error: insertError } = await supabase
      .from('client_credentials')
      .insert(validCredentials)
      .select()

    if (insertError) {
      console.error('Error inserting credentials:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar credenciais' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      credentials: insertedCredentials 
    })

  } catch (error) {
    console.error('Save credentials error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar uma credencial específica
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID da credencial não fornecido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('client_credentials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting credential:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir credencial' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete credential error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
