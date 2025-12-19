'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, Loader } from 'lucide-react'

export default function MembrosPage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-franca-blue mb-2">
          Equipe Franca
        </h1>
        <p className="text-gray-600">
          Conheça os membros da nossa equipe
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-green/20">
          <p className="text-xs text-gray-600 mb-1">Total de Membros</p>
          <p className="text-2xl font-bold text-franca-green">{members.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <p className="text-xs text-gray-600 mb-1">Equipe Ativa</p>
          <p className="text-lg font-bold text-green-600">{members.length} pessoas</p>
        </div>
      </div>

      {/* Cards dos Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-franca-green transition-all transform hover:scale-[1.02]"
          >
            {/* Header do Card - Banner + Foto */}
            <div className="relative h-32">
              {member.banner_url ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${member.banner_url})` }}
                ></div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-franca-green to-franca-green-hover"></div>
              )}
              
              <div className="absolute inset-0 bg-black/10"></div>

              {/* Foto de perfil centralizada */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
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
              </div>
            </div>

            {/* Corpo do Card */}
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-100">
                {/* Nome e Cargo */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-franca-blue truncate">{member.name}</h3>
                  <p className="text-gray-600 text-xs font-medium truncate">{member.role}</p>
                </div>

                {/* Email e Telefone */}
                <div className="flex-shrink-0 space-y-1 text-right">
                  {member.email && (
                    <div className="flex items-center justify-end space-x-1 text-xs">
                      <Mail size={14} className="text-franca-green flex-shrink-0" />
                      <span className="text-gray-700 truncate max-w-[120px]" title={member.email}>
                        {member.email.split('@')[0]}
                      </span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center justify-end space-x-1 text-xs">
                      <Phone size={14} className="text-franca-green flex-shrink-0" />
                      <span className="text-gray-700">{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {member.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 italic line-clamp-3">
                    "{member.bio}"
                  </p>
                </div>
              )}

              {/* Mensagem quando não tem info */}
              {!member.email && !member.phone && !member.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 italic text-center">
                    Nenhuma informação adicional cadastrada
                  </p>
                </div>
              )}
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