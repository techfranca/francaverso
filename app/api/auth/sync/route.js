import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { uid, email, name, photo } = await request.json()

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Buscar usuário existente pelo firebase_uid ou email
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`firebase_uid.eq.${uid},email.eq.${email.toLowerCase()}`)
      .single()

    if (error && error.code === 'PGRST116') {
      // Usuário não existe, criar novo
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          firebase_uid: uid,
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          role: 'Membro', // Role padrão para novos usuários
          profile_photo_url: photo || null
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar usuário:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar usuário' },
          { status: 500 }
        )
      }

      user = newUser
    } else if (error) {
      console.error('Erro ao buscar usuário:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      )
    } else {
      // Usuário existe, atualizar firebase_uid e foto se necessário
      const updates = {}
      
      if (!user.firebase_uid) {
        updates.firebase_uid = uid
      }
      
      if (photo && user.profile_photo_url !== photo) {
        updates.profile_photo_url = photo
      }

      if (Object.keys(updates).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()

        if (!updateError) {
          user = updatedUser
        }
      }
    }

    // Criar cookie de sessão
    const cookieStore = cookies()
    cookieStore.set('francaverso_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 dias
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_photo_url: user.profile_photo_url
      }
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar usuário' },
      { status: 500 }
    )
  }
}
