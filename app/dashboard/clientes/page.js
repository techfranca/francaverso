'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Tag,
  Briefcase,
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
  Users,
  Loader,
  ChevronDown,
  Cake,
  Hash,
  Plus,
  Edit3,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [segmentoFilter, setSegmentoFilter] = useState('todos')
  const [selectedClient, setSelectedClient] = useState(null)
  
  // Estados para modais
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  const [segmentos, setSegmentos] = useState([])

  const emptyClient = {
    status: 'Ativo',
    nome_empresa: '',
    modelo_pagamento: 'Fixo',
    tag: '',
    nome_cliente: '',
    segmento: '',
    nicho: '',
    faturamento_medio: '',
    genero: '',
    aniversario: '',
    servicos_contratados: '',
    numero: '',
    cnpj_cpf: '',
    email: '',
    endereco: '',
    numero_endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    valor_servico: '',
    dia_pagamento: '',
    canal_venda: '',
    data_inicio: '',
    data_encerramento: ''
  }

  useEffect(() => {
    fetchClients()
  }, [statusFilter, segmentoFilter])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'todos') params.append('status', statusFilter)
      if (segmentoFilter !== 'todos') params.append('segmento', segmentoFilter)
      
      const response = await fetch(`/api/clientes?${params.toString()}`)
      const data = await response.json()
      
      if (data.clients) {
        setClients(data.clients)
        const uniqueSegmentos = [...new Set(data.clients.map(c => c.segmento).filter(Boolean))]
        setSegmentos(uniqueSegmentos.sort())
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      showNotification('Erro ao carregar clientes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const handleAddClient = async (clientData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (response.ok) {
        showNotification('Cliente adicionado com sucesso!')
        setShowAddModal(false)
        fetchClients()
      } else {
        showNotification('Erro ao adicionar cliente', 'error')
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      showNotification('Erro ao adicionar cliente', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateClient = async (clientData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      })

      if (response.ok) {
        showNotification('Cliente atualizado com sucesso!')
        setShowEditModal(false)
        setEditingClient(null)
        setSelectedClient(null)
        fetchClients()
      } else {
        showNotification('Erro ao atualizar cliente', 'error')
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      showNotification('Erro ao atualizar cliente', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/clientes?id=${clientToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('Cliente excluído com sucesso!')
        setShowDeleteModal(false)
        setClientToDelete(null)
        setSelectedClient(null)
        fetchClients()
      } else {
        showNotification('Erro ao excluir cliente', 'error')
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      showNotification('Erro ao excluir cliente', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === 'Ativo' ? 'Inativo' : 'Ativo'
    const updatedClient = { 
      ...client, 
      status: newStatus,
      data_encerramento: newStatus === 'Inativo' ? new Date().toISOString().split('T')[0] : client.data_encerramento
    }
    await handleUpdateClient(updatedClient)
  }

  const openEditModal = (client) => {
    setEditingClient({ ...client })
    setShowEditModal(true)
    setSelectedClient(null)
  }

  const openDeleteModal = (client) => {
    setClientToDelete(client)
    setShowDeleteModal(true)
    setSelectedClient(null)
  }

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      client.nome_empresa?.toLowerCase().includes(search) ||
      client.nome_cliente?.toLowerCase().includes(search) ||
      client.tag?.toLowerCase().includes(search) ||
      client.segmento?.toLowerCase().includes(search)
    )
  })

  const stats = {
    total: clients.length,
    ativos: clients.filter(c => c.status === 'Ativo').length,
    inativos: clients.filter(c => c.status === 'Inativo').length
  }

  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try { return new Date(dateStr).toLocaleDateString('pt-BR') } catch { return dateStr }
  }

  const formatPhone = (phone) => {
    if (!phone) return '-'
    const phoneStr = String(phone)
    if (phoneStr.length === 13) {
      return `+${phoneStr.slice(0,2)} (${phoneStr.slice(2,4)}) ${phoneStr.slice(4,9)}-${phoneStr.slice(9)}`
    }
    return phoneStr
  }

  return (
    <div className="p-8">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-franca-green rounded-xl flex items-center justify-center">
              <Building2 size={24} className="text-franca-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-franca-blue">Clientes</h1>
              <p className="text-gray-600">Histórico completo de clientes da Franca</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-franca-green text-franca-blue font-semibold px-4 py-3 rounded-lg hover:bg-franca-green-hover transition-colors"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total de Clientes</p>
              <p className="text-3xl font-bold text-franca-blue">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-franca-blue/10 rounded-full flex items-center justify-center">
              <Users size={24} className="text-franca-blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes Ativos</p>
              <p className="text-3xl font-bold text-green-600">{stats.ativos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clientes Inativos</p>
              <p className="text-3xl font-bold text-gray-500">{stats.inativos}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por empresa, cliente ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent bg-white min-w-[150px]"
              >
                <option value="todos">Todos Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Inativo">Inativos</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={segmentoFilter}
                onChange={(e) => setSegmentoFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent bg-white min-w-[180px]"
              >
                <option value="todos">Todos Segmentos</option>
                {segmentos.map(seg => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={40} className="animate-spin text-franca-green" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-franca-green/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-franca-green/10 rounded-lg flex items-center justify-center group-hover:bg-franca-green/20 transition-colors">
                    <span className="text-franca-blue font-bold text-lg">
                      {client.tag || client.nome_empresa?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-franca-blue line-clamp-1">{client.nome_empresa || 'Sem nome'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{client.nome_cliente || '-'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {client.status || 'N/A'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400" />
                  <span className="line-clamp-1">{client.segmento || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag size={14} className="text-gray-400" />
                  <span className="line-clamp-1">{client.nicho || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={14} className="text-gray-400" />
                  <span>{formatCurrency(client.valor_servico)}/mês</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Início: {formatDate(client.data_inicio)}</span>
                  <span className="text-franca-green font-medium group-hover:underline">Ver mais →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => openEditModal(selectedClient)}
          onDelete={() => openDeleteModal(selectedClient)}
          onToggleStatus={() => handleToggleStatus(selectedClient)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatPhone={formatPhone}
        />
      )}

      {showAddModal && (
        <ClientFormModal
          title="Novo Cliente"
          client={emptyClient}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddClient}
          saving={saving}
        />
      )}

      {showEditModal && editingClient && (
        <ClientFormModal
          title="Editar Cliente"
          client={editingClient}
          onClose={() => { setShowEditModal(false); setEditingClient(null) }}
          onSave={handleUpdateClient}
          saving={saving}
        />
      )}

      {showDeleteModal && clientToDelete && (
        <DeleteConfirmModal
          client={clientToDelete}
          onClose={() => { setShowDeleteModal(false); setClientToDelete(null) }}
          onConfirm={handleDeleteClient}
          saving={saving}
        />
      )}
    </div>
  )
}

function ClientDetailModal({ client, onClose, onEdit, onDelete, onToggleStatus, formatCurrency, formatDate, formatPhone }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-franca-green/10 rounded-xl flex items-center justify-center">
              <span className="text-franca-blue font-bold text-xl">{client.tag || client.nome_empresa?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-franca-blue">{client.nome_empresa}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{client.status}</span>
                <span className="text-sm text-gray-500">{client.segmento}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={24} className="text-gray-500" /></button>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2 flex-wrap">
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-franca-blue text-white rounded-lg hover:bg-franca-blue/90 transition-colors">
            <Edit3 size={16} /> Editar
          </button>
          <button onClick={onToggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${client.status === 'Ativo' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
            {client.status === 'Ativo' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {client.status === 'Ativo' ? 'Inativar' : 'Ativar'}
          </button>
          <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            <Trash2 size={16} /> Excluir
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-franca-blue flex items-center gap-2"><User size={18} className="text-franca-green" />Informações do Cliente</h3>
              <div className="space-y-3">
                <InfoRow icon={User} label="Nome" value={client.nome_cliente} />
                <InfoRow icon={Hash} label="TAG" value={client.tag} />
                <InfoRow icon={Users} label="Gênero" value={client.genero} />
                <InfoRow icon={Cake} label="Aniversário" value={formatDate(client.aniversario)} />
                <InfoRow icon={Phone} label="WhatsApp" value={formatPhone(client.numero)} />
                <InfoRow icon={Mail} label="E-mail" value={client.email} />
                <InfoRow icon={FileText} label="CNPJ/CPF" value={client.cnpj_cpf} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-franca-blue flex items-center gap-2"><MapPin size={18} className="text-franca-green" />Endereço</h3>
              <div className="space-y-3">
                <InfoRow icon={MapPin} label="Logradouro" value={`${client.endereco || '-'}, ${client.numero_endereco || 'S/N'}`} />
                <InfoRow icon={MapPin} label="Cidade" value={client.cidade} />
                <InfoRow icon={MapPin} label="Estado" value={client.estado} />
                <InfoRow icon={MapPin} label="CEP" value={client.cep} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-franca-blue flex items-center gap-2 mb-4"><Briefcase size={18} className="text-franca-green" />Informações do Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <InfoRow icon={Briefcase} label="Segmento" value={client.segmento} />
                <InfoRow icon={Tag} label="Nicho" value={client.nicho} />
                <InfoRow icon={FileText} label="Serviços Contratados" value={client.servicos_contratados} />
                <InfoRow icon={TrendingUp} label="Fat. Médio" value={formatCurrency(client.faturamento_medio)} />
              </div>
              <div className="space-y-3">
                <InfoRow icon={CreditCard} label="Modelo de Pagamento" value={client.modelo_pagamento} />
                <InfoRow icon={DollarSign} label="Valor do Serviço" value={formatCurrency(client.valor_servico)} />
                <InfoRow icon={Calendar} label="Dia do Pagamento" value={client.dia_pagamento ? `Dia ${client.dia_pagamento}` : '-'} />
                <InfoRow icon={TrendingUp} label="Canal de Venda" value={client.canal_venda} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-franca-blue flex items-center gap-2 mb-4"><Calendar size={18} className="text-franca-green" />Histórico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={Calendar} label="Data de Início" value={formatDate(client.data_inicio)} />
              <InfoRow icon={Calendar} label="Data de Encerramento" value={formatDate(client.data_encerramento)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientFormModal({ title, client, onClose, onSave, saving }) {
  const [formData, setFormData] = useState(client)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent text-sm"
  const labelClass = "block text-xs font-medium text-gray-700 mb-1"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-franca-blue">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={24} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><Building2 size={18} className="text-franca-green" />Dados Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Status *</label>
                <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClass} required>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Nome da Empresa *</label>
                <input type="text" name="nome_empresa" value={formData.nome_empresa || ''} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>TAG</label>
                <input type="text" name="tag" value={formData.tag || ''} onChange={handleChange} className={inputClass} maxLength={10} />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><User size={18} className="text-franca-green" />Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Nome do Cliente</label><input type="text" name="nome_cliente" value={formData.nome_cliente || ''} onChange={handleChange} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Gênero</label>
                <select name="genero" value={formData.genero || ''} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div><label className={labelClass}>Aniversário</label><input type="date" name="aniversario" value={formData.aniversario || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>WhatsApp</label><input type="text" name="numero" value={formData.numero || ''} onChange={handleChange} className={inputClass} placeholder="5521999999999" /></div>
              <div><label className={labelClass}>E-mail</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>CNPJ/CPF</label><input type="text" name="cnpj_cpf" value={formData.cnpj_cpf || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><MapPin size={18} className="text-franca-green" />Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2"><label className={labelClass}>Logradouro</label><input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Número</label><input type="text" name="numero_endereco" value={formData.numero_endereco || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>CEP</label><input type="text" name="cep" value={formData.cep || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Cidade</label><input type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Estado</label><input type="text" name="estado" value={formData.estado || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><Briefcase size={18} className="text-franca-green" />Informações do Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Segmento</label><input type="text" name="segmento" value={formData.segmento || ''} onChange={handleChange} className={inputClass} placeholder="Ex: E-commerce" /></div>
              <div><label className={labelClass}>Nicho</label><input type="text" name="nicho" value={formData.nicho || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Moda Praia" /></div>
              <div><label className={labelClass}>Fat. Médio</label><input type="number" name="faturamento_medio" value={formData.faturamento_medio || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-3"><label className={labelClass}>Serviços Contratados</label><input type="text" name="servicos_contratados" value={formData.servicos_contratados || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Tráfego Pago" /></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><DollarSign size={18} className="text-franca-green" />Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Modelo de Pagamento</label>
                <select name="modelo_pagamento" value={formData.modelo_pagamento || ''} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  <option value="Fixo">Fixo</option>
                  <option value="Variável">Variável</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div><label className={labelClass}>Valor do Serviço (R$)</label><input type="number" name="valor_servico" value={formData.valor_servico || ''} onChange={handleChange} className={inputClass} step="0.01" /></div>
              <div><label className={labelClass}>Dia do Pagamento</label><input type="number" name="dia_pagamento" value={formData.dia_pagamento || ''} onChange={handleChange} className={inputClass} min="1" max="31" /></div>
              <div><label className={labelClass}>Canal de Venda</label><input type="text" name="canal_venda" value={formData.canal_venda || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Indicação" /></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2"><Calendar size={18} className="text-franca-green" />Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Data de Início</label><input type="date" name="data_inicio" value={formData.data_inicio || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Data de Encerramento</label><input type="date" name="data_encerramento" value={formData.data_encerramento || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-franca-green text-franca-blue font-semibold rounded-lg hover:bg-franca-green-hover transition-colors disabled:opacity-50">
              {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ client, onClose, onConfirm, saving }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Excluir Cliente</h2>
          <p className="text-gray-600 mb-6">Tem certeza que deseja excluir <strong>{client.nome_empresa}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={onConfirm} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
              {saving ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-franca-blue font-medium">{value || '-'}</p>
      </div>
    </div>
  )
}
