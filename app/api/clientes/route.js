import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const segmento = searchParams.get('segmento')

    const supabase = createServerClient()

    let query = supabase
      .from('clients')
      .select('*')
      .order('nome_empresa', { ascending: true })

    // Filtrar por status
    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    // Filtrar por segmento
    if (segmento && segmento !== 'todos') {
      query = query.eq('segmento', segmento)
    }

    // Buscar por nome
    if (search) {
      query = query.or(`nome_empresa.ilike.%${search}%,nome_cliente.ilike.%${search}%,tag.ilike.%${search}%`)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar clientes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clients: clients || [] })

  } catch (error) {
    console.error('Clients API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const clientData = await request.json()
    const supabase = createServerClient()

    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Erro ao criar cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ client })

  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, ...clientData } = await request.json()
    const supabase = createServerClient()

    const { data: client, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ client })

  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
