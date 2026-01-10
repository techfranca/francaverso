'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiExternalLink, 
  FiFilter, FiPhone, FiMail, FiCalendar, FiDollarSign, FiFolder,
  FiEye, FiEyeOff, FiCopy, FiCheck, FiKey, FiLock, FiShield,
  FiInstagram, FiFacebook
} from 'react-icons/fi'

// Segmentos disponíveis
const SEGMENTOS = [
  { value: 'ecommerce', label: 'E-commerce', color: 'from-blue-500 to-cyan-500' },
  { value: 'infoproduto', label: 'Infoproduto', color: 'from-purple-500 to-pink-500' },
  { value: 'negocio_local', label: 'Negócio Local', color: 'from-orange-500 to-amber-500' },
  { value: 'inside_sales', label: 'Inside Sales', color: 'from-green-500 to-emerald-500' },
  { value: 'lancamento', label: 'Lançamento', color: 'from-red-500 to-rose-500' },
  { value: 'food_service', label: 'Food Service', color: 'from-yellow-500 to-orange-500' },
  { value: 'servicos_online', label: 'Serviços Online', color: 'from-indigo-500 to-violet-500' },
]

// Sugestões de plataformas por segmento
const PLATFORM_SUGGESTIONS = {
  ecommerce: ['Shopify', 'Nuvemshop', 'WooCommerce', 'VTEX', 'Tray', 'Loja Integrada', 'Mercado Livre', 'Amazon'],
  infoproduto: ['Hotmart', 'Eduzz', 'Monetizze', 'Kiwify', 'Braip', 'Perfect Pay', 'Lastlink'],
  negocio_local: ['RD Station', 'Pipedrive', 'HubSpot', 'Kommo', 'Bitrix24', 'Pipefy'],
  inside_sales: ['RD Station', 'Pipedrive', 'HubSpot', 'Kommo', 'Bitrix24', 'Salesforce'],
  lancamento: ['Hotmart', 'Eduzz', 'ActiveCampaign', 'RD Station', 'Leadlovers'],
  food_service: ['iFood', 'Rappi', 'Goomer', 'Neemo', 'Anota Aí'],
  servicos_online: ['Calendly', 'Notion', 'Trello', 'Asana', 'Monday'],
}

// Credenciais padrão que todos os clientes devem ter
const STANDARD_CREDENTIALS = [
  { platform_name: 'Instagram', credential_type: 'standard', icon: 'instagram' },
  { platform_name: 'Facebook', credential_type: 'standard', icon: 'facebook' },
  { platform_name: 'E-mail', credential_type: 'standard', icon: 'email' },
]

// Status
const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo', color: 'bg-green-500' },
  { value: 'pausado', label: 'Pausado', color: 'bg-yellow-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
]

// Componente de Badge para credenciais
function CredentialBadge({ count }) {
  if (!count || count === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
      <FiKey className="w-3 h-3" />
      Acessos
    </span>
  )
}

// Componente de Card de Credencial (modo visualização)
function CredentialCard({ credential, onCopy }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState({ login: false, password: false })

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [field]: true }))
      onCopy?.(`${credential.platform_name} - ${field}`)
      setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const getIcon = () => {
    const name = credential.platform_name?.toLowerCase()
    if (name?.includes('instagram')) return <FiInstagram className="w-5 h-5 text-pink-400" />
    if (name?.includes('facebook')) return <FiFacebook className="w-5 h-5 text-blue-400" />
    if (name?.includes('email') || name?.includes('e-mail')) return <FiMail className="w-5 h-5 text-amber-400" />
    return <FiKey className="w-5 h-5 text-violet-400" />
  }

  return (
    <div className="bg-[#1a1a2e]/50 rounded-lg p-4 border border-violet-500/20 hover:border-violet-500/40 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-violet-500/10">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-white">{credential.platform_name}</h4>
          <span className="text-xs text-gray-500">
            {credential.credential_type === 'standard' ? 'Padrão' : 'Personalizado'}
          </span>
        </div>
      </div>

      {credential.login && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400 w-16">Login:</span>
          <span className="text-sm text-gray-200 flex-1 truncate">{credential.login}</span>
          <button
            onClick={() => handleCopy(credential.login, 'login')}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Copiar login"
          >
            {copied.login ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      )}

      {credential.password && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-16">Senha:</span>
          <span className="text-sm text-gray-200 flex-1 truncate font-mono">
            {showPassword ? credential.password : '••••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={() => handleCopy(credential.password, 'password')}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Copiar senha"
          >
            {copied.password ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      )}

      {credential.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">{credential.notes}</p>
      )}
    </div>
  )
}

// Componente de Form de Credencial (modo edição)
function CredentialFormCard({ credential, index, onChange, onRemove, isStandard }) {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field, value) => {
    onChange(index, { ...credential, [field]: value })
  }

  const getIcon = () => {
    const name = credential.platform_name?.toLowerCase()
    if (name?.includes('instagram')) return <FiInstagram className="w-5 h-5 text-pink-400" />
    if (name?.includes('facebook')) return <FiFacebook className="w-5 h-5 text-blue-400" />
    if (name?.includes('email') || name?.includes('e-mail')) return <FiMail className="w-5 h-5 text-amber-400" />
    return <FiKey className="w-5 h-5 text-violet-400" />
  }

  return (
    <div className="bg-[#1a1a2e]/50 rounded-lg p-4 border border-violet-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            {getIcon()}
          </div>
          {isStandard ? (
            <div>
              <h4 className="font-medium text-white">{credential.platform_name}</h4>
              <span className="text-xs text-violet-400">Credencial padrão</span>
            </div>
          ) : (
            <input
              type="text"
              value={credential.platform_name}
              onChange={(e) => handleChange('platform_name', e.target.value)}
              placeholder="Nome da plataforma"
              className="bg-transparent border-b border-gray-600 focus:border-violet-500 text-white placeholder-gray-500 outline-none px-1 py-0.5"
            />
          )}
        </div>
        {!isStandard && (
          <button
            onClick={() => onRemove(index)}
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
            title="Remover credencial"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Login / Usuário</label>
          <input
            type="text"
            value={credential.login || ''}
            onChange={(e) => handleChange('login', e.target.value)}
            placeholder="Digite o login"
            className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-violet-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={credential.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Digite a senha"
              className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-500 focus:border-violet-500 outline-none text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Notas (opcional)</label>
          <input
            type="text"
            value={credential.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Observações adicionais"
            className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-violet-500 outline-none text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// Componente Cofre de Acessos
function CredentialsVault({ credentials, isEditing, onChange, segmento }) {
  const [copiedMessage, setCopiedMessage] = useState('')

  const handleCopy = (message) => {
    setCopiedMessage(message)
    setTimeout(() => setCopiedMessage(''), 2000)
  }

  const handleAddCredential = (platformName = '') => {
    const newCredential = {
      platform_name: platformName,
      credential_type: 'custom',
      login: '',
      password: '',
      notes: ''
    }
    onChange([...credentials, newCredential])
  }

  const handleRemoveCredential = (index) => {
    const newCredentials = credentials.filter((_, i) => i !== index)
    onChange(newCredentials)
  }

  const handleCredentialChange = (index, updatedCredential) => {
    const newCredentials = [...credentials]
    newCredentials[index] = updatedCredential
    onChange(newCredentials)
  }

  const suggestions = PLATFORM_SUGGESTIONS[segmento] || []
  const usedPlatforms = credentials.map(c => c.platform_name?.toLowerCase())
  const availableSuggestions = suggestions.filter(s => !usedPlatforms.includes(s.toLowerCase()))

  if (!isEditing) {
    // Modo visualização
    const filledCredentials = credentials.filter(c => c.login || c.password)
    
    if (filledCredentials.length === 0) {
      return (
        <div className="text-center py-8">
          <FiLock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum acesso cadastrado</p>
          <p className="text-sm text-gray-500 mt-1">Edite o cliente para adicionar credenciais</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {copiedMessage && (
          <div className="fixed bottom-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
            <FiCheck className="inline-block mr-2" />
            Copiado: {copiedMessage}
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Credenciais Salvas</h3>
        </div>

        <div className="grid gap-3">
          {filledCredentials.map((cred, index) => (
            <CredentialCard key={index} credential={cred} onCopy={handleCopy} />
          ))}
        </div>
      </div>
    )
  }

  // Modo edição
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiKey className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Gerenciar Acessos</h3>
      </div>

      {/* Credenciais padrão */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Credenciais Padrão</p>
        {credentials
          .filter(c => c.credential_type === 'standard')
          .map((cred, index) => {
            const realIndex = credentials.findIndex(c => c === cred)
            return (
              <CredentialFormCard
                key={`standard-${index}`}
                credential={cred}
                index={realIndex}
                onChange={handleCredentialChange}
                onRemove={handleRemoveCredential}
                isStandard={true}
              />
            )
          })}
      </div>

      {/* Credenciais personalizadas */}
      <div className="space-y-3 mt-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Credenciais Adicionais</p>
        {credentials
          .filter(c => c.credential_type !== 'standard')
          .map((cred, index) => {
            const realIndex = credentials.findIndex(c => c === cred)
            return (
              <CredentialFormCard
                key={`custom-${index}`}
                credential={cred}
                index={realIndex}
                onChange={handleCredentialChange}
                onRemove={handleRemoveCredential}
                isStandard={false}
              />
            )
          })}
      </div>

      {/* Sugestões e botão adicionar */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-3">Adicionar novo acesso:</p>
        
        {availableSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {availableSuggestions.slice(0, 5).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => handleAddCredential(platform)}
                className="px-3 py-1.5 text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 transition-colors"
              >
                + {platform}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => handleAddCredential('')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 rounded-lg border border-violet-500/30 transition-colors text-sm"
        >
          <FiPlus className="w-4 h-4" />
          Adicionar Acesso Personalizado
        </button>
      </div>
    </div>
  )
}

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterSegmento, setFilterSegmento] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('view') // 'view', 'add', 'edit'
  const [selectedClient, setSelectedClient] = useState(null)
  const [activeTab, setActiveTab] = useState('info') // 'info', 'credentials'
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({})
  const [credentials, setCredentials] = useState([])

  // Fetch clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'todos') params.append('status', filterStatus)
      if (filterSegmento !== 'todos') params.append('segmento', filterSegmento)
      if (search) params.append('search', search)

      const res = await fetch(`/api/clientes?${params}`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setClients(data.clients || [])
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      setError('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterSegmento, search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Fetch credentials for a client
  const fetchCredentials = async (clientId) => {
    try {
      const res = await fetch(`/api/clientes/credentials?client_id=${clientId}`)
      const data = await res.json()
      return data.credentials || []
    } catch (err) {
      console.error('Erro ao buscar credenciais:', err)
      return []
    }
  }

  // Initialize credentials with standards
  const initializeCredentials = (existingCredentials = []) => {
    const standardPlatforms = STANDARD_CREDENTIALS.map(s => s.platform_name.toLowerCase())
    const existingPlatforms = existingCredentials.map(c => c.platform_name?.toLowerCase())
    
    // Add missing standard credentials
    const missingStandards = STANDARD_CREDENTIALS
      .filter(s => !existingPlatforms.includes(s.platform_name.toLowerCase()))
      .map(s => ({
        platform_name: s.platform_name,
        credential_type: 'standard',
        login: '',
        password: '',
        notes: ''
      }))
    
    // Mark existing standard credentials
    const markedExisting = existingCredentials.map(c => ({
      ...c,
      credential_type: standardPlatforms.includes(c.platform_name?.toLowerCase()) ? 'standard' : 'custom'
    }))
    
    // Standards first, then custom
    const standards = [...missingStandards, ...markedExisting.filter(c => c.credential_type === 'standard')]
    const customs = markedExisting.filter(c => c.credential_type !== 'standard')
    
    return [...standards, ...customs]
  }

  // Open modal
  const openModal = async (mode, client = null) => {
    setModalMode(mode)
    setSelectedClient(client)
    setActiveTab('info')
    
    if (mode === 'add') {
      setFormData({
        nome_empresa: '',
        nome_cliente: '',
        tag: '',
        segmento: '',
        status: 'ativo',
        telefone: '',
        email: '',
        valor_servico: '',
        dia_pagamento: '',
        data_inicio: '',
        data_encerramento: '',
        servicos_contratados: '',
        observacoes: '',
        aniversario: '',
        faturamento_medio: '',
      })
      setCredentials(initializeCredentials([]))
    } else if (client) {
      setFormData({ ...client })
      const existingCredentials = await fetchCredentials(client.id)
      setCredentials(initializeCredentials(existingCredentials))
    }
    
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedClient(null)
    setFormData({})
    setCredentials([])
    setActiveTab('info')
  }

  // Handle form change
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Save client
  const handleSave = async () => {
    try {
      setSaving(true)
      
      const payload = {
        ...formData,
        credentials
      }

      const isEdit = modalMode === 'edit' && selectedClient?.id
      const url = '/api/clientes'
      const method = isEdit ? 'PUT' : 'POST'

      if (isEdit) {
        payload.id = selectedClient.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      await fetchClients()
      closeModal()
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      setError('Erro ao salvar cliente')
    } finally {
      setSaving(false)
    }
  }

  // Delete client
  const handleDelete = async (clientId) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      const res = await fetch(`/api/clientes?id=${clientId}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      await fetchClients()
      if (selectedClient?.id === clientId) {
        closeModal()
      }
    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
      setError('Erro ao excluir cliente')
    }
  }

  // Get segmento info
  const getSegmentoInfo = (segmento) => {
    return SEGMENTOS.find(s => s.value === segmento) || { label: segmento, color: 'from-gray-500 to-gray-600' }
  }

  // Get status info
  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'bg-gray-500' }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm">Gerencie sua carteira de clientes</p>
        </div>
        
        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg shadow-violet-500/25"
        >
          <FiPlus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 mb-6 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-violet-500 outline-none"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showFilters ? 'bg-violet-600 border-violet-500 text-white' : 'bg-[#0d0d1a] border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-violet-500 outline-none"
              >
                <option value="todos">Todos</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Segmento</label>
              <select
                value={filterSegmento}
                onChange={(e) => setFilterSegmento(e.target.value)}
                className="bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-violet-500 outline-none"
              >
                <option value="todos">Todos</option>
                {SEGMENTOS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError('')} className="float-right">
            <FiX />
          </button>
        </div>
      )}

      {/* Clients Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const segmento = getSegmentoInfo(client.segmento)
            const status = getStatusInfo(client.status)
            
            return (
              <div
                key={client.id}
                onClick={() => openModal('view', client)}
                className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800 hover:border-violet-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                      {client.nome_empresa}
                    </h3>
                    {client.tag && (
                      <span className="text-xs text-gray-500">@{client.tag}</span>
                    )}
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} title={status.label}></div>
                </div>

                {client.nome_cliente && (
                  <p className="text-sm text-gray-400 mb-3 truncate">{client.nome_cliente}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${segmento.color} text-white`}>
                    {segmento.label}
                  </span>
                  <CredentialBadge count={client.credentials_count} />
                </div>

                {client.valor_servico && (
                  <div className="flex items-center gap-1 mt-3 text-sm text-green-400">
                    <FiDollarSign className="w-4 h-4" />
                    <span>R$ {Number(client.valor_servico).toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {modalMode === 'add' ? 'Novo Cliente' : modalMode === 'edit' ? 'Editar Cliente' : formData.nome_empresa}
              </h2>
              <div className="flex items-center gap-2">
                {modalMode === 'view' && (
                  <>
                    <button
                      onClick={() => setModalMode('edit')}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedClient?.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'info' 
                    ? 'text-violet-400 border-b-2 border-violet-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'credentials' 
                    ? 'text-violet-400 border-b-2 border-violet-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiKey className="w-4 h-4" />
                Cofre de Acessos
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {activeTab === 'info' ? (
                modalMode === 'view' ? (
                  // View Mode - Info
                  <div className="space-y-4">
                    {formData.nome_cliente && (
                      <div>
                        <label className="text-xs text-gray-400">Responsável</label>
                        <p className="text-white">{formData.nome_cliente}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {formData.telefone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiPhone className="w-4 h-4 text-gray-500" />
                          <span>{formData.telefone}</span>
                        </div>
                      )}
                      {formData.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <FiMail className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{formData.email}</span>
                        </div>
                      )}
                    </div>

                    {formData.segmento && (
                      <div>
                        <label className="text-xs text-gray-400">Segmento</label>
                        <p className="text-white">{getSegmentoInfo(formData.segmento).label}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {formData.valor_servico && (
                        <div>
                          <label className="text-xs text-gray-400">Valor do Serviço</label>
                          <p className="text-green-400">R$ {Number(formData.valor_servico).toLocaleString('pt-BR')}</p>
                        </div>
                      )}
                      {formData.dia_pagamento && (
                        <div>
                          <label className="text-xs text-gray-400">Dia do Pagamento</label>
                          <p className="text-white">Dia {formData.dia_pagamento}</p>
                        </div>
                      )}
                    </div>

                    {formData.servicos_contratados && (
                      <div>
                        <label className="text-xs text-gray-400">Serviços Contratados</label>
                        <p className="text-white">{formData.servicos_contratados}</p>
                      </div>
                    )}

                    {formData.observacoes && (
                      <div>
                        <label className="text-xs text-gray-400">Observações</label>
                        <p className="text-gray-300">{formData.observacoes}</p>
                      </div>
                    )}

                    {formData.pasta_drive && (
                      <a
                        href={formData.pasta_drive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        <FiFolder className="w-4 h-4" />
                        Abrir pasta no Drive
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  // Edit/Add Mode - Info Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Nome da Empresa *</label>
                        <input
                          type="text"
                          value={formData.nome_empresa || ''}
                          onChange={(e) => handleFormChange('nome_empresa', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Tag / Identificador</label>
                        <input
                          type="text"
                          value={formData.tag || ''}
                          onChange={(e) => handleFormChange('tag', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                          placeholder="@tag"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Nome do Responsável</label>
                      <input
                        type="text"
                        value={formData.nome_cliente || ''}
                        onChange={(e) => handleFormChange('nome_cliente', e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Telefone</label>
                        <input
                          type="text"
                          value={formData.telefone || ''}
                          onChange={(e) => handleFormChange('telefone', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">E-mail</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Segmento *</label>
                        <select
                          value={formData.segmento || ''}
                          onChange={(e) => handleFormChange('segmento', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                          required
                        >
                          <option value="">Selecione...</option>
                          {SEGMENTOS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Status</label>
                        <select
                          value={formData.status || 'ativo'}
                          onChange={(e) => handleFormChange('status', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Valor do Serviço (R$)</label>
                        <input
                          type="number"
                          value={formData.valor_servico || ''}
                          onChange={(e) => handleFormChange('valor_servico', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Dia do Pagamento</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.dia_pagamento || ''}
                          onChange={(e) => handleFormChange('dia_pagamento', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Data de Início</label>
                        <input
                          type="date"
                          value={formData.data_inicio || ''}
                          onChange={(e) => handleFormChange('data_inicio', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Aniversário do Cliente</label>
                        <input
                          type="date"
                          value={formData.aniversario || ''}
                          onChange={(e) => handleFormChange('aniversario', e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Serviços Contratados</label>
                      <input
                        type="text"
                        value={formData.servicos_contratados || ''}
                        onChange={(e) => handleFormChange('servicos_contratados', e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                        placeholder="Ex: Social Media, Tráfego Pago, Copywriting"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Faturamento Médio (R$)</label>
                      <input
                        type="number"
                        value={formData.faturamento_medio || ''}
                        onChange={(e) => handleFormChange('faturamento_medio', e.target.value)}
                        className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Observações</label>
                      <textarea
                        value={formData.observacoes || ''}
                        onChange={(e) => handleFormChange('observacoes', e.target.value)}
                        rows={3}
                        className="w-full bg-[#0d0d1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-violet-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                )
              ) : (
                // Credentials Tab
                <CredentialsVault
                  credentials={credentials}
                  isEditing={modalMode !== 'view'}
                  onChange={setCredentials}
                  segmento={formData.segmento}
                />
              )}
            </div>

            {/* Modal Footer */}
            {modalMode !== 'view' && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
