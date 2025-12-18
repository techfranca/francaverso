import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('banner')

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      )
    }

    // Validar tamanho (10MB max para banner)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Buscar banner antigo para deletar
    const { data: userData } = await supabase
      .from('users')
      .select('banner_url')
      .eq('id', sessionUserId)
      .single()

    // Deletar banner antigo se existir
    if (userData?.banner_url) {
      const oldPath = userData.banner_url.split('/').pop()
      await supabase.storage
        .from('banners')
        .remove([`${sessionUserId}/${oldPath}`])
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${sessionUserId}/${fileName}`

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do banner' },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('banners')
      .getPublicUrl(filePath)

    // Atualizar URL no banco
    const { error: updateError } = await supabase
      .from('users')
      .update({ banner_url: publicUrl })
      .eq('id', sessionUserId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar URL do banner' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bannerUrl: publicUrl
    })

  } catch (error) {
    console.error('Banner upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do banner' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const sessionUserId = cookieStore.get('francaverso_session')?.value

    if (!sessionUserId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Buscar banner atual
    const { data: userData } = await supabase
      .from('users')
      .select('banner_url')
      .eq('id', sessionUserId)
      .single()

    // Deletar banner do storage
    if (userData?.banner_url) {
      const oldPath = userData.banner_url.split('/').pop()
      await supabase.storage
        .from('banners')
        .remove([`${sessionUserId}/${oldPath}`])
    }

    // Remover URL do banco
    const { error } = await supabase
      .from('users')
      .update({ banner_url: null })
      .eq('id', sessionUserId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Erro ao remover banner' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Banner delete error:', error)
    return NextResponse.json(
      { error: 'Erro ao remover banner' },
      { status: 500 }
    )
  }
}