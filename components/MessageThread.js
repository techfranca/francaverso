'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MessageThread({ conversation, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const messagesEndRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    loadCurrentUser()
    loadMessages()
    subscribeToMessages()

    return () => {
      supabase.channel(`messages:${conversation.id}`).unsubscribe()
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversation.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          // Buscar dados completos da mensagem com sender
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(id, name, profile_photo_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            // Evitar duplicatas (caso a mensagem já esteja no estado)
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === data.id)
              if (exists) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()

    return channel
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // ✅ ADICIONAR MENSAGEM LOCALMENTE (FIX DO BUG)
        setMessages((prev) => {
          // Evitar duplicata caso o realtime já tenha adicionado
          const exists = prev.some(msg => msg.id === data.message.id)
          if (exists) return prev
          return [...prev, data.message]
        })
        
        setNewMessage('')
        onMessageSent()
        
        // Scroll para baixo
        setTimeout(scrollToBottom, 100)
      } else {
        alert('Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={32} className="text-franca-green animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser?.id
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[75%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isOwn && (
                  <div className="w-8 h-8 bg-franca-green rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {msg.sender?.profile_photo_url ? (
                      <img src={msg.sender.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-franca-blue" />
                    )}
                  </div>
                )}

                {/* Mensagem */}
                <div>
                  {!isOwn && conversation.type === 'group' && (
                    <p className="text-xs text-gray-500 mb-1 px-3">
                      {msg.sender?.name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-franca-blue/70' : 'text-gray-500'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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