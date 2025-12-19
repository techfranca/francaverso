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
        conversation_participants!inner(user_id)
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
          .select('user:users(id, name, role, profile_photo_url)')
          .eq('conversation_id', conv.id)

        const users = participants?.map(p => p.user) || []

        // Última mensagem
        const { data: messages } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const lastMessage = messages?.[0]

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

        // Para chats individuais, separar participant1 e participant2
        if (conv.type === 'individual' && users.length === 2) {
          const currentUserIndex = users.findIndex(u => u.id === sessionUserId)
          const otherUserIndex = currentUserIndex === 0 ? 1 : 0

          return {
            id: conv.id,
            type: conv.type,
            name: conv.name,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message_at: lastMessage?.created_at || conv.created_at,
            isGroup: false,
            participant1_id: users[0].id,
            participant2_id: users[1].id,
            participant1: users[0],
            participant2: users[1],
            last_message: lastMessage?.content || null,
            unreadCount: unreadCount || 0,
            participantCount: 2
          }
        }

        // Para grupos
        return {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message_at: lastMessage?.created_at || conv.created_at,
          isGroup: true,
          last_message: lastMessage?.content || null,
          unreadCount: unreadCount || 0,
          participantCount: users.length,
          participants: users
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
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(user_id)
        `)
        .eq('type', 'individual')

      // Verificar se já existe conversa entre esses 2 usuários
      if (existingConvs && existingConvs.length > 0) {
        for (const conv of existingConvs) {
          const userIds = conv.conversation_participants?.map(p => p.user_id).sort()
          const targetIds = [sessionUserId, otherUserId].sort()
          
          if (JSON.stringify(userIds) === JSON.stringify(targetIds)) {
            // Buscar dados completos da conversa
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user:users(id, name, role, profile_photo_url)')
              .eq('conversation_id', conv.id)

            const users = participants?.map(p => p.user) || []

            return NextResponse.json({ 
              conversation: {
                id: conv.id,
                type: conv.type,
                name: conv.name,
                isGroup: false,
                participant1_id: users[0]?.id,
                participant2_id: users[1]?.id,
                participant1: users[0],
                participant2: users[1],
                participantCount: 2
              }
            })
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

    // Buscar dados completos dos participantes
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user:users(id, name, role, profile_photo_url)')
      .eq('conversation_id', conversation.id)

    const users = participants?.map(p => p.user) || []

    // Retornar no formato esperado pelo frontend
    const response = {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      isGroup: type === 'group',
      participantCount: users.length
    }

    if (type === 'individual' && users.length === 2) {
      response.participant1_id = users[0].id
      response.participant2_id = users[1].id
      response.participant1 = users[0]
      response.participant2 = users[1]
    } else {
      response.participants = users
    }

    return NextResponse.json({ conversation: response })

  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Erro ao criar conversa' }, { status: 500 })
  }
}