'use client'

import { useState, useEffect } from 'react'
import ToolCard from '@/components/ToolCard'
import AddToolModal from '@/components/AddToolModal'
import { 
  FileText, 
  Upload,
  Download,
  MessageSquare, 
  Bot, 
  FolderOpen, 
  Server, 
  Code, 
  Github, 
  Workflow, 
  Zap,
  Smartphone,
  Database,
  Home,
  Cpu,
  Folder,
  Layers,
  FileCheck,
  Image,
  Plus,
  Loader,
  Trash2,
  ExternalLink
} from 'lucide-react'

const fixedTools = {
  projetos: [
    {
      name: 'Franca Daily',
      description: 'Plataforma de report diária para acompanhamento de métricas e resultados',
      url: 'https://franca-daily.vercel.app',
      icon: FileText,
    },
    {
      name: 'Franca Flow',
      description: 'Sistema de upload de arquivos com fluxo automatizado para clientes',
      url: 'https://franca-flow.vercel.app/api/admin',
      icon: Upload,
    },
    {
      name: 'Video Downloader',
      description: 'Baixe vídeos do YouTube, TikTok, Instagram e mais de 1000 sites',
      url: '/dashboard/downloader',
      icon: Download,
      isInternal: true
    },
  ],
  ia: [
    {
      name: 'ChatGPT',
      description: 'Inteligência artificial da OpenAI para produtividade e criação de conteúdo',
      url: 'https://chatgpt.com/',
      icon: MessageSquare,
    },
    {
      name: 'Claude AI',
      description: 'Assistente de IA da Anthropic para análise e desenvolvimento',
      url: 'https://claude.ai/',
      icon: Bot,
    },
  ],
  dev: [
    {
      name: 'Drive Franca',
      description: 'Documentos, arquivos e recursos compartilhados da empresa',
      url: 'https://drive.google.com/drive/folders/0ABUaieLcZITFUk9PVA',
      icon: FolderOpen,
    },
    {
      name: 'Vercel',
      description: 'Plataforma de deployment e hospedagem dos projetos',
      url: 'https://vercel.com/contato-3393s-projects',
      icon: Server,
    },
    {
      name: 'V0',
      description: 'Ferramenta de geração de interfaces com IA',
      url: 'https://v0.dev/',
      icon: Code,
    },
    {
      name: 'GitHub',
      description: 'Repositórios de código e controle de versão',
      url: 'https://github.com/',
      icon: Github,
    },
    {
      name: 'Supabase',
      description: 'Backend as a Service - banco de dados e autenticação',
      url: 'https://supabase.com/',
      icon: Database,
    },
    {
      name: 'Autentique',
      description: 'Plataforma de assinatura digital de documentos com validade jurídica',
      url: 'https://painel.autentique.com.br/documentos/todos',
      icon: FileCheck,
    },
    {
      name: 'Freepik',
      description: 'Banco de imagens, vetores, ícones e recursos gráficos para designers',
      url: 'https://br.freepik.com/',
      icon: Image,
    },
  ],
  automacao: [
    {
      name: 'n8n',
      description: 'Plataforma de automação de workflows e integrações',
      url: 'https://workflows.francaassessoria.com/home/workflows',
      icon: Workflow,
    },
    {
      name: 'Make',
      description: 'Automação visual de processos e integrações',
      url: 'https://us2.make.com/organization/3203386/dashboard',
      icon: Zap,
    },
    {
      name: 'Uazapi',
      description: 'API e automação para WhatsApp Business',
      url: 'https://uazapi.dev/',
      icon: Smartphone,
    },
  ],
}

const categories = [
  { id: 'projetos', name: 'Projetos Franca', icon: Home },
  { id: 'ia', name: 'Inteligência Artificial', icon: Cpu },
  { id: 'dev', name: 'Desenvolvimento', icon: Folder },
  { id: 'automacao', name: 'Automação', icon: Layers },
]

export default function FerramentasPage() {
  const [activeCategory, setActiveCategory] = useState('projetos')
  const [customTools, setCustomTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadUser()
    loadCustomTools()
  }, [])

  const loadUser = () => {
    const userData = localStorage.getItem('francaverso_user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }

  const loadCustomTools = async () => {
    try {
      const response = await fetch('/api/tools')
      if (response.ok) {
        const data = await response.json()
        setCustomTools(data.tools || [])
      }
    } catch (error) {
      console.error('Error loading custom tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTool = async (toolId) => {
    if (!confirm('Tem certeza que deseja remover esta ferramenta?')) return

    try {
      const response = await fetch(`/api/tools?id=${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCustomTools(prev => prev.filter(t => t.id !== toolId))
        alert('✅ Ferramenta removida com sucesso!')
      } else {
        throw new Error('Erro ao remover')
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('❌ Erro ao remover ferramenta')
    }
  }

  // Combinar ferramentas fixas com customizadas
  const getAllTools = (category) => {
    const fixed = fixedTools[category] || []
    const custom = customTools.filter(t => t.category === category).map(t => ({
      name: t.name,
      description: t.description,
      url: t.url,
      icon: ExternalLink,
      isCustom: true,
      customId: t.id,
      createdBy: t.created_by
    }))
    return [...fixed, ...custom]
  }

  // Contar total de ferramentas
  const totalTools = Object.keys(fixedTools).reduce((acc, key) => {
    return acc + fixedTools[key].length
  }, 0) + customTools.length

  const currentTools = getAllTools(activeCategory)
  const activeTab = categories.find(cat => cat.id === activeCategory)

  if (loading) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <Loader size={48} className="text-franca-green animate-spin" />
      </main>
    )
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-franca-blue mb-2">
            Ferramentas e Sistemas
          </h1>
          <p className="text-gray-600">
            Acesse todas as ferramentas da Franca de forma centralizada
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Adicionar Ferramenta
        </button>
      </div>

      {/* Stats compactos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-green/20">
          <p className="text-xs text-gray-600 mb-1">Ferramentas</p>
          <p className="text-2xl font-bold text-franca-green">{totalTools}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-blue/20">
          <p className="text-xs text-gray-600 mb-1">Disponibilidade</p>
          <p className="text-2xl font-bold text-franca-blue">100%</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <p className="text-xs text-gray-600 mb-1">Status</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-lg font-bold text-green-600">Online</span>
          </div>
        </div>
      </div>

      {/* Botões de Categoria */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            const categoryToolCount = getAllTools(category.id).length
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200'
                }`}
              >
                <Icon size={20} />
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-franca-blue/20' : 'bg-gray-100'
                }`}>
                  {categoryToolCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ferramentas da categoria ativa */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-8 bg-franca-green rounded-full"></div>
          <h2 className="text-2xl font-bold text-franca-blue">{activeTab?.name}</h2>
          <span className="bg-franca-green/20 text-franca-green px-3 py-1 rounded-full text-sm font-semibold">
            {currentTools.length} {currentTools.length === 1 ? 'ferramenta' : 'ferramentas'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTools.map((tool, index) => {
            const canDelete = tool.isCustom && tool.createdBy === currentUser?.id

            return (
              <div key={tool.isCustom ? tool.customId : tool.name} className="relative group">
                {/* Badge CUSTOM */}
                {tool.isCustom && (
                  <div className="absolute -top-2 -right-2 z-10 px-2 py-1 bg-franca-green text-franca-blue text-xs font-bold rounded-full shadow-lg">
                    CUSTOM
                  </div>
                )}

                {/* Botão de deletar */}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteTool(tool.customId)
                    }}
                    className="absolute -top-2 -left-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    title="Remover ferramenta"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <ToolCard {...tool} color="franca-green" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© 2025 Franca. Desenvolvido com 💚 pela equipe de tecnologia.</p>
      </footer>

      {/* Modal de Adicionar */}
      {showAddModal && (
        <AddToolModal
          onClose={() => setShowAddModal(false)}
          onToolAdded={() => {
            loadCustomTools()
          }}
        />
      )}
    </main>
  )
}