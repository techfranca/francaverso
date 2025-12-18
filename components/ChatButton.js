'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import ChatInterface from './ChatInterface'

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Buscar contagem de não lidas
    fetchUnreadCount()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        const total = data.conversations?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) || 0
        setUnreadCount(total)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center"
        aria-label="Chat"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Interface do Chat */}
      {isOpen && (
        <ChatInterface 
          onClose={() => setIsOpen(false)} 
          onMessageSent={fetchUnreadCount}
        />
      )}
    </>
  )
}