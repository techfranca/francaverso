'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // Buscar usuário do localStorage (já está autenticado pelo layout)
    const userData = localStorage.getItem('francaverso_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Atualizar relógio
    const updateTime = () => {
      const now = new Date()
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      setCurrentTime(now.toLocaleDateString('pt-BR', options))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Animação de Metaverso */}
        <div className="relative mb-12 animate-fadeIn">
          {/* Círculos flutuantes estilo metaverso */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-franca-green/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-franca-green-dark/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-franca-blue/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          {/* Grid de fundo estilo metaverso */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(to right, #7DE08D 1px, transparent 1px),
                linear-gradient(to bottom, #7DE08D 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Logo 3D-ish */}
          <div className="relative text-center mb-8">
            <div className="inline-block transform hover:scale-110 transition-all duration-500">
              <img src="/logo.png" alt="Franca Logo" width="120" height="120" className="drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>

        {/* Mensagem de Boas-vindas */}
        {user && (
          <div className="text-center mb-12 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="inline-flex items-center space-x-2 bg-franca-green/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-franca-green animate-pulse" />
              <span className="text-franca-blue font-medium text-sm">Bem-vindo ao Francaverso</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-franca-blue mb-4">
              Olá, <span className="text-franca-green">{user.name}</span>! 👋
            </h1>
            
            <p className="text-xl text-franca-green-dark mb-2">
              {user.role}
            </p>
            
            <p className="text-gray-600 capitalize">
              {currentTime}
            </p>
          </div>
        )}

        {/* Cards de acesso rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <Link href="/dashboard/ferramentas">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-franca-green transition-all cursor-pointer group transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-franca-green to-franca-green-hover rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white" size={24} />
                </div>
                <ArrowRight className="text-franca-green group-hover:translate-x-1 transition-transform" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-franca-blue mb-2">
                Acessar Ferramentas
              </h3>
              <p className="text-gray-600 text-sm">
                Central de ferramentas, sistemas e automações da Franca
              </p>
            </div>
          </Link>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-franca-blue mb-4">
              Estatísticas Rápidas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ferramentas</span>
                <span className="font-bold text-franca-green">15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-bold text-green-600 text-sm">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponibilidade</span>
                <span className="font-bold text-franca-blue">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div className="text-center animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="bg-gradient-to-r from-franca-green/20 via-franca-green/10 to-transparent rounded-2xl p-6 border-l-4 border-franca-green">
            <p className="text-franca-blue text-lg font-medium italic">
              "Centralizando ferramentas, potencializando resultados."
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}