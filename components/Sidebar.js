'use client'

import { Home, Layers, HelpCircle, LogOut, User, Settings, Users, GraduationCap } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Buscar user do localStorage (instantâneo)
    const userData = localStorage.getItem('francaverso_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = async () => {
    try {
      // Deletar cookie
      document.cookie = 'francaverso_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      // Deletar localStorage
      localStorage.removeItem('francaverso_user')
      
      // Chamar API de logout
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Redirecionar
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleHelpDesk = () => {
    window.open('https://wa.me/5521975368618', '_blank', 'noopener,noreferrer')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-franca-blue p-6 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <img src="/logo.png" alt="Franca Logo" width="40" height="40" className="drop-shadow-md" />
          <div>
            <h1 className="text-white font-bold text-xl">FRANCAVERSO</h1>
          </div>
        </div>
        <div className="h-1 w-12 bg-franca-green rounded-full"></div>
      </div>

      {/* User Info + Notificações */}
      {user && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-franca-green rounded-full flex items-center justify-center overflow-hidden">
                {user.profile_photo_url ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-franca-blue" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-franca-green-light text-xs">{user.role}</p>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1">
        <div className="space-y-1">
          <Link 
            href="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === '/dashboard' 
                ? 'bg-franca-green text-franca-blue' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Home size={20} className={`${
              pathname === '/dashboard' 
                ? 'text-franca-blue' 
                : 'text-franca-green'
            } group-hover:scale-110 transition-transform`} />
            <span className="font-medium">Início</span>
          </Link>
          
          <Link 
            href="/dashboard/ferramentas"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === '/dashboard/ferramentas' 
                ? 'bg-franca-green text-franca-blue' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Layers size={20} className={`${
              pathname === '/dashboard/ferramentas' 
                ? 'text-franca-blue' 
                : 'text-franca-green'
            } group-hover:scale-110 transition-transform`} />
            <span className="font-medium">Ferramentas</span>
          </Link>

          <Link 
            href="/dashboard/membros"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === '/dashboard/membros' 
                ? 'bg-franca-green text-franca-blue' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users size={20} className={`${
              pathname === '/dashboard/membros' 
                ? 'text-franca-blue' 
                : 'text-franca-green'
            } group-hover:scale-110 transition-transform`} />
            <span className="font-medium">Membros</span>
          </Link>

          <Link 
            href="/dashboard/academia"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === '/dashboard/academia' 
                ? 'bg-franca-green text-franca-blue' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap size={20} className={`${
              pathname === '/dashboard/academia' 
                ? 'text-franca-blue' 
                : 'text-franca-green'
            } group-hover:scale-110 transition-transform`} />
            <span className="font-medium">Academia</span>
          </Link>
        </div>
      </nav>

      {/* GERAL Section */}
      <div className="mt-auto">
        <p className="text-franca-green-light text-xs font-semibold uppercase tracking-wider mb-3 px-4">
          Geral
        </p>
        
        <div className="space-y-1">
          <Link
            href="/dashboard/configuracoes"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === '/dashboard/configuracoes'
                ? 'bg-franca-green text-franca-blue'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Settings size={20} className={`${
              pathname === '/dashboard/configuracoes'
                ? 'text-franca-blue'
                : 'text-franca-green'
            } group-hover:scale-110 transition-transform`} />
            <span>Configurações</span>
          </Link>

          <button
            onClick={handleHelpDesk}
            className="flex items-center space-x-3 text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all group w-full"
          >
            <HelpCircle size={20} className="text-franca-green group-hover:scale-110 transition-transform" />
            <span>Help Desk</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-white hover:bg-red-500/20 px-4 py-3 rounded-lg transition-all group w-full"
          >
            <LogOut size={20} className="text-red-400 group-hover:scale-110 transition-transform" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-franca-green-light text-xs text-center">
          Versão 2.0.0
        </p>
      </div>
    </aside>
  )
}