'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  Filter, 
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
  Hash
} from 'lucide-react'

export default function ClientesPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [segmentoFilter, setSegmentoFilter] = useState('todos')
  const [selectedClient, setSelectedClient] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Lista de segmentos únicos
  const [segmentos, setSegmentos] = useState([])

  useEffect(() => {
    fetchClients()
  }, [statusFilter, segmentoFilter])

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
        
        // Extrair segmentos únicos
        const uniqueSegmentos = [...new Set(data.clients.map(c => c.segmento).filter(Boolean))]
        setSegmentos(uniqueSegmentos.sort())
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar clientes por busca
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

  // Estatísticas
  const stats = {
    total: clients.length,
    ativos: clients.filter(c => c.status === 'Ativo').length,
    inativos: clients.filter(c => c.status === 'Inativo').length
  }

  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-franca-green rounded-xl flex items-center justify-center">
            <Building2 size={24} className="text-franca-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-franca-blue">Clientes</h1>
            <p className="text-gray-600">Histórico completo de clientes da Franca</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
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

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg"
          >
            <Filter size={20} />
            <span>Filtros</span>
          </button>

          {/* Filters */}
          <div className={`flex flex-col md:flex-row gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            {/* Status Filter */}
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

            {/* Segmento Filter */}
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

      {/* Clients Grid */}
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
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-franca-green/10 rounded-lg flex items-center justify-center group-hover:bg-franca-green/20 transition-colors">
                    <span className="text-franca-blue font-bold text-lg">
                      {client.tag || client.nome_empresa?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-franca-blue line-clamp-1">
                      {client.nome_empresa || 'Sem nome'}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {client.nome_cliente || '-'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'Ativo' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {client.status || 'N/A'}
                </span>
              </div>

              {/* Info */}
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

              {/* Footer */}
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

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedClient(null)}>
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-franca-green/10 rounded-xl flex items-center justify-center">
                  <span className="text-franca-blue font-bold text-xl">
                    {selectedClient.tag || selectedClient.nome_empresa?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-franca-blue">{selectedClient.nome_empresa}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedClient.status === 'Ativo' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedClient.status}
                    </span>
                    <span className="text-sm text-gray-500">{selectedClient.segmento}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-franca-blue flex items-center gap-2">
                    <User size={18} className="text-franca-green" />
                    Informações do Cliente
                  </h3>
                  
                  <div className="space-y-3">
                    <InfoRow icon={User} label="Nome" value={selectedClient.nome_cliente} />
                    <InfoRow icon={Hash} label="TAG" value={selectedClient.tag} />
                    <InfoRow icon={Users} label="Gênero" value={selectedClient.genero} />
                    <InfoRow icon={Cake} label="Aniversário" value={formatDate(selectedClient.aniversario)} />
                    <InfoRow icon={Phone} label="WhatsApp" value={formatPhone(selectedClient.numero)} />
                    <InfoRow icon={Mail} label="E-mail" value={selectedClient.email} />
                    <InfoRow icon={FileText} label="CNPJ/CPF" value={selectedClient.cnpj_cpf} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-franca-blue flex items-center gap-2">
                    <MapPin size={18} className="text-franca-green" />
                    Endereço
                  </h3>
                  
                  <div className="space-y-3">
                    <InfoRow icon={MapPin} label="Logradouro" value={`${selectedClient.endereco || '-'}, ${selectedClient.numero_endereco || 'S/N'}`} />
                    <InfoRow icon={MapPin} label="Cidade" value={selectedClient.cidade} />
                    <InfoRow icon={MapPin} label="Estado" value={selectedClient.estado} />
                    <InfoRow icon={MapPin} label="CEP" value={selectedClient.cep} />
                  </div>
                </div>
              </div>

              {/* Informações do Serviço */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-franca-blue flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-franca-green" />
                  Informações do Serviço
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <InfoRow icon={Briefcase} label="Segmento" value={selectedClient.segmento} />
                    <InfoRow icon={Tag} label="Nicho" value={selectedClient.nicho} />
                    <InfoRow icon={FileText} label="Serviços Contratados" value={selectedClient.servicos_contratados} />
                    <InfoRow icon={TrendingUp} label="Fat. Médio" value={formatCurrency(selectedClient.faturamento_medio)} />
                  </div>
                  <div className="space-y-3">
                    <InfoRow icon={CreditCard} label="Modelo de Pagamento" value={selectedClient.modelo_pagamento} />
                    <InfoRow icon={DollarSign} label="Valor do Serviço" value={formatCurrency(selectedClient.valor_servico)} />
                    <InfoRow icon={Calendar} label="Dia do Pagamento" value={selectedClient.dia_pagamento ? `Dia ${selectedClient.dia_pagamento}` : '-'} />
                    <InfoRow icon={TrendingUp} label="Canal de Venda" value={selectedClient.canal_venda} />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-franca-blue flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-franca-green" />
                  Histórico
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow icon={Calendar} label="Data de Início" value={formatDate(selectedClient.data_inicio)} />
                  <InfoRow icon={Calendar} label="Data de Encerramento" value={formatDate(selectedClient.data_encerramento)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar para exibir informações
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
