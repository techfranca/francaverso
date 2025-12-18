'use client'

import { useState, useEffect } from 'react'
import { X, Users, MessageCircle, Plus } from 'lucide-react'
import ConversationList from './ConversationList'
import MessageThread from './MessageThread'
import NewChatModal from './NewChatModal'

export default function ChatInterface({ onClose, onMessageSent }) {
  const [view, setView] = useState('conversations') // 'conversations' | 'messages'
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    setView('messages')
  }

  const handleBack = () => {
    setSelectedConversation(null)
    setView('conversations')
    loadConversations() // Recarregar para atualizar contadores
  }

  const handleNewConversation = async (conversation) => {
    setShowNewChat(false)
    await loadConversations()
    handleSelectConversation(conversation)
  }

  return (
    <>
      {/* Modal do Chat */}
      <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-franca-green to-franca-green-hover p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {view === 'messages' ? (
              <button 
                onClick={handleBack}
                className="text-franca-blue hover:bg-white/20 p-1 rounded transition-all"
              >
                ←
              </button>
            ) : null}
            <MessageCircle size={20} className="text-franca-blue" />
            <h3 className="font-bold text-franca-blue">
              {view === 'messages' && selectedConversation
                ? selectedConversation.displayName || selectedConversation.name
                : 'Mensagens'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {view === 'conversations' && (
              <button
                onClick={() => setShowNewChat(true)}
                className="text-franca-blue hover:bg-white/20 p-2 rounded-full transition-all"
                title="Nova conversa"
              >
                <Plus size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-franca-blue hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-hidden">
          {view === 'conversations' ? (
            <ConversationList
              conversations={conversations}
              loading={loading}
              onSelectConversation={handleSelectConversation}
            />
          ) : (
            <MessageThread
              conversation={selectedConversation}
              onMessageSent={() => {
                onMessageSent()
                loadConversations()
              }}
            />
          )}
        </div>
      </div>

      {/* Modal Nova Conversa */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreateConversation={handleNewConversation}
        />
      )}
    </>
  )
}