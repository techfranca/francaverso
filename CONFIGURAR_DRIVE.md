# 📁 Configuração da Criação Automática de Pastas no Drive

## O que foi implementado

Quando um novo cliente é cadastrado no sistema, automaticamente é criada a seguinte estrutura de pastas no Google Drive:

```
Marketing, IA e TI
└── Marketing
    └── Clientes
        └── [Segmento do Cliente]
            └── [Nome da Empresa]
                ├── [F] Informações
                ├── [F] Estratégia
                ├── Design/Criativos
                │   ├── Materiais
                │   │   └── [ANO ATUAL]
                │   ├── Conteúdo
                │   │   └── [ANO ATUAL]
                │   ├── Anúncios
                │   │   └── [ANO ATUAL]
                │   └── Outros
                │       └── [ANO ATUAL]
                └── [Pastas de serviços contratados]
                    ├── Produção de conteúdo (se contratado)
                    ├── Tráfego pago (se contratado)
                    └── IA (se contratado)
```

## Arquivos modificados/adicionados

- `lib/google-drive.js` - Módulo de integração com o Google Drive
- `app/api/drive/create-client-folders/route.js` - Endpoint para criar pastas
- `app/api/clientes/route.js` - Modificado para chamar a criação de pastas
- `app/dashboard/clientes/page.js` - Adicionado botão de acesso ao Drive
- `package.json` - Adicionada dependência `googleapis`
- `.env.local` - Adicionada variável `GOOGLE_CREDENTIALS_JSON`

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variável de ambiente no Vercel

A variável `GOOGLE_CREDENTIALS_JSON` já está no `.env.local` com as credenciais da Service Account do francaflow.

**Para o Vercel**, adicione esta variável nas configurações do projeto:
1. Vá em **Settings > Environment Variables**
2. Adicione `GOOGLE_CREDENTIALS_JSON` com o JSON da Service Account

### 3. Verificar permissão da Service Account no Drive

A Service Account precisa ter acesso ao Drive Compartilhado. 

**E-mail da Service Account:**
```
upload-service@upload-cliente-drive.iam.gserviceaccount.com
```

No Google Drive:
1. Abra o Drive Compartilhado da Franca
2. Clique em **Gerenciar membros** (ou nas configurações)
3. Adicione o e-mail acima como **Administrador de conteúdo**

### 4. Adicionar coluna no Supabase (se ainda não existir)

Execute este SQL no Supabase para adicionar a coluna que guarda o link da pasta:

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS pasta_drive TEXT;
```

## Como funciona

1. **Ao criar um cliente** no formulário, informe:
   - Nome da Empresa (obrigatório)
   - Segmento (obrigatório) 
   - Serviços Contratados (opcional, mas necessário para criar as pastas de serviços)

2. O sistema automaticamente:
   - Salva o cliente no banco de dados
   - Cria a estrutura de pastas no Drive
   - Salva o link da pasta no campo `pasta_drive`

3. **Na listagem de clientes**, aparecerá um badge "Drive" amarelo se a pasta existir

4. **No modal de detalhes**, aparecerá um botão "Abrir Drive" amarelo

## Testar a conexão

Para testar se o Drive está funcionando:

```bash
curl http://localhost:3000/api/drive/create-client-folders
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Conexão com Google Drive OK",
  "folderName": "Marketing, IA e TI"
}
```

## Serviços reconhecidos

O sistema reconhece os seguintes serviços no campo "Serviços Contratados":

| Texto digitado | Pasta criada |
|----------------|--------------|
| Tráfego Pago, Tráfego pago | Tráfego pago |
| Produção de Conteúdo, Conteúdo | Produção de conteúdo |
| IA, Inteligência Artificial | IA |

## Troubleshooting

### Erro "GOOGLE_CREDENTIALS_JSON não definida"
- Verifique se a variável está no `.env.local` ou nas variáveis do Vercel
- Reinicie o servidor de desenvolvimento

### Erro "Permission denied" ou "Access denied"
- Verifique se a Service Account tem acesso ao Drive Compartilhado
- Adicione o e-mail como membro do Drive

### Pastas não são criadas
- Verifique se o Segmento está preenchido
- Veja os logs no console do servidor
