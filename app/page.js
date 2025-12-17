'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

const users = [
  { name: 'GABRIEL', role: 'CEO' },
  { name: 'BRUNA', role: 'SOCIAL MEDIA MANAGER' },
  { name: 'LEONARDO', role: 'GESTOR DE TRÁFEGO' },
  { name: 'GUILHERME', role: 'DESIGN LEAD' },
  { name: 'DAVIDSON', role: 'TECH LEAD' },
]

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    
    if (!selectedUser) {
      setError('Por favor, selecione um usuário')
      return
    }

    if (password !== 'franca@2025') {
      setError('Senha incorreta')
      return
    }

    const user = users.find(u => u.name === selectedUser)
    localStorage.setItem('francaverso_user', JSON.stringify(user))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Formas geométricas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-franca-green/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-franca-green-dark/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-franca-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src="/logo.png" alt="Franca Logo" width="60" height="60" className="drop-shadow-lg" />
              <h1 className="text-4xl font-bold text-franca-blue">FRANCAVERSO</h1>
            </div>
            <p className="text-franca-green-dark text-sm font-medium">Portal de Ferramentas e Sistemas</p>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-franca-green/20 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-semibold text-franca-blue mb-6 text-center">Bem-vindo de volta! 👋</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Select de Usuário */}
            <div>
              <label className="block text-sm font-medium text-franca-blue mb-2">
                Selecione seu usuário
              </label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all bg-white text-franca-blue"
              >
                <option value="">-- Escolha seu nome --</option>
                {users.map((user) => (
                  <option key={user.name} value={user.name}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Input de Senha */}
            <div>
              <label className="block text-sm font-medium text-franca-blue mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all"
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>Entrar no Francaverso</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-franca-blue/60 text-sm mt-6 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          © 2024 Franca. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
