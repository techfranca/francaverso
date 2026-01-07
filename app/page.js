'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader, Mail } from 'lucide-react'
import { auth, googleProvider } from '@/lib/firebase/config'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Verificar se já está logado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário já logado, sincronizar com Supabase e redirecionar
        await syncUserWithSupabase(user)
        router.push('/dashboard')
        router.refresh()
      }
      setCheckingSession(false)
    })

    return () => unsubscribe()
  }, [router])

  const syncUserWithSupabase = async (firebaseUser) => {
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photo: firebaseUser.photoURL
        })
      })

      const data = await response.json()
      
      if (data.user) {
        localStorage.setItem('francaverso_user', JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Sincronizar com Supabase (criar usuário no banco se não existir)
      await syncUserWithSupabase(user)

      // Criar cookie de sessão
      document.cookie = `francaverso_session=${user.uid}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

      // Redirecionar para dashboard
      router.push('/dashboard')
      router.refresh()

    } catch (error) {
      console.error('Erro no login:', error)
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado. Tente novamente.')
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup bloqueado. Permita popups para este site.')
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light flex items-center justify-center">
        <Loader size={40} className="animate-spin text-franca-blue" />
      </div>
    )
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

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Botão de Login com Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-200 hover:border-franca-green text-gray-700 font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
        >
          {loading ? (
            <>
              <Loader size={24} className="animate-spin" />
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Entrar com Google</span>
            </>
          )}
        </button>

        {/* Informação */}
        <div className="mt-6 p-4 bg-franca-green-light rounded-xl">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-franca-green-dark mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-franca-blue font-medium mb-1">Acesso rápido</p>
              <p className="text-xs text-gray-600">
                Use sua conta Google para acessar o Francaverso de forma rápida e segura.
              </p>
            </div>
          </div>
        </div>

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
