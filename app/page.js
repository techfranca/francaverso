'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogIn, Loader } from 'lucide-react'

const users = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'GABRIEL', role: 'CEO' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'BRUNA', role: 'SOCIAL MEDIA MANAGER' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'LEONARDO', role: 'GESTOR DE TRÁFEGO' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'GUILHERME', role: 'DESIGN LEAD' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'DAVIDSON', role: 'TECH LEAD' },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedUser) {
      setError('Por favor, selecione um usuário')
      return
    }

    if (!password) {
      setError('Por favor, digite a senha')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        return
      }

      // ✅ CRIAR O COOKIE (ESSENCIAL PARA SERVER-SIDE AUTH)
      document.cookie = `francaverso_session=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      
      // Salvar sessão localmente também (fallback)
      localStorage.setItem('francaverso_user', JSON.stringify(data.user))

      // Redirecionar para dashboard
      router.push('/dashboard')
      router.refresh()

    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light flex items-center justify-center p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-franca-green/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-franca-green-dark/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Card de Login */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img src="/logo.png" alt="Franca Logo" width="80" height="80" className="drop-shadow-lg animate-float" />
          </div>
          <h1 className="text-3xl font-bold text-franca-blue mb-2">FRANCAVERSO</h1>
          <p className="text-gray-600">Portal de Ferramentas Franca</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Select de Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione seu usuário
            </label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent appearance-none transition-all bg-white disabled:opacity-50"
              >
                <option value="">Escolha um usuário...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Campo de Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Digite a senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={20} className="mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={20} className="mr-2" />
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Desenvolvido com 💚 pela equipe Franca
          </p>
        </div>
      </div>
    </div>
  )
}