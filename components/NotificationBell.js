'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  const buttonRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadNotifications()
    subscribeToNotifications()
    return () => supabase.channel('notifications').unsubscribe()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/chat/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter(n => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const subscribeToNotifications = () => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        const userId = data.user.id
        supabase
          .channel('notifications')
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'notifications', 
              filter: `user_id=eq.${userId}` 
            }, (payload) => {
              setNotifications((prev) => [payload.new, ...prev])
              setUnreadCount((prev) => prev + 1)
            }
          ).subscribe()
      })
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/chat/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const getPanelPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 }
    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.right + 15
    }
  }

  const pos = getPanelPosition()

  return (
    <>
      {/* Botão Sino - IDENTIDADE FRANCA */}
      <button
        ref={buttonRef}
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Portal com Painel - IDENTIDADE FRANCA */}
      {mounted && showPanel && createPortal(
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/20" 
            onClick={() => setShowPanel(false)} 
          />

          {/* Painel - IDENTIDADE VISUAL FRANCA */}
          <div 
            className="fixed w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn z-[9999]"
            style={{ 
              top: `${pos.top}px`, 
              left: `${pos.left}px` 
            }}
          >
            {/* Header - GRADIENTE VERDE */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-franca-green to-franca-green-hover">
              <h3 className="font-bold text-franca-blue">Notificações</h3>
              <button 
                onClick={() => setShowPanel(false)} 
                className="text-franca-blue hover:bg-white/20 p-1 rounded transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      handleMarkAsRead(n.id)
                      if (n.link) window.location.href = n.link
                    }}
                    className={`w-full p-4 hover:bg-gray-50 transition-all text-left border-b border-gray-100 ${
                      !n.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-franca-blue">
                            {n.title}
                          </h4>
                          {!n.read && (
                            <span className="w-2 h-2 bg-franca-green rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        {n.content && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {n.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer - BOTÃO VERDE */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id))}
                  className="w-full text-sm text-franca-green hover:text-franca-green-hover font-medium flex items-center justify-center space-x-1 py-2 transition-all"
                >
                  <Check size={16} />
                  <span>Marcar todas como lidas</span>
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  )
}