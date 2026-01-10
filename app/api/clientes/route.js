import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClientFolderStructure } from '@/lib/google-drive'

export const dynamic = 'force-dynamic'

// Função para limpar dados antes de enviar ao Supabase
function sanitizeClientData(data) {
  const sanitized = {}
  
  // Campos que devem ser convertidos para null se vazios (numéricos)
  const numericFields = ['valor_servico', 'dia_pagamento', 'faturamento_medio']
  
  // Campos que devem ser convertidos para null se vazios (datas)
  const dateFields = ['data_inicio', 'data_encerramento', 'aniversario']
  
  for (const [key, value] of Object.entries(data)) {
    // Ignorar campos undefined
    if (value === undefined) continue
    
    // Converter strings vazias para null em campos numéricos
    if (numericFields.includes(key)) {
      sanitized[key] = value === '' || value === null ? null : Number(value)
      continue
    }
    
    // Converter strings vazias para null em campos de data
    if (dateFields.includes(key)) {
      sanitized[key] = value === '' || value === null ? null : value
      continue
    }
    
    // Para outros campos, manter string vazia ou o valor
    sanitized[key] = value
  }
  
  return sanitized
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const segmento = searchParams.get('segmento')

    const supabase = createServerClient()

    let query = supabase
      .from('clients')
      .select('*')
      .order('nome_empresa', { ascending: true })

    // Filtrar por status
    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    // Filtrar por segmento
    if (segmento && segmento !== 'todos') {
      query = query.eq('segmento', segmento)
    }

    // Buscar por nome
    if (search) {
      query = query.or(`nome_empresa.ilike.%${search}%,nome_cliente.ilike.%${search}%,tag.ilike.%${search}%`)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar clientes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clients: clients || [] })

  } catch (error) {
    console.error('Clients API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const rawData = await request.json()
    const { credentials, ...clientRawData } = rawData
    const clientData = sanitizeClientData(clientRawData)
    const supabase = createServerClient()

    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao criar cliente' },
        { status: 400 }
      )
    }

    // Salvar credenciais se fornecidas
    let credentialsResult = null
    if (credentials && credentials.length > 0) {
      try {
        const validCredentials = credentials
          .filter(cred => cred.platform_name && (cred.login || cred.password))
          .map(cred => ({
            client_id: client.id,
            credential_type: cred.credential_type || 'custom',
            platform_name: cred.platform_name,
            login: cred.login || null,
            password: cred.password || null,
            notes: cred.notes || null
          }))

        if (validCredentials.length > 0) {
          const { data: savedCreds, error: credError } = await supabase
            .from('client_credentials')
            .insert(validCredentials)
            .select()

          if (credError) {
            console.error('Error saving credentials:', credError)
            credentialsResult = { success: false, error: credError.message }
          } else {
            credentialsResult = { success: true, count: savedCreds.length }
          }
        }
      } catch (credError) {
        console.error('Error processing credentials:', credError)
        credentialsResult = { success: false, error: credError.message }
      }
    }

    // Criar estrutura de pastas no Google Drive
    let driveResult = null
    if (client.nome_empresa && client.segmento) {
      try {
        console.log('📁 Criando pastas no Drive para:', client.nome_empresa)
        driveResult = await createClientFolderStructure({
          nomeCliente: client.nome_empresa,
          segmento: client.segmento,
          servicosContratados: client.servicos_contratados || '',
        })
        console.log('📁 Resultado:', driveResult)

        // Se a criação foi bem sucedida, salvar o link da pasta no cliente
        if (driveResult.success && driveResult.folderLink) {
          await supabase
            .from('clients')
            .update({ pasta_drive: driveResult.folderLink })
            .eq('id', client.id)
          
          client.pasta_drive = driveResult.folderLink
        }
      } catch (driveError) {
        console.error('Erro ao criar pastas no Drive:', driveError)
        // Não falhar a criação do cliente por causa do Drive
        driveResult = { success: false, message: driveError.message }
      }
    }

    return NextResponse.json({ 
      client,
      drive: driveResult,
      credentials: credentialsResult
    })

  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { id, credentials, ...rawData } = await request.json()
    const clientData = sanitizeClientData(rawData)
    const supabase = createServerClient()

    const { data: client, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao atualizar cliente' },
        { status: 400 }
      )
    }

    // Atualizar credenciais se fornecidas
    let credentialsResult = null
    if (credentials !== undefined) {
      try {
        // Deletar credenciais existentes
        await supabase
          .from('client_credentials')
          .delete()
          .eq('client_id', id)

        // Inserir novas credenciais
        if (credentials && credentials.length > 0) {
          const validCredentials = credentials
            .filter(cred => cred.platform_name && (cred.login || cred.password))
            .map(cred => ({
              client_id: id,
              credential_type: cred.credential_type || 'custom',
              platform_name: cred.platform_name,
              login: cred.login || null,
              password: cred.password || null,
              notes: cred.notes || null
            }))

          if (validCredentials.length > 0) {
            const { data: savedCreds, error: credError } = await supabase
              .from('client_credentials')
              .insert(validCredentials)
              .select()

            if (credError) {
              console.error('Error saving credentials:', credError)
              credentialsResult = { success: false, error: credError.message }
            } else {
              credentialsResult = { success: true, count: savedCreds.length }
            }
          } else {
            credentialsResult = { success: true, count: 0 }
          }
        } else {
          credentialsResult = { success: true, count: 0 }
        }
      } catch (credError) {
        console.error('Error processing credentials:', credError)
        credentialsResult = { success: false, error: credError.message }
      }
    }

    return NextResponse.json({ 
      client,
      credentials: credentialsResult
    })

  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do cliente não fornecido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting client:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}