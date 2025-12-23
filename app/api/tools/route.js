import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Listar ferramentas customizadas
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: tools, error } = await supabase
      .from('custom_tools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tools:', error)
      return NextResponse.json({ error: 'Erro ao buscar ferramentas' }, { status: 500 })
    }

    return NextResponse.json({ tools: tools || [] })

  } catch (error) {
    console.error('Tools GET error:', error)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}

// POST - Criar nova ferramenta
export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { name, description, url, category, icon_name } = await request.json()

    // Validações
    if (!name || !description || !url || !category) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const validCategories = ['projetos', 'ia', 'dev', 'automacao']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: tool, error } = await supabase
      .from('custom_tools')
      .insert({
        name,
        description,
        url,
        category,
        icon_name: icon_name || 'Link',
        created_by: sessionUserId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tool:', error)
      return NextResponse.json({ error: 'Erro ao criar ferramenta' }, { status: 500 })
    }

    return NextResponse.json({ tool })

  } catch (error) {
    console.error('Tools POST error:', error)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}

// DELETE - Deletar ferramenta
export async function DELETE(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('id')

    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta não fornecido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Soft delete (marca como inativa)
    const { error } = await supabase
      .from('custom_tools')
      .update({ is_active: false })
      .eq('id', toolId)
      .eq('created_by', sessionUserId)

    if (error) {
      console.error('Error deleting tool:', error)
      return NextResponse.json({ error: 'Erro ao deletar ferramenta' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Tools DELETE error:', error)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}