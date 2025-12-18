'use client'

import { useEffect, useState } from 'react'
import { Camera, Check, User, Mail, Phone, FileText, Loader, Image } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [saved, setSaved] = useState(false)

  // Campos do perfil
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Preencher campos
        setBio(data.user.bio || '')
        setEmail(data.user.email || '')
        setPhone(data.user.phone || '')
      } else {
        console.error('Erro ao carregar perfil')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBannerChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validações
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens!')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem é muito grande! Tamanho máximo: 10MB')
      return
    }

    setUploadingBanner(true)

    try {
      const formData = new FormData()
      formData.append('banner', file)

      const response = await fetch('/api/profile/banner', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      // Atualizar banner no estado local
      setUser(prev => ({ ...prev, banner_url: data.bannerUrl }))
      
      alert('Banner atualizado com sucesso!')
      
      // Recarregar página para garantir consistência
      window.location.reload()

    } catch (error) {
      console.error('Upload error:', error)
      alert(error.message)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleRemoveBanner = async () => {
    if (!confirm('Tem certeza que deseja remover seu banner?')) {
      return
    }

    try {
      const response = await fetch('/api/profile/banner', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao remover banner')
      }

      setUser(prev => ({ ...prev, banner_url: null }))
      alert('Banner removido com sucesso!')
      window.location.reload()

    } catch (error) {
      console.error('Delete error:', error)
      alert(error.message)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validações
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande! Tamanho máximo: 5MB')
      return
    }

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      // --- CORREÇÃO PARA A SIDEBAR ---
      // Atualiza o localStorage para que a Sidebar leia a nova foto após o reload
      const userData = JSON.parse(localStorage.getItem('francaverso_user') || '{}')
      userData.profile_photo_url = data.photoUrl
      localStorage.setItem('francaverso_user', JSON.stringify(userData))
      // -------------------------------

      setUser(prev => ({ ...prev, profile_photo_url: data.photoUrl }))
      
      alert('Foto atualizada com sucesso!')
      
      // Recarregar para atualizar a Sidebar
      window.location.reload()

    } catch (error) {
      console.error('Upload error:', error)
      alert(error.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Tem certeza que deseja remover sua foto?')) {
      return
    }

    try {
      const response = await fetch('/api/profile/photo', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao remover foto')
      }

      // --- CORREÇÃO PARA A SIDEBAR ---
      const userData = JSON.parse(localStorage.getItem('francaverso_user') || '{}')
      userData.profile_photo_url = null
      localStorage.setItem('francaverso_user', JSON.stringify(userData))
      // -------------------------------

      setUser(prev => ({ ...prev, profile_photo_url: null }))
      alert('Foto removida com sucesso!')
      window.location.reload()

    } catch (error) {
      console.error('Delete error:', error)
      alert(error.message)
    }
  }

  const handleSaveInfo = async () => {
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          email,
          phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (error) {
      console.error('Save error:', error)
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <Loader size={48} className="text-franca-green animate-spin" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <p className="text-gray-600">Erro ao carregar perfil</p>
      </main>
    )
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-franca-blue mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Personalize sua experiência no Francaverso
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Card de Banner Personalizado */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn" style={{animationDelay: '0.05s'}}>
          <h2 className="text-xl font-semibold text-franca-blue mb-6 flex items-center">
            <Image className="mr-2 text-franca-green" size={24} />
            Banner Personalizado
          </h2>

          <div className="space-y-6">
            {/* Preview do Banner */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-r from-franca-green to-franca-green-hover">
              {user.banner_url ? (
                <img 
                  src={user.banner_url} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-franca-blue/50 text-sm">Nenhum banner configurado</p>
                </div>
              )}
              
              {/* Foto de perfil sobreposta (preview) */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                  {user.profile_photo_url ? (
                    <img 
                      src={user.profile_photo_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-franca-blue" />
                  )}
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 pt-6">
              <label 
                htmlFor="banner-upload" 
                className={`flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 ${uploadingBanner ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploadingBanner ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    Fazendo Upload...
                  </>
                ) : (
                  <>
                    <Camera size={20} className="mr-2" />
                    Escolher Banner
                  </>
                )}
              </label>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                disabled={uploadingBanner}
                className="hidden"
              />

              {user.banner_url && (
                <button
                  onClick={handleRemoveBanner}
                  disabled={uploadingBanner}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  Remover Banner
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>💡 Dica:</strong> Use imagens com proporção 3:1 (ex: 1200x400px) para melhor resultado!
              </p>
            </div>
          </div>
        </div>

        {/* Card de Foto de Perfil */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-semibold text-franca-blue mb-6 flex items-center">
            <Camera className="mr-2 text-franca-green" size={24} />
            Foto de Perfil
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-franca-green rounded-full flex items-center justify-center overflow-hidden mb-4 ring-4 ring-franca-green/20">
                {user.profile_photo_url ? (
                  <img 
                    src={user.profile_photo_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-franca-blue" />
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">{user.name}</p>
            </div>

            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="photo-upload" 
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader size={20} className="mr-2 animate-spin" />
                        Fazendo Upload...
                      </>
                    ) : (
                      <>
                        <Camera size={20} className="mr-2" />
                        Escolher Foto
                      </>
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </div>

                {user.profile_photo_url && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    Remover Foto
                  </button>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Dicas:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Use imagens em formato JPG, PNG ou WEBP</li>
                    <li>• Tamanho máximo: 5MB</li>
                    <li>• A foto será salva na nuvem (Supabase)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Informações Pessoais */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h2 className="text-xl font-semibold text-franca-blue mb-6 flex items-center">
            <FileText className="mr-2 text-franca-green" size={24} />
            Informações Pessoais
          </h2>

          <div className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail size={16} className="mr-2 text-franca-green" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@franca.com"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone size={16} className="mr-2 text-franca-green" />
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(21) 99999-9999"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-franca-green focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Botão Salvar */}
            <button
              onClick={handleSaveInfo}
              disabled={saving}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={20} className="mr-2" />
                  Salvar Informações
                </>
              )}
            </button>

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <Check size={20} className="mr-2" />
                Informações salvas com sucesso!
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}