import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Buscar mensagens de uma conversa
export async function GET(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId é obrigatório' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar se usuário participa da conversa
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', sessionUserId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar mensagens
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, profile_photo_url)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
    }

    // Atualizar last_read_at
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', sessionUserId)

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}

// POST - Enviar mensagem
export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar se usuário participa da conversa
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', sessionUserId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Criar mensagem
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: sessionUserId,
        content: content.trim()
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, profile_photo_url)
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
    }

    // Criar notificações para outros participantes
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', sessionUserId)

    const { data: sender } = await supabase
      .from('users')
      .select('name')
      .eq('id', sessionUserId)
      .single()

    if (participants && participants.length > 0) {
      const notifications = participants.map(p => ({
        user_id: p.user_id,
        type: 'message',
        title: `Nova mensagem de ${sender?.name}`,
        content: content.substring(0, 100),
        link: `/dashboard/chat?conversation=${conversationId}`
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}