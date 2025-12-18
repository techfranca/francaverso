import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Buscar notificações do usuário
export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', sessionUserId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
    }

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
  }
}

// PUT - Marcar notificação como lida
export async function PUT(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { notificationId } = await request.json()

    const supabase = createServerClient()

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', sessionUserId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json({ error: 'Erro ao marcar notificação' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Notifications PUT error:', error)
    return NextResponse.json({ error: 'Erro ao marcar notificação' }, { status: 500 })
  }
}