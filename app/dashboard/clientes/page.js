'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, Search, X, User, Mail, Phone, MapPin, Calendar, DollarSign,
  Tag, Briefcase, FileText, CreditCard, TrendingUp, Clock, Users, Loader,
  ChevronDown, Cake, Hash, Plus, Edit3, Trash2, Save, AlertTriangle,
  CheckCircle, XCircle, Sparkles, ArrowUpRight, Filter, MoreVertical,
  Globe, Target, Zap, Award, PieChart, BarChart3, FolderOpen, ExternalLink
} from 'lucide-react'

// Cores por segmento
const segmentColors = {
  'E-commerce': { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-100', dot: 'bg-emerald-500' },
  'Negócio Local': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', dot: 'bg-blue-500' },
  'Infoproduto': { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100', dot: 'bg-purple-500' },
  'Inside Sales': { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100', dot: 'bg-orange-500' },
  'Lançamento': { bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100', dot: 'bg-pink-500' },
  'Food service': { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100', dot: 'bg-amber-500' },
  'Serviços online': { bg: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-100', dot: 'bg-cyan-500' },
}

const getSegmentColor = (segmento) => {
  return segmentColors[segmento] || { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-100', dot: 'bg-slate-400' }
}

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [segmentoFilter, setSegmentoFilter] = useState('todos')
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [segmentos, setSegmentos] = useState([])

  const emptyClient = {
    status: 'Ativo', nome_empresa: '', modelo_pagamento: 'Fixo', tag: '', nome_cliente: '',
    segmento: '', nicho: '', faturamento_medio: '', genero: '', aniversario: '',
    servicos_contratados: '', numero: '', cnpj_cpf: '', email: '', endereco: '',
    numero_endereco: '', cep: '', cidade: '', estado: '', valor_servico: '',
    dia_pagamento: '', canal_venda: '', data_inicio: '', data_encerramento: ''
  }

  useEffect(() => { fetchClients() }, [statusFilter, segmentoFilter])
  useEffect(() => { if (notification) { const t = setTimeout(() => setNotification(null), 3000); return () => clearTimeout(t) } }, [notification])

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
        setSegmentos([...new Set(data.clients.map(c => c.segmento).filter(Boolean))].sort())
      }
    } catch (error) {
      showNotification('Erro ao carregar clientes', 'error')
    } finally { setLoading(false) }
  }

  const showNotification = (message, type = 'success') => setNotification({ message, type })

  const handleAddClient = async (clientData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clientData) })
      const data = await response.json()
      
      if (response.ok) { 
        // Verificar se as pastas foram criadas
        if (data.drive?.success) {
          if (data.drive.alreadyExisted) {
            showNotification('Cliente adicionado! Pasta já existia no Drive.')
          } else {
            showNotification('Cliente adicionado e pastas criadas no Drive!')
          }
        } else {
          showNotification('Cliente adicionado! (Erro ao criar pastas no Drive)')
        }
        setShowAddModal(false)
        fetchClients() 
      }
      else showNotification(data.error || 'Erro ao adicionar cliente', 'error')
    } catch { showNotification('Erro ao adicionar cliente', 'error') }
    finally { setSaving(false) }
  }

  const handleUpdateClient = async (clientData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clientData) })
      if (response.ok) { showNotification('Cliente atualizado!'); setShowEditModal(false); setEditingClient(null); setSelectedClient(null); fetchClients() }
      else showNotification('Erro ao atualizar cliente', 'error')
    } catch { showNotification('Erro ao atualizar cliente', 'error') }
    finally { setSaving(false) }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    setSaving(true)
    try {
      const response = await fetch(`/api/clientes?id=${clientToDelete.id}`, { method: 'DELETE' })
      if (response.ok) { showNotification('Cliente excluído!'); setShowDeleteModal(false); setClientToDelete(null); setSelectedClient(null); fetchClients() }
      else showNotification('Erro ao excluir cliente', 'error')
    } catch { showNotification('Erro ao excluir cliente', 'error') }
    finally { setSaving(false) }
  }

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === 'Ativo' ? 'Inativo' : 'Ativo'
    await handleUpdateClient({ ...client, status: newStatus, data_encerramento: newStatus === 'Inativo' ? new Date().toISOString().split('T')[0] : client.data_encerramento })
  }

  const openEditModal = (client) => { setEditingClient({ ...client }); setShowEditModal(true); setSelectedClient(null) }
  const openDeleteModal = (client) => { setClientToDelete(client); setShowDeleteModal(true); setSelectedClient(null) }

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return client.nome_empresa?.toLowerCase().includes(search) || client.nome_cliente?.toLowerCase().includes(search) || client.tag?.toLowerCase().includes(search)
  })

  const stats = {
    total: clients.length,
    ativos: clients.filter(c => c.status === 'Ativo').length,
    inativos: clients.filter(c => c.status === 'Inativo').length,
    mrr: clients.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + (parseFloat(c.valor_servico) || 0), 0)
  }

  const formatCurrency = (value) => !value ? '-' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  const formatDate = (dateStr) => { if (!dateStr) return '-'; try { return new Date(dateStr).toLocaleDateString('pt-BR') } catch { return dateStr } }
  const formatPhone = (phone) => { if (!phone) return '-'; const p = String(phone); return p.length === 13 ? `+${p.slice(0,2)} (${p.slice(2,4)}) ${p.slice(4,9)}-${p.slice(9)}` : p }

  // Segmentos ativos para a legenda
  const activeSegments = [...new Set(clients.map(c => c.segmento).filter(Boolean))].sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          notification.type === 'error' ? 'bg-red-500/95 text-white border-red-400' : 'bg-emerald-500/95 text-white border-emerald-400'
        } animate-slideIn`}>
          {notification.type === 'error' ? <XCircle size={22} /> : <CheckCircle size={22} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Premium Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-franca-blue via-franca-blue/90 to-emerald-600 rounded-3xl opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30 rounded-3xl" />
          
          <div className="relative px-8 py-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <Building2 size={32} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white">Clientes</h1>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/20">
                    {stats.total} cadastrados
                  </span>
                </div>
                <p className="text-white/70 text-lg">Gerencie sua carteira de clientes</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex items-center gap-3 bg-white text-franca-blue font-semibold px-6 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-franca-green rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus size={22} />
              </div>
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={Users} label="Total de Clientes" value={stats.total} color="blue" />
          <StatCard icon={Zap} label="Clientes Ativos" value={stats.ativos} color="green" />
          <StatCard icon={Clock} label="Clientes Inativos" value={stats.inativos} color="gray" />
          <StatCard icon={TrendingUp} label="MRR Atual" value={formatCurrency(stats.mrr)} color="emerald" isCurrency />
        </div>

        {/* Search & Filters Premium */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-franca-blue transition-colors" />
              <input
                type="text"
                placeholder="Buscar por empresa, cliente ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-franca-green focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-franca-green cursor-pointer font-medium text-slate-700 min-w-[160px]"
                >
                  <option value="todos">Todos Status</option>
                  <option value="Ativo">✓ Ativos</option>
                  <option value="Inativo">○ Inativos</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={segmentoFilter}
                  onChange={(e) => setSegmentoFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-franca-green cursor-pointer font-medium text-slate-700 min-w-[180px]"
                >
                  <option value="todos">Todos Segmentos</option>
                  {segmentos.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Legenda de Segmentos */}
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm text-slate-500 font-medium">Segmentos:</span>
            {activeSegments.map(seg => {
              const colors = getSegmentColor(seg)
              return (
                <div key={seg} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <span className="text-sm text-slate-600">{seg}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Clients Grid Premium */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 bg-franca-green/20 rounded-full flex items-center justify-center mb-4">
              <Loader size={32} className="animate-spin text-franca-green" />
            </div>
            <p className="text-slate-500">Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-slate-500 mb-6">Tente ajustar os filtros ou adicione um novo cliente</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-franca-green text-franca-blue font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Plus size={20} /> Adicionar Cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => setSelectedClient(client)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, isCurrency }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
    gray: 'from-slate-400 to-slate-500 shadow-slate-400/25',
    emerald: 'from-teal-500 to-emerald-500 shadow-teal-500/25'
  }
  
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className="text-white" />
        </div>
        <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className={`font-bold ${isCurrency ? 'text-2xl' : 'text-3xl'} text-slate-800`}>{value}</p>
    </div>
  )
}

// Client Card Component
function ClientCard({ client, onClick, formatCurrency }) {
  const isActive = client.status === 'Ativo'
  const segmentColor = getSegmentColor(client.segmento)
  
  // Pegar só a primeira letra do nome da empresa
  const initial = client.nome_empresa?.charAt(0)?.toUpperCase() || '?'
  
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-franca-green/40 hover:shadow-xl cursor-pointer transition-all duration-300 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-franca-green/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-franca-blue to-franca-blue/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-xl">{initial}</span>
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-lg truncate group-hover:text-franca-blue transition-colors">
            {client.nome_empresa || 'Sem nome'}
          </h3>
          <p className="text-slate-500 text-sm truncate">{client.nome_cliente || '-'}</p>
        </div>
      </div>

      {/* Info Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${segmentColor.light} ${segmentColor.text} rounded-lg text-xs font-medium`}>
          <div className={`w-2 h-2 rounded-full ${segmentColor.dot}`} />
          {client.segmento || 'N/A'}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? <Zap size={12} /> : <Clock size={12} />} {client.status}
        </span>
        {client.pasta_drive && (
          <a
            href={client.pasta_drive}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors"
            title="Abrir pasta no Drive"
          >
            <FolderOpen size={12} /> Drive
          </a>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Valor mensal</p>
          <p className="text-lg font-bold text-slate-800">{formatCurrency(client.valor_servico)}</p>
        </div>
        <div className="w-10 h-10 bg-franca-green/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={20} className="text-franca-green" />
        </div>
      </div>
    </div>
  )
}

// Client Detail Modal (Premium)
function ClientDetailModal({ client, onClose, onEdit, onDelete, onToggleStatus, formatCurrency, formatDate, formatPhone }) {
  const isActive = client.status === 'Ativo'
  const initial = client.nome_empresa?.charAt(0)?.toUpperCase() || '?'
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header Premium */}
        <div className="relative bg-gradient-to-r from-franca-blue to-franca-blue/90 px-8 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20" />
          
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={24} className="text-white" />
          </button>
          
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-3xl">{initial}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{client.nome_empresa}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/10 text-white/70 border border-white/20'
                }`}>
                  {isActive ? '● Ativo' : '○ Inativo'}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80">{client.segmento}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex gap-3 flex-wrap">
          {client.pasta_drive && (
            <a 
              href={client.pasta_drive} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 hover:shadow-lg transition-all font-medium"
            >
              <FolderOpen size={16} /> Abrir Drive
            </a>
          )}
          <button onClick={onEdit} className="flex items-center gap-2 px-5 py-2.5 bg-franca-blue text-white rounded-xl hover:shadow-lg transition-all font-medium">
            <Edit3 size={16} /> Editar
          </button>
          <button onClick={onToggleStatus} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
            isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}>
            {isActive ? <><XCircle size={16} /> Inativar</> : <><CheckCircle size={16} /> Ativar</>}
          </button>
          <button onClick={onDelete} className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-medium">
            <Trash2 size={16} /> Excluir
          </button>
        </div>

        {/* Content - scroll instantâneo */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]" style={{ scrollBehavior: 'auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <InfoSection icon={User} title="Dados do Cliente" color="blue">
                <InfoGrid>
                  <InfoItem label="Nome" value={client.nome_cliente} />
                  <InfoItem label="TAG" value={client.tag} />
                  <InfoItem label="Gênero" value={client.genero} />
                  <InfoItem label="Aniversário" value={formatDate(client.aniversario)} />
                </InfoGrid>
              </InfoSection>

              <InfoSection icon={Phone} title="Contato" color="green">
                <InfoGrid>
                  <InfoItem label="WhatsApp" value={formatPhone(client.numero)} />
                  <InfoItem label="E-mail" value={client.email} truncate />
                  <InfoItem label="CNPJ/CPF" value={client.cnpj_cpf} span={2} />
                </InfoGrid>
              </InfoSection>

              <InfoSection icon={MapPin} title="Endereço" color="purple">
                <InfoGrid>
                  <InfoItem label="Logradouro" value={`${client.endereco || '-'}, ${client.numero_endereco || 'S/N'}`} span={2} />
                  <InfoItem label="Cidade" value={client.cidade} />
                  <InfoItem label="Estado" value={client.estado} />
                  <InfoItem label="CEP" value={client.cep} span={2} />
                </InfoGrid>
              </InfoSection>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <InfoSection icon={Briefcase} title="Serviço" color="orange">
                <InfoGrid>
                  <InfoItem label="Segmento" value={client.segmento} />
                  <InfoItem label="Nicho" value={client.nicho} />
                  <InfoItem label="Serviços" value={client.servicos_contratados} span={2} />
                  <InfoItem label="Fat. Médio" value={formatCurrency(client.faturamento_medio)} span={2} />
                </InfoGrid>
              </InfoSection>

              <InfoSection icon={DollarSign} title="Financeiro" color="emerald">
                <InfoGrid>
                  <InfoItem label="Valor Mensal" value={formatCurrency(client.valor_servico)} highlight />
                  <InfoItem label="Dia Pgto" value={client.dia_pagamento ? `Dia ${client.dia_pagamento}` : '-'} />
                  <InfoItem label="Modelo" value={client.modelo_pagamento} />
                  <InfoItem label="Canal de Venda" value={client.canal_venda} />
                </InfoGrid>
              </InfoSection>

              <InfoSection icon={Calendar} title="Histórico" color="slate">
                <InfoGrid>
                  <InfoItem label="Data de Início" value={formatDate(client.data_inicio)} />
                  <InfoItem label="Data de Encerramento" value={formatDate(client.data_encerramento)} />
                </InfoGrid>
              </InfoSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Info Section Component
function InfoSection({ icon: Icon, title, color, children }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-teal-500 to-emerald-600',
    slate: 'from-slate-500 to-slate-600'
  }
  
  return (
    <div className="bg-slate-50 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function InfoItem({ label, value, span = 1, highlight, truncate }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`font-medium ${highlight ? 'text-lg text-emerald-600' : 'text-slate-800'} ${truncate ? 'truncate' : ''}`} title={truncate ? value : undefined}>
        {value || '-'}
      </p>
    </div>
  )
}

// Form Modal
function ClientFormModal({ title, client, onClose, onSave, saving }) {
  const [formData, setFormData] = useState(client)
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData) }

  const inputClass = "w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-franca-green text-slate-700 placeholder:text-slate-400"
  const labelClass = "block text-sm font-medium text-slate-600 mb-2"

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]" style={{ scrollBehavior: 'auto' }}>
          {/* Dados Básicos */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><Building2 size={18} className="text-franca-green" />Dados Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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
                <input type="text" name="tag" value={formData.tag || ''} onChange={handleChange} className={inputClass} maxLength={10} placeholder="Ex: BRUA" />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><User size={18} className="text-franca-green" />Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div><label className={labelClass}>Nome</label><input type="text" name="nome_cliente" value={formData.nome_cliente || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Gênero</label><select name="genero" value={formData.genero || ''} onChange={handleChange} className={inputClass}><option value="">Selecione...</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option></select></div>
              <div><label className={labelClass}>Aniversário</label><input type="date" name="aniversario" value={formData.aniversario || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>WhatsApp</label><input type="text" name="numero" value={formData.numero || ''} onChange={handleChange} className={inputClass} placeholder="5521999999999" /></div>
              <div><label className={labelClass}>E-mail</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>CNPJ/CPF</label><input type="text" name="cnpj_cpf" value={formData.cnpj_cpf || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          {/* Endereço */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><MapPin size={18} className="text-franca-green" />Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2"><label className={labelClass}>Logradouro</label><input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Número</label><input type="text" name="numero_endereco" value={formData.numero_endereco || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>CEP</label><input type="text" name="cep" value={formData.cep || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Cidade</label><input type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Estado</label><input type="text" name="estado" value={formData.estado || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          {/* Serviço */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><Briefcase size={18} className="text-franca-green" />Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Segmento</label>
                <select name="segmento" value={formData.segmento || ''} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Negócio Local">Negócio Local</option>
                  <option value="Infoproduto">Infoproduto</option>
                  <option value="Inside Sales">Inside Sales</option>
                  <option value="Lançamento">Lançamento</option>
                  <option value="Food service">Food service</option>
                  <option value="Serviços online">Serviços online</option>
                </select>
              </div>
              <div><label className={labelClass}>Nicho</label><input type="text" name="nicho" value={formData.nicho || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Moda Praia" /></div>
              <div><label className={labelClass}>Fat. Médio</label><input type="number" name="faturamento_medio" value={formData.faturamento_medio || ''} onChange={handleChange} className={inputClass} /></div>
              <div className="md:col-span-3"><label className={labelClass}>Serviços Contratados</label><input type="text" name="servicos_contratados" value={formData.servicos_contratados || ''} onChange={handleChange} className={inputClass} placeholder="Ex: Tráfego Pago e Produção de Conteúdo" /></div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><DollarSign size={18} className="text-franca-green" />Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div><label className={labelClass}>Modelo</label><select name="modelo_pagamento" value={formData.modelo_pagamento || ''} onChange={handleChange} className={inputClass}><option value="">Selecione...</option><option value="Fixo">Fixo</option><option value="Variável">Variável</option><option value="Outro">Outro</option></select></div>
              <div><label className={labelClass}>Valor (R$)</label><input type="number" name="valor_servico" value={formData.valor_servico || ''} onChange={handleChange} className={inputClass} step="0.01" /></div>
              <div><label className={labelClass}>Dia Pgto</label><input type="number" name="dia_pagamento" value={formData.dia_pagamento || ''} onChange={handleChange} className={inputClass} min="1" max="31" /></div>
              <div className="md:col-span-3">
  <label className={labelClass}>Serviços Contratados</label>
  <div className="flex flex-wrap gap-3 mt-2">
    {['Tráfego Pago', 'Produção de Conteúdo', 'IA'].map((servico) => {
      const isSelected = (formData.servicos_contratados || '').includes(servico)
      return (
        <label
          key={servico}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
            isSelected 
              ? 'border-franca-green bg-franca-green/10 text-franca-blue' 
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              const current = formData.servicos_contratados ? formData.servicos_contratados.split(', ').filter(Boolean) : []
              let updated
              if (e.target.checked) {
                updated = [...current, servico]
              } else {
                updated = current.filter(s => s !== servico)
              }
              handleChange({ target: { name: 'servicos_contratados', value: updated.join(', ') } })
            }}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected ? 'border-franca-green bg-franca-green' : 'border-slate-300'
          }`}>
            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="font-medium text-sm">{servico}</span>
        </label>
      )
    })}
  </div>
</div>
            </div>
          </div>

          {/* Datas */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2"><Calendar size={18} className="text-franca-green" />Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={labelClass}>Data de Início</label><input type="date" name="data_inicio" value={formData.data_inicio || ''} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Data de Encerramento</label><input type="date" name="data_encerramento" value={formData.data_encerramento || ''} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-franca-green to-emerald-400 text-franca-blue font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Modal
function DeleteConfirmModal({ client, onClose, onConfirm, saving }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Excluir Cliente</h2>
          <p className="text-slate-600 mb-8">
            Tem certeza que deseja excluir <strong className="text-slate-800">{client.nome_empresa}</strong>?<br />
            <span className="text-sm text-slate-500">Esta ação não pode ser desfeita.</span>
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
            <button onClick={onConfirm} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">
              {saving ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
