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

    const { data: videos, error } = await supabase
      .from('downloaded_videos')
      .select('*')
      .eq('user_id', sessionUserId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar vídeos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ videos })

  } catch (error) {
    console.error('Videos GET error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos' },
      { status: 500 }
    )
  }
}