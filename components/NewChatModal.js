'use client'

import { useState, useEffect } from 'react'
import { X, User, Loader, Search } from 'lucide-react'

export default function NewChatModal({ onClose, onCreateConversation }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        
        // Filtrar usuário atual
        const userResponse = await fetch('/api/auth/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setMembers(data.members.filter(m => m.id !== userData.user.id))
        }
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async (userId) => {
    setCreating(true)

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'individual',
          participantIds: [userId]
        })
      })

      if (response.ok) {
        const data = await response.json()
        onCreateConversation(data.conversation)
      } else {
        alert('Erro ao criar conversa')
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      alert('Erro ao criar conversa')
    } finally {
      setCreating(false)
    }
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-franca-blue">Nova Conversa</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar membro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={32} className="text-franca-green animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleCreateChat(member.id)}
                  disabled={creating}
                  className="w-full p-3 hover:bg-gray-50 rounded-lg transition-all flex items-center space-x-3 disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-franca-green rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {member.profile_photo_url ? (
                      <img src={member.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-franca-blue" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-franca-blue text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}