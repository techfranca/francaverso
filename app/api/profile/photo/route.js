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
    const file = formData.get('photo')

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

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Buscar foto antiga para deletar
    const { data: userData } = await supabase
      .from('users')
      .select('profile_photo_url')
      .eq('id', sessionUserId)
      .single()

    // Deletar foto antiga se existir
    if (userData?.profile_photo_url) {
      const oldPath = userData.profile_photo_url.split('/').pop()
      await supabase.storage
        .from('profiles')
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
      .from('profiles')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da foto' },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    // Atualizar URL no banco
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo_url: publicUrl })
      .eq('id', sessionUserId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar URL da foto' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photoUrl: publicUrl
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload da foto' },
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

    // Buscar foto atual
    const { data: userData } = await supabase
      .from('users')
      .select('profile_photo_url')
      .eq('id', sessionUserId)
      .single()

    // Deletar foto do storage
    if (userData?.profile_photo_url) {
      const oldPath = userData.profile_photo_url.split('/').pop()
      await supabase.storage
        .from('profiles')
        .remove([`${sessionUserId}/${oldPath}`])
    }

    // Remover URL do banco
    const { error } = await supabase
      .from('users')
      .update({ profile_photo_url: null })
      .eq('id', sessionUserId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Erro ao remover foto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json(
      { error: 'Erro ao remover foto' },
      { status: 500 }
    )
  }
}