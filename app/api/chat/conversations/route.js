import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Listar conversas do usuário
export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Buscar conversas que o usuário participa
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(user_id),
        messages(
          id,
          content,
          created_at,
          sender:users!messages_sender_id_fkey(id, name, profile_photo_url)
        )
      `)
      .eq('conversation_participants.user_id', sessionUserId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 })
    }

    // Processar conversas para incluir info dos participantes
    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Buscar participantes
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user:users(id, name, profile_photo_url)')
          .eq('conversation_id', conv.id)

        // Última mensagem
        const lastMessage = conv.messages?.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0]

        // Para chats individuais, pegar o outro usuário
        let displayName = conv.name
        let displayPhoto = null

        if (conv.type === 'individual' && participants?.length === 2) {
          const otherUser = participants.find(p => p.user.id !== sessionUserId)?.user
          displayName = otherUser?.name
          displayPhoto = otherUser?.profile_photo_url
        }

        // Contar mensagens não lidas
        const { data: lastRead } = await supabase
          .from('conversation_participants')
          .select('last_read_at')
          .eq('conversation_id', conv.id)
          .eq('user_id', sessionUserId)
          .single()

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .gt('created_at', lastRead?.last_read_at || new Date(0).toISOString())
          .neq('sender_id', sessionUserId)

        return {
          ...conv,
          participants: participants?.map(p => p.user),
          lastMessage,
          displayName,
          displayPhoto,
          unreadCount: unreadCount || 0
        }
      })
    )

    return NextResponse.json({ conversations: processedConversations })

  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 })
  }
}

// POST - Criar nova conversa
export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { type, participantIds, name } = await request.json()

    const supabase = createServerClient()

    // Verificar se já existe conversa individual entre esses usuários
    if (type === 'individual' && participantIds?.length === 1) {
      const otherUserId = participantIds[0]
      
      // Buscar conversa existente
      const { data: existingConv } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id)
        `)
        .eq('type', 'individual')
        .in('conversation_participants.user_id', [sessionUserId, otherUserId])

      // Se encontrou, verificar se tem exatamente esses 2 usuários
      if (existingConv && existingConv.length > 0) {
        for (const conv of existingConv) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
          
          const userIds = participants?.map(p => p.user_id).sort()
          const targetIds = [sessionUserId, otherUserId].sort()
          
          if (JSON.stringify(userIds) === JSON.stringify(targetIds)) {
            return NextResponse.json({ conversation: conv })
          }
        }
      }
    }

    // Criar nova conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: type === 'group' ? name : null,
        created_by: sessionUserId
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: 'Erro ao criar conversa' }, { status: 500 })
    }

    // Adicionar participantes
    const participantsToAdd = type === 'individual' 
      ? [sessionUserId, ...participantIds]
      : [...new Set([sessionUserId, ...participantIds])]

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(
        participantsToAdd.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId
        }))
      )

    if (partError) {
      console.error('Error adding participants:', partError)
      return NextResponse.json({ error: 'Erro ao adicionar participantes' }, { status: 500 })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Erro ao criar conversa' }, { status: 500 })
  }
}