import { google } from 'googleapis'

// ========================
// CONFIGURAÇÕES DO DRIVE COMPARTILHADO
// ========================

// ID do Drive Compartilhado da Franca
const SHARED_DRIVE_ID = '0ABUaieLcZITFUk9PVA'

// ID da pasta base: Marketing, IA e TI
const BASE_FOLDER_ID = '1OwZwe5mZ4YTBuq0JA88S4zN5PoKp2OVe'

// ========================
// MAPEAMENTO DE SERVIÇOS
// ========================

const SERVICOS_PASTAS = {
  'tráfego pago': 'Tráfego pago',
  'trafego pago': 'Tráfego pago',
  'produção de conteúdo': 'Produção de conteúdo',
  'producao de conteudo': 'Produção de conteúdo',
  'conteúdo': 'Produção de conteúdo',
  'conteudo': 'Produção de conteúdo',
  'ia': 'IA',
  'inteligência artificial': 'IA',
  'inteligencia artificial': 'IA',
}

// ========================
// CONEXÃO COM O DRIVE
// ========================

function getDrive() {
  const rawCreds = process.env.GOOGLE_CREDENTIALS_JSON

  if (!rawCreds) {
    throw new Error('GOOGLE_CREDENTIALS_JSON não está definida nas variáveis de ambiente')
  }

  let credentials
  try {
    credentials = JSON.parse(rawCreds)
  } catch (e) {
    throw new Error('Erro ao parsear GOOGLE_CREDENTIALS_JSON: ' + e.message)
  }

  // Correção para ambientes como Vercel onde \n vira string literal
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({
    version: 'v3',
    auth,
  })
}

// ========================
// HELPERS
// ========================

function getAnoAtual() {
  return new Date().getFullYear()
}

/**
 * Busca ou cria uma pasta no Drive
 */
async function findOrCreateFolder(drive, name, parentId) {
  const safeName = name.replace(/'/g, "\\'")

  // Buscar pasta existente
  const res = await drive.files.list({
    corpora: 'drive',
    driveId: SHARED_DRIVE_ID,
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  if (res.data.files?.length) {
    console.log(`📁 Pasta encontrada: ${name}`)
    return res.data.files[0].id
  }

  // Criar pasta
  console.log(`📁 Criando pasta: ${name}`)
  const created = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })

  return created.data.id
}

/**
 * Verifica se pasta do cliente já existe
 */
async function checkClientFolderExists(drive, clientName, segmentoFolderId) {
  const safeName = clientName.replace(/'/g, "\\'")

  const res = await drive.files.list({
    corpora: 'drive',
    driveId: SHARED_DRIVE_ID,
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${segmentoFolderId}' in parents and trashed=false`,
    fields: 'files(id, name, webViewLink)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  if (res.data.files?.length) {
    return {
      exists: true,
      folderId: res.data.files[0].id,
      folderLink: res.data.files[0].webViewLink,
    }
  }

  return { exists: false }
}

/**
 * Extrai os serviços contratados do texto e retorna as pastas correspondentes
 */
function parseServicosContratados(servicosTexto) {
  if (!servicosTexto) return []

  const texto = servicosTexto.toLowerCase()
  const pastas = []

  for (const [keyword, pastaNome] of Object.entries(SERVICOS_PASTAS)) {
    if (texto.includes(keyword) && !pastas.includes(pastaNome)) {
      pastas.push(pastaNome)
    }
  }

  return pastas
}

// ========================
// FUNÇÃO PRINCIPAL
// ========================

/**
 * Cria toda a estrutura de pastas para um novo cliente
 * 
 * Estrutura:
 * Marketing, IA e TI (BASE_FOLDER_ID)
 *   └── Marketing
 *       └── Clientes
 *           └── [Segmento]
 *               └── [Nome do Cliente]
 *                   ├── [F] Informações
 *                   ├── [F] Estratégia
 *                   ├── Design/Criativos
 *                   │   ├── Materiais
 *                   │   │   └── [ANO]
 *                   │   ├── Conteúdo
 *                   │   │   └── [ANO]
 *                   │   ├── Anúncios
 *                   │   │   └── [ANO]
 *                   │   └── Outros
 *                   │       └── [ANO]
 *                   └── [Pastas de serviços contratados]
 */
export async function createClientFolderStructure({
  nomeCliente,
  segmento,
  servicosContratados,
}) {
  try {
    console.log('🚀 Iniciando criação de estrutura de pastas...')
    console.log(`   Cliente: ${nomeCliente}`)
    console.log(`   Segmento: ${segmento}`)
    console.log(`   Serviços: ${servicosContratados}`)

    const drive = getDrive()
    const ano = getAnoAtual().toString()

    // Navegar até a pasta Clientes
    // Marketing, IA e TI > Marketing > Clientes
    const marketingId = await findOrCreateFolder(drive, 'Marketing', BASE_FOLDER_ID)
    const clientesId = await findOrCreateFolder(drive, 'Clientes', marketingId)

    // Criar/navegar até o segmento
    const segmentoId = await findOrCreateFolder(drive, segmento, clientesId)

    // Verificar se cliente já existe
    const clienteCheck = await checkClientFolderExists(drive, nomeCliente, segmentoId)
    if (clienteCheck.exists) {
      console.log(`⚠️ Pasta do cliente já existe!`)
      return {
        success: true,
        message: 'Pasta do cliente já existia',
        alreadyExisted: true,
        folderId: clienteCheck.folderId,
        folderLink: clienteCheck.folderLink,
      }
    }

    // Criar pasta do cliente
    const clienteId = await findOrCreateFolder(drive, nomeCliente, segmentoId)

    // Criar pastas padrão
    await findOrCreateFolder(drive, '[F] Informações', clienteId)
    await findOrCreateFolder(drive, '[F] Estratégia', clienteId)

    // Criar Design/Criativos e subpastas
    const designId = await findOrCreateFolder(drive, 'Design/Criativos', clienteId)

    const subpastasDesign = ['Materiais', 'Conteúdo', 'Anúncios', 'Outros']
    for (const subpasta of subpastasDesign) {
      const subpastaId = await findOrCreateFolder(drive, subpasta, designId)
      // Criar pasta do ano dentro de cada subpasta
      await findOrCreateFolder(drive, ano, subpastaId)
    }

    // Criar pastas de serviços contratados
    const servicosPastas = parseServicosContratados(servicosContratados)
    console.log(`📦 Serviços identificados: ${servicosPastas.join(', ') || 'nenhum'}`)

    for (const servico of servicosPastas) {
      await findOrCreateFolder(drive, servico, clienteId)
    }

    // Obter link da pasta do cliente
    const folderInfo = await drive.files.get({
      fileId: clienteId,
      fields: 'webViewLink',
      supportsAllDrives: true,
    })

    console.log('✅ Estrutura de pastas criada com sucesso!')

    return {
      success: true,
      message: 'Estrutura de pastas criada com sucesso!',
      alreadyExisted: false,
      folderId: clienteId,
      folderLink: folderInfo.data.webViewLink,
      servicosCriados: servicosPastas,
    }

  } catch (error) {
    console.error('❌ Erro ao criar estrutura de pastas:', error)
    return {
      success: false,
      message: error.message || 'Erro ao criar estrutura de pastas',
      error: error.toString(),
    }
  }
}

/**
 * Verifica a conexão com o Drive
 */
export async function testDriveConnection() {
  try {
    const drive = getDrive()

    const res = await drive.files.get({
      fileId: BASE_FOLDER_ID,
      fields: 'id, name',
      supportsAllDrives: true,
    })

    return {
      success: true,
      message: 'Conexão com Google Drive OK',
      folderName: res.data.name,
    }

  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}
