'use client'

import { useState } from 'react'
import { 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader,
  Link as LinkIcon,
  Youtube,
  Instagram,
  Film,
  ExternalLink,
  Copy,
  Check,
  ArrowRightCircle
} from 'lucide-react'

export default function DownloaderPage() {
  const [urls, setUrls] = useState([''])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)

  const addUrlField = () => {
    setUrls([...urls, ''])
  }

  const removeUrlField = (index) => {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls.length > 0 ? newUrls : [''])
  }

  const updateUrl = (index, value) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleDownload = async () => {
    const validUrls = urls.filter(url => url.trim() !== '')

    if (validUrls.length === 0) {
      alert('Por favor, adicione pelo menos um link válido!')
      return
    }

    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: validUrls })
      })

      if (response.status === 401) {
        throw new Error('Você precisa estar logado para baixar vídeos.')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar downloads')
      }

      const data = await response.json()
      setResults(data.results || [])
      
      // Limpa os campos apenas se houver sucesso
      if (data.results.length > 0) {
        setUrls([''])
      }

    } catch (error) {
      console.error('Erro:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (result) => {
    if (result.status === 'redirect' && result.cobaltUrl) {
      window.open(result.cobaltUrl, '_blank')
    } else if (result.status === 'success' && result.downloadUrl) {
      // Cria um link temporário para forçar o download
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = result.filename || 'video.mp4'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyLink = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const getPlatformIcon = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <Youtube size={20} className="text-red-500" />
    } else if (url.includes('instagram.com')) {
      return <Instagram size={20} className="text-pink-500" />
    } else if (url.includes('tiktok.com')) {
      return <Film size={20} className="text-black" />
    }
    return <LinkIcon size={20} className="text-gray-500" />
  }

  const getPlatformColor = (platform) => {
    const colors = {
      'YouTube': 'bg-red-100 text-red-700',
      'Instagram': 'bg-pink-100 text-pink-700',
      'TikTok': 'bg-gray-100 text-gray-700',
      'Twitter/X': 'bg-blue-100 text-blue-700',
      'Facebook': 'bg-blue-100 text-blue-700',
    }
    return colors[platform] || 'bg-gray-100 text-gray-700'
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-franca-blue mb-2">
          Video Downloader
        </h1>
        <p className="text-gray-600">
          Baixe vídeos do YouTube, TikTok, Instagram e mais.
        </p>
      </div>

      {/* Input de URLs */}
      <div className="max-w-4xl mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-franca-blue mb-6">
            Cole os links dos vídeos
          </h2>

          <div className="space-y-4">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {getPlatformIcon(url)}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-franca-green focus:outline-none transition-all text-gray-700"
                    disabled={loading}
                  />
                </div>
                
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrlField(index)}
                    className="px-4 py-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                    disabled={loading}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={addUrlField}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              disabled={loading}
            >
              <Plus size={20} />
              <span>Adicionar Link</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || urls.every(u => !u.trim())}
              className="flex-1 flex items-center justify-center space-x-3 px-6 py-3 bg-franca-green text-franca-blue font-bold rounded-xl hover:bg-franca-green-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Baixar Vídeos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="max-w-4xl pb-10">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-franca-blue mb-6">
              Resultados
            </h2>

            <div className="space-y-4">
              {results.map((result, index) => {
                const isSuccess = result.status === 'success' || result.status === 'redirect'
                const isRedirect = result.status === 'redirect'

                return (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border-2 ${
                      isSuccess
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {isSuccess ? (
                          <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                        ) : (
                          <XCircle className="text-red-500 flex-shrink-0" size={24} />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate mb-1">
                            {result.title || result.url}
                          </p>
                          
                          {isSuccess ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPlatformColor(result.platform)}`}>
                                {result.platform}
                              </span>
                              {isRedirect && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                  Externo
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-red-600">
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSuccess && (
                        <div className="flex gap-2 flex-shrink-0">
                          {/* Botão Copiar Link (só mostra se for Local e tiver link) */}
                          {!isRedirect && result.downloadUrl && (
                            <button
                              onClick={() => handleCopyLink(window.location.origin + result.downloadUrl, index)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                              title="Copiar link do arquivo"
                            >
                              {copiedIndex === index ? (
                                <Check size={20} className="text-green-500" />
                              ) : (
                                <Copy size={20} />
                              )}
                            </button>
                          )}

                          {/* Botão Principal de Ação */}
                          <button
                            onClick={() => handleAction(result)}
                            className="flex items-center gap-2 px-4 py-2 bg-franca-green text-franca-blue font-semibold rounded-lg hover:bg-franca-green-hover transition-all"
                          >
                            {isRedirect ? (
                              <>
                                <ExternalLink size={18} />
                                <span>Abrir no Cobalt</span>
                              </>
                            ) : (
                              <>
                                <Download size={18} />
                                <span>Salvar Arquivo</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rodapé informativo */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p>
                <strong>ℹ️ Nota:</strong> Arquivos baixados localmente ficam salvos na pasta <code>public/downloads</code> do projeto.
                Links externos abrem o Cobalt Tools para processamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}