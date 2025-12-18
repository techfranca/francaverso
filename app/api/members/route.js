import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { data: members, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar membros' },
        { status: 500 }
      )
    }

    return NextResponse.json({ members })

  } catch (error) {
    console.error('Members GET error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar membros' },
      { status: 500 }
    )
  }
}