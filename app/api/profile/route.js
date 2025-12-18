import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Buscar perfil do usuário
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

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUserId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar perfil do usuário (SEM department e joinDate)
export async function PUT(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { bio, email, phone } = await request.json()

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('users')
      .update({
        bio,
        email,
        phone
      })
      .eq('id', sessionUserId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: data 
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}