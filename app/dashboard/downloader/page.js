'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
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
  Film
} from 'lucide-react'

const API_URL = '/api'

export default function DownloaderPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [urls, setUrls] = useState([''])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [apiStatus, setApiStatus] = useState('checking')
  
  // Estados de progresso
  const [currentJob, setCurrentJob] = useState(null)
  const [jobProgress, setJobProgress] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('francaverso_user')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))

    checkApiStatus()
    loadHistory()
  }, [router])

  // Polling de progresso
  useEffect(() => {
    if (!currentJob) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/download?jobId=${currentJob}`)
        if (response.ok) {
          const data = await response.json()
          setJobProgress(data)

          // Se completou, parar polling
          if (data.status === 'completed') {
            setResults(data.results)
            setLoading(false)
            setCurrentJob(null)
            setJobProgress(null)
            loadHistory()
            setUrls([''])
          }
        }
      } catch (error) {
        console.error('Erro ao verificar progresso:', error)
      }
    }, 500) // Atualizar a cada 500ms

    return () => clearInterval(interval)
  }, [currentJob])

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      if (response.ok) {
        setApiStatus('online')
      } else {
        setApiStatus('offline')
      }
    } catch (error) {
      setApiStatus('offline')
    }
  }

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/downloads`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

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

    if (apiStatus !== 'online') {
      alert('Backend está offline! Por favor, inicie o servidor backend.')
      return
    }

    setLoading(true)
    setResults([])
    setJobProgress(null)

    try {
      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: validUrls })
      })

      if (!response.ok) {
        throw new Error('Erro ao processar downloads')
      }

      const data = await response.json()
      setCurrentJob(data.jobId)

    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao baixar vídeos: ' + error.message)
      setLoading(false)
    }
  }

  const handleDownloadFile = (downloadUrl) => {
    window.open(downloadUrl, '_blank')
  }

  const handleDeleteFile = async (filename) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/downloads/${filename}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadHistory()
        alert('Arquivo deletado com sucesso!')
      }
    } catch (error) {
      alert('Erro ao deletar arquivo')
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-franca-blue mb-2">
            Video Downloader
          </h1>
          <p className="text-gray-600">
            Baixe vídeos do YouTube, TikTok, Instagram e mais de 1000 sites
          </p>
        </div>

        {/* Status da API */}
        <div className="mb-6 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
            apiStatus === 'online' 
              ? 'bg-green-50 border border-green-200' 
              : apiStatus === 'offline'
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              apiStatus === 'online' 
                ? 'bg-green-500 animate-pulse' 
                : apiStatus === 'offline'
                ? 'bg-red-500'
                : 'bg-gray-400'
            }`}></span>
            <span className={`text-sm font-medium ${
              apiStatus === 'online' 
                ? 'text-green-700' 
                : apiStatus === 'offline'
                ? 'text-red-700'
                : 'text-gray-700'
            }`}>
              {apiStatus === 'online' && 'Backend Online'}
              {apiStatus === 'offline' && 'Backend Offline'}
              {apiStatus === 'checking' && 'Verificando backend...'}
            </span>
          </div>
        </div>

        {/* Card de Download */}
        <div className="max-w-4xl mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-semibold text-franca-blue mb-6 flex items-center">
              <Download className="mr-2 text-franca-green" size={24} />
              Adicionar Links para Download
            </h2>

            <div className="space-y-4 mb-6">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder="Cole o link do vídeo aqui (YouTube, TikTok, Instagram, etc)"
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all"
                      disabled={loading}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      {getPlatformIcon(url)}
                    </div>
                  </div>
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                      disabled={loading}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={addUrlField}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                <Plus size={20} className="mr-2" />
                Adicionar Mais Links
              </button>

              <button
                onClick={handleDownload}
                disabled={loading || apiStatus !== 'online'}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download size={20} className="mr-2" />
                    Baixar Todos
                  </>
                )}
              </button>
            </div>

            {/* Barra de Progresso */}
            {loading && jobProgress && (
              <div className="mt-6 space-y-4">
                {/* Progresso Geral */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progresso Geral: {jobProgress.completed}/{jobProgress.total} vídeos
                    </span>
                    <span className="text-sm font-bold text-franca-green">
                      {Math.round((jobProgress.completed / jobProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-franca-green to-franca-green-hover h-full rounded-full transition-all duration-300"
                      style={{ width: `${(jobProgress.completed / jobProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progresso do Vídeo Atual */}
                {jobProgress.current && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <Loader className="text-blue-500 animate-spin flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 truncate">
                          {jobProgress.current.title || jobProgress.current.url}
                        </p>
                        <p className="text-xs text-blue-600">
                          Vídeo {jobProgress.current.index}/{jobProgress.current.total}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${jobProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 text-right font-medium">
                      {jobProgress.progress.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dicas */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium mb-2">💡 Plataformas suportadas:</p>
              <p className="text-sm text-blue-600">
                YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, Dailymotion e mais de 1000 sites!
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="max-w-4xl mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
              <h2 className="text-xl font-semibold text-franca-blue mb-6">
                Resultados do Download
              </h2>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {result.status === 'success' ? (
                        <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                      ) : (
                        <XCircle className="text-red-500 flex-shrink-0" size={24} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        {result.status === 'success' ? (
                          <p className="text-sm text-gray-600">
                            {result.platform} • {result.filename}
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">
                            Erro: {result.error}
                          </p>
                        )}
                      </div>
                    </div>

                    {result.status === 'success' && (
                      <button
                        onClick={() => handleDownloadFile(result.downloadUrl)}
                        className="px-4 py-2 bg-franca-green text-franca-blue font-semibold rounded-lg hover:bg-franca-green-hover transition-all ml-4"
                      >
                        Baixar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Histórico */}
        {history.length > 0 && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
              <h2 className="text-xl font-semibold text-franca-blue mb-6">
                Histórico de Downloads
              </h2>

              <div className="space-y-3">
                {history.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <Film className="text-franca-green flex-shrink-0" size={24} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)} • {new Date(file.created).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadFile(file.downloadUrl)}
                        className="px-4 py-2 bg-franca-green text-franca-blue font-semibold rounded-lg hover:bg-franca-green-hover transition-all"
                      >
                        Baixar
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.filename)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}