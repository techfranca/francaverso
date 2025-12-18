'use client'

import { User, Users, Loader } from 'lucide-react'

export default function ConversationList({ conversations, loading, onSelectConversation }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={32} className="text-franca-green animate-spin" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
        <MessageCircle size={48} className="mb-4 opacity-50" />
        <p className="text-sm">Nenhuma conversa ainda</p>
        <p className="text-xs mt-2">Clique no + para iniciar uma nova conversa</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelectConversation(conv)}
          className="w-full p-4 hover:bg-gray-50 transition-all flex items-start space-x-3 border-b border-gray-100"
        >
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            <div className="w-12 h-12 bg-franca-green rounded-full flex items-center justify-center overflow-hidden">
              {conv.type === 'group' ? (
                <Users size={24} className="text-franca-blue" />
              ) : conv.displayPhoto ? (
                <img src={conv.displayPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-franca-blue" />
              )}
            </div>
            {conv.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {conv.unreadCount}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-franca-blue truncate">
                {conv.displayName || conv.name}
              </h4>
              {conv.lastMessage && (
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {formatTime(conv.lastMessage.created_at)}
                </span>
              )}
            </div>
            {conv.lastMessage ? (
              <p className="text-sm text-gray-600 truncate">
                {conv.lastMessage.sender?.name === 'Você' ? 'Você: ' : ''}
                {conv.lastMessage.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">Sem mensagens</p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}