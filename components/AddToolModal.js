'use client'

import { useState } from 'react'
import { X, Plus, Loader, Link as LinkIcon } from 'lucide-react'

export default function AddToolModal({ onClose, onToolAdded }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [creating, setCreating] = useState(false)

  const categories = [
    { value: 'projetos', label: '📊 Gerenciamento de Projetos' },
    { value: 'ia', label: '🤖 Inteligência Artificial' },
    { value: 'dev', label: '💻 Desenvolvimento' },
    { value: 'automacao', label: '⚡ Automação' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !description || !url || !category) {
      alert('Preencha todos os campos!')
      return
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      alert('URL inválida! Exemplo: https://exemplo.com')
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          url: url.trim(),
          category,
          icon_name: 'Link'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar ferramenta')
      }

      // Notificar parent component
      if (onToolAdded) onToolAdded(data.tool)

      alert('✅ Ferramenta criada com sucesso!')
      onClose()

    } catch (error) {
      console.error('Error creating tool:', error)
      alert(error.message || 'Erro ao criar ferramenta')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-franca-blue flex items-center">
            <Plus className="mr-2 text-franca-green" size={28} />
            Adicionar Nova Ferramenta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da Ferramenta *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Notion, Figma, ChatGPT..."
              disabled={creating}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
              maxLength={50}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                disabled={creating}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A URL deve começar com http:// ou https://
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o que a ferramenta faz..."
              disabled={creating}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all resize-none disabled:opacity-50"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 caracteres
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica:</strong> A ferramenta ficará visível para todos os usuários da Franca!
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !name || !description || !url || !category}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {creating ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus size={20} className="mr-2" />
                  Criar Ferramenta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}