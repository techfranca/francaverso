'use client'

import { useState } from 'react'
import { GraduationCap, ExternalLink, Eye, EyeOff, Copy, Check, BookOpen, TrendingUp, Briefcase, Zap, X } from 'lucide-react'

export default function AcademiaPage() {
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [copiedFields, setCopiedFields] = useState({})
  const [selectedCurso, setSelectedCurso] = useState(null)

  const cursos = [
    {
      id: 1,
      nome: 'A Década Milionária',
      categoria: 'Marketing',
      descricao: 'Curso completo de marketing digital com estratégias avançadas para escalar negócios',
      url: 'https://www.adecadamilionaria.com.br/ptBR/login',
      login: 'gbfranca8@gmail.com',
      senha: 'Gabriel@102030',
      cor: 'blue',
      icon: TrendingUp
    },
    {
      id: 2,
      nome: 'G4 Educação',
      categoria: 'Gestão e Negócios',
      descricao: 'Plataforma completa de educação em gestão, marketing, finanças e empreendedorismo',
      url: 'https://plataforma.g4educacao.com/shortcuts-home',
      login: 'contato@francaassessoria.com',
      senha: 'Franca@102030',
      cor: 'purple',
      icon: Briefcase
    },
    {
      id: 3,
      nome: 'Staage University',
      categoria: 'Marketing e IA',
      descricao: 'Formação em marketing, inteligência artificial e estratégias de growth',
      url: 'https://university.staage.com/logar',
      login: 'gbfranca8@gmail.com',
      senha: 'Gabriel@102030',
      cor: 'green',
      icon: Zap
    },
    {
      id: 4,
      nome: 'Comunidade Sobral',
      categoria: 'Tráfego',
      descricao: 'Especialização em tráfego pago e orgânico com metodologias comprovadas',
      url: 'https://www.subido.com.br/login',
      login: 'gbfranca8@gmail.com',
      senha: 'Gabriel@102030',
      cor: 'orange',
      icon: TrendingUp
    },
    {
      id: 5,
      nome: 'Staage Platform',
      categoria: 'Ferramenta',
      descricao: 'Plataforma completa de automação e gestão de marketing digital',
      url: 'https://app.staage.com/app/home',
      login: 'gbfranca8@gmail.com',
      senha: 'Gabriel@102030',
      cor: 'green',
      icon: Zap
    }
  ]

  const togglePassword = (id) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedFields(prev => ({ ...prev, [field]: true }))
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [field]: false }))
    }, 2000)
  }

  const getCategoryColor = (cor) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[cor] || colors.blue
  }

  const openModal = (curso) => {
    setSelectedCurso(curso)
  }

  const closeModal = () => {
    setSelectedCurso(null)
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-franca-green to-franca-green-hover rounded-xl flex items-center justify-center">
            <GraduationCap size={24} className="text-franca-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-franca-blue">Academia Franca</h1>
            <p className="text-gray-600">Centro de Conhecimento e Capacitação</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-franca-green/20">
          <p className="text-xs text-gray-600 mb-1">Total de Cursos</p>
          <p className="text-2xl font-bold text-franca-green">{cursos.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
          <p className="text-xs text-gray-600 mb-1">Plataformas</p>
          <p className="text-2xl font-bold text-blue-600">5</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <p className="text-xs text-gray-600 mb-1">Categorias</p>
          <p className="text-2xl font-bold text-purple-600">5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => {
          const Icon = curso.icon
          return (
            <button
              key={curso.id}
              onClick={() => openModal(curso)}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all text-left border-2 border-transparent hover:border-franca-green"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-franca-green to-franca-green-hover rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-franca-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-franca-blue truncate">{curso.nome}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mt-1 ${getCategoryColor(curso.cor)}`}>
                    {curso.categoria}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{curso.descricao}</p>
            </button>
          )
        })}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center space-x-2">
          <BookOpen size={16} />
          <span>Invista no seu conhecimento. Acesse, aprenda e cresça com a Academia Franca.</span>
        </p>
      </footer>

      {selectedCurso && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-[9999]">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-franca-green to-franca-green-hover rounded-xl flex items-center justify-center flex-shrink-0">
                    <selectedCurso.icon size={24} className="text-franca-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-franca-blue">{selectedCurso.nome}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${getCategoryColor(selectedCurso.cor)}`}>
                      {selectedCurso.categoria}
                    </span>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-all ml-2 flex-shrink-0">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-700">{selectedCurso.descricao}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credenciais de Acesso</p>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Login / E-mail</label>
                  <div className="flex items-center space-x-2">
                    <input type="text" value={selectedCurso.login} readOnly className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-mono" />
                    <button onClick={() => copyToClipboard(selectedCurso.login, `modal-login-${selectedCurso.id}`)} className="p-2 bg-franca-green hover:bg-franca-green-hover text-franca-blue rounded-lg transition-all" title="Copiar login">
                      {copiedFields[`modal-login-${selectedCurso.id}`] ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Senha</label>
                  <div className="flex items-center space-x-2">
                    <input type={revealedPasswords[selectedCurso.id] ? 'text' : 'password'} value={selectedCurso.senha} readOnly className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-mono" />
                    <button onClick={() => togglePassword(selectedCurso.id)} className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all" title={revealedPasswords[selectedCurso.id] ? 'Ocultar senha' : 'Mostrar senha'}>
                      {revealedPasswords[selectedCurso.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button onClick={() => copyToClipboard(selectedCurso.senha, `modal-senha-${selectedCurso.id}`)} className="p-2 bg-franca-green hover:bg-franca-green-hover text-franca-blue rounded-lg transition-all" title="Copiar senha">
                      {copiedFields[`modal-senha-${selectedCurso.id}`] ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <a href={selectedCurso.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all">
                <ExternalLink size={18} />
                <span>Acessar Plataforma</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}