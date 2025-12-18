'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, Briefcase, Calendar, Loader } from 'lucide-react'

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <Loader size={48} className="text-franca-green animate-spin" />
      </main>
    )
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-franca-blue mb-2">
          Equipe Franca
        </h1>
        <p className="text-gray-600">
          Conheça os membros da nossa equipe
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-green/20">
          <p className="text-xs text-gray-600 mb-1">Total de Membros</p>
          <p className="text-2xl font-bold text-franca-green">{members.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-blue/20">
          <p className="text-xs text-gray-600 mb-1">Departamentos</p>
          <p className="text-2xl font-bold text-franca-blue">
            {new Set(members.map(m => m.department).filter(Boolean)).size || 5}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <p className="text-xs text-gray-600 mb-1">Equipe Ativa</p>
          <p className="text-lg font-bold text-green-600">{members.length} pessoas</p>
        </div>
      </div>

      {/* Cards dos Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-franca-green transition-all transform hover:scale-[1.02] animate-fadeIn"
            style={{animationDelay: `${0.2 + index * 0.1}s`}}
          >
            {/* Header do Card com foto */}
            <div className="bg-gradient-to-r from-franca-green to-franca-green-hover p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden mx-auto mb-4 ring-4 ring-white/50">
                {member.profile_photo_url ? (
                  <img 
                    src={member.profile_photo_url} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-franca-blue" />
                )}
              </div>
              <h3 className="text-xl font-bold text-franca-blue">{member.name}</h3>
              <p className="text-franca-blue/80 text-sm font-medium">{member.role}</p>
            </div>

            {/* Corpo do Card com informações */}
            <div className="p-6 space-y-4">
              {/* Bio */}
              {member.bio && (
                <div>
                  <p className="text-sm text-gray-600 italic line-clamp-3">
                    "{member.bio}"
                  </p>
                </div>
              )}

              {/* Informações de Contato */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {member.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-franca-green flex-shrink-0" />
                    <span className="text-gray-700 truncate">{member.email}</span>
                  </div>
                )}
                
                {member.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-franca-green flex-shrink-0" />
                    <span className="text-gray-700">{member.phone}</span>
                  </div>
                )}
                
                {member.department && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase size={16} className="text-franca-green flex-shrink-0" />
                    <span className="text-gray-700">{member.department}</span>
                  </div>
                )}
                
                {member.join_date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={16} className="text-franca-green flex-shrink-0" />
                    <span className="text-gray-700">
                      Desde {new Date(member.join_date + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {/* Mensagem quando não tem info */}
                {!member.email && !member.phone && !member.department && !member.join_date && !member.bio && (
                  <p className="text-sm text-gray-400 italic">
                    Nenhuma informação adicional cadastrada
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© 2025 Franca. Desenvolvido com 💚 pela equipe de tecnologia.</p>
      </footer>
    </main>
  )
}