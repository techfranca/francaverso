'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { Camera, Check, User } from 'lucide-react'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('francaverso_user')
    if (!userData) {
      router.push('/')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Carregar foto atual ESPECÍFICA DO USUÁRIO
    const savedPhoto = localStorage.getItem(`francaverso_profile_photo_${parsedUser.name}`)
    if (savedPhoto) {
      setProfilePhoto(savedPhoto)
      setPreviewPhoto(savedPhoto)
    }
  }, [router])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens!')
        return
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande! Tamanho máximo: 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewPhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePhoto = () => {
    if (previewPhoto && user) {
      localStorage.setItem(`francaverso_profile_photo_${user.name}`, previewPhoto)
      setProfilePhoto(previewPhoto)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      // Recarregar a página para atualizar a sidebar
      window.location.reload()
    }
  }

  const handleRemovePhoto = () => {
    if (user) {
      localStorage.removeItem(`francaverso_profile_photo_${user.name}`)
      setProfilePhoto(null)
      setPreviewPhoto(null)
      window.location.reload()
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-franca-green-light to-franca-blue-light">
      <Sidebar />
      
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

        {/* Card de Foto de Perfil */}
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <h2 className="text-xl font-semibold text-franca-blue mb-6 flex items-center">
              <Camera className="mr-2 text-franca-green" size={24} />
              Foto de Perfil
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Preview da Foto */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-franca-green rounded-full flex items-center justify-center overflow-hidden mb-4 ring-4 ring-franca-green/20">
                  {previewPhoto ? (
                    <img 
                      src={previewPhoto} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-franca-blue" />
                  )}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {user.name}
                </p>
              </div>

              {/* Controles */}
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="photo-upload" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-franca-green to-franca-green-hover text-franca-blue font-semibold rounded-lg cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <Camera size={20} className="mr-2" />
                      Escolher Foto
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  {previewPhoto && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSavePhoto}
                        className="flex items-center px-6 py-3 bg-franca-blue text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        <Check size={20} className="mr-2" />
                        Salvar Foto
                      </button>

                      {profilePhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  )}

                  {saved && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                      <Check size={20} className="mr-2" />
                      Foto salva com sucesso!
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Dicas:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• Use imagens em formato JPG ou PNG</li>
                      <li>• Tamanho máximo: 5MB</li>
                      <li>• A foto será ajustada automaticamente</li>
                      <li>• Sua foto fica salva permanentemente no navegador</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}