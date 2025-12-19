'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader, ArrowLeft, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MessageThread({ conversation, onBack, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected')
  const messagesEndRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    if (!conversation) return

    // Carregar mensagens iniciais
    loadMessages()

    console.log('🔵 Configurando Realtime para conversa:', conversation.id)

    // 🔥 CONFIGURAR REALTIME COM DEBUG
    const channel = supabase
      .channel(`conversation-${conversation.id}`, {
        config: {
          broadcast: { self: true } // Receber próprias mensagens também
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          console.log('✅ REALTIME: Nova mensagem detectada!', payload)
          
          // Buscar mensagem completa com dados do sender
          const { data: fullMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(id, name, profile_photo_url, role)
            `)
            .eq('id', payload.new.id)
            .single()

          if (error) {
            console.error('❌ Erro ao buscar mensagem completa:', error)
            // Usar payload.new como fallback
            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(m => m.id === payload.new.id)) {
                console.log('⚠️ Mensagem duplicada, ignorando')
                return prev
              }
              console.log('➕ Adicionando mensagem (fallback):', payload.new)
              return [...prev, payload.new]
            })
          } else {
            console.log('✅ Mensagem completa recebida:', fullMessage)
            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(m => m.id === fullMessage.id)) {
                console.log('⚠️ Mensagem duplicada, ignorando')
                return prev
              }
              console.log('➕ Adicionando mensagem:', fullMessage)
              return [...prev, fullMessage]
            })
          }
          
          // Scroll automático
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe((status) => {
        console.log('🔄 Status do Realtime:', status)
        setRealtimeStatus(status)
      })

    // Cleanup: remover subscription quando sair
    return () => {
      console.log('🔴 Desconectando Realtime')
      supabase.removeChannel(channel)
    }
  }, [conversation?.id])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversation.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Mensagens carregadas:', data.messages?.length || 0)
        setMessages(data.messages || [])
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    setSending(true)

    try {
      console.log('📤 Enviando mensagem...')
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        console.log('✅ Mensagem enviada com sucesso!')
        setNewMessage('')
        // O Realtime vai adicionar a mensagem automaticamente
      } else {
        const error = await response.json()
        console.error('❌ Erro ao enviar:', error)
        alert('Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={32} className="text-franca-green animate-spin" />
      </div>
    )
  }

  const otherUser = conversation.isGroup 
    ? null 
    : conversation.participant1_id === currentUserId 
      ? conversation.participant2 
      : conversation.participant1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-franca-blue p-4 flex items-center space-x-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        <div className="w-10 h-10 bg-franca-green rounded-full flex items-center justify-center overflow-hidden">
          {otherUser?.profile_photo_url ? (
            <img 
              src={otherUser.profile_photo_url} 
              alt={otherUser.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} className="text-franca-blue" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-white font-semibold">
            {conversation.isGroup ? conversation.name : otherUser?.name}
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-franca-green-light text-xs">
              {conversation.isGroup ? `${conversation.participantCount} membros` : otherUser?.role}
            </p>
            {/* Status do Realtime */}
            <div className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'SUBSCRIBED' ? 'bg-green-400' : 
              realtimeStatus === 'CHANNEL_ERROR' ? 'bg-red-400' : 
              'bg-yellow-400'
            }`} title={`Realtime: ${realtimeStatus}`}></div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && conversation.isGroup && (
                    <p className="text-xs text-gray-500 mb-1 ml-2">
                      {message.sender?.name}
                    </p>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-franca-green text-franca-blue rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-franca-blue/60' : 'text-gray-500'}`}>
                      {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {sending ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}