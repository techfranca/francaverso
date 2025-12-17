'use client'

import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-franca-green-light to-franca-blue-light">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-franca-green">404</h1>
          <h2 className="text-3xl font-semibold text-franca-blue mt-4 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Home size={20} />
          <span>Voltar para o início</span>
        </button>
      </div>
    </div>
  )
}
