'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Loader, User, Search } from 'lucide-react'
import MessageThread from './MessageThread'
import NewChatModal from './NewChatModal'
import { createClient } from '@/lib/supabase/client'

export default function ChatInterface({ onClose, onMessageSent }) {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadUserAndConversations()

    // 🔥 REALTIME para novas conversas e mensagens
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('✅ Nova mensagem em alguma conversa via Realtime!', payload)
          
          // Recarregar conversas para atualizar unread count
          loadConversations()
          
          // Notificar parent component
          if (onMessageSent) onMessageSent()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('✅ Nova conversa criada via Realtime!', payload)
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadUserAndConversations = async () => {
    const userData = localStorage.getItem('francaverso_user')
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user)
      await loadConversations()
    }
    setLoading(false)
  }

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv)
    
    // Marcar como lida
    if (conv.unreadCount > 0) {
      fetch(`/api/chat/conversations/${conv.id}/read`, { method: 'POST' })
        .then(() => {
          loadConversations()
          if (onMessageSent) onMessageSent()
        })
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const name = conv.isGroup ? conv.name : (
      conv.participant1_id === currentUser?.id 
        ? conv.participant2?.name 
        : conv.participant1?.name
    )
    return name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-40 flex items-center justify-center">
        <Loader size={48} className="text-franca-green animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            currentUserId={currentUser?.id}
          />
        ) : (
          <>
            {/* Header */}
            <div className="bg-franca-blue p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Mensagens</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="p-2 bg-franca-green hover:bg-franca-green-hover text-franca-blue rounded-lg transition-all"
                    title="Nova conversa"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Busca */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-franca-green"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
              </div>
            </div>

            {/* Lista de Conversas */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Nenhuma conversa encontrada</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-4 px-4 py-2 bg-franca-green text-franca-blue rounded-lg hover:bg-franca-green-hover transition-all"
                  >
                    Iniciar Conversa
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = conv.isGroup 
                    ? null 
                    : conv.participant1_id === currentUser?.id 
                      ? conv.participant2 
                      : conv.participant1

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 transition-all flex items-center space-x-3"
                    >
                      <div className="w-12 h-12 bg-franca-green rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {otherUser?.profile_photo_url ? (
                          <img 
                            src={otherUser.profile_photo_url} 
                            alt={otherUser.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={24} className="text-franca-blue" />
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {conv.isGroup ? conv.name : otherUser?.name}
                          </h3>
                          {conv.last_message_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(conv.last_message_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conv.last_message || 'Sem mensagens'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-franca-green text-franca-blue text-xs font-bold rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de Nova Conversa */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreateConversation={(conv) => {
            setShowNewChat(false)
            loadConversations()
            setSelectedConversation(conv)
          }}
        />
      )}
    </>
  )
}