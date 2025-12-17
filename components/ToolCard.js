'use client'

import { ExternalLink } from 'lucide-react'

export default function ToolCard({ name, description, url, icon: Icon, color = 'franca-green' }) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer group border-2 border-transparent hover:border-franca-green transform hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br from-${color} to-${color}-dark rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} className="text-white" />
        </div>
        <ExternalLink size={18} className="text-gray-400 group-hover:text-franca-green transition-colors" />
      </div>

      <h3 className="text-lg font-semibold text-franca-blue mb-2 group-hover:text-franca-green transition-colors">
        {name}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>

      {/* Barra de status */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-500">Online</span>
        </span>
        <span className="text-xs text-franca-green font-medium group-hover:underline">
          Acessar →
        </span>
      </div>
    </div>
  )
}
