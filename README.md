# 🌐 FRANCAVERSO

Portal centralizado de ferramentas e sistemas da Franca.

## 📋 Descrição

O Francaverso é uma plataforma web que centraliza todas as ferramentas, sistemas e links importantes da Franca em um único lugar, facilitando o acesso rápido e organizado para toda a equipe.

## ✨ Funcionalidades

- 🔐 **Autenticação Google**: Login seguro via Google OAuth (Supabase Auth)
- 🏢 **Gestão de Clientes**: Histórico completo de todos os clientes (ativos e inativos)
- 🎨 **Interface Moderna**: Design baseado na identidade visual da Franca
- 📊 **Dashboard Intuitivo**: Visualização clara de todas as ferramentas organizadas por categoria
- 🔗 **Acesso Rápido**: Redirecionamento instantâneo para todas as plataformas
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🚀 Tecnologias

- **Next.js 14**: Framework React com App Router
- **Supabase**: Autenticação e Banco de Dados
- **Tailwind CSS**: Estilização moderna e responsiva
- **Lucide React**: Ícones elegantes
- **Google Fonts**: Fonte Poppins (identidade visual Franca)

## 📦 Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure o Firebase:**
- Siga as instruções em `CONFIGURAR_FIREBASE.md`

3. **Execute o SQL no Supabase:**
- Execute o conteúdo de `supabase_setup.sql` no SQL Editor do Supabase

4. **Execute o projeto em modo de desenvolvimento:**
```bash
npm run dev
```

5. **Acesse no navegador:**
```
http://localhost:3000
```

## 👥 Acesso

O sistema usa autenticação via **Google** (Firebase Auth). **Qualquer pessoa com conta Google pode fazer login!**

O primeiro login cria automaticamente o usuário no banco de dados.

## 📂 Estrutura de Páginas

- `/` - Login com Google
- `/dashboard` - Página inicial
- `/dashboard/ferramentas` - Ferramentas e links
- `/dashboard/membros` - Membros da equipe
- `/dashboard/clientes` - **NOVO!** Histórico de clientes
- `/dashboard/academia` - Conteúdos educacionais
- `/dashboard/configuracoes` - Configurações do perfil

## 🏢 Módulo de Clientes

O novo módulo de clientes inclui:

- 📇 **Cards de Clientes**: Visão rápida de cada cliente
- 🔍 **Busca**: Pesquise por nome, empresa ou tag
- 🏷️ **Filtros**: Filtre por status (Ativo/Inativo) e segmento
- 📊 **Estatísticas**: Total de clientes, ativos e inativos
- 📋 **Detalhes Completos**: Modal com todas as informações do cliente:
  - Dados pessoais (nome, e-mail, telefone, aniversário)
  - Endereço completo
  - Informações do serviço (segmento, nicho, valor, forma de pagamento)
  - Histórico (data de início, data de encerramento)

## 🛠️ Ferramentas Incluídas

### 📊 Projetos Franca
- Franca Daily
- Franca Flow

### 🤖 Inteligência Artificial
- ChatGPT
- Claude AI

### 💻 Desenvolvimento
- Drive Franca
- Vercel
- V0
- GitHub
- Supabase

### ⚡ Automação
- n8n
- Make
- Uazapi

## 🌈 Cores da Marca

- Verde Principal: `#7DE08D`
- Verde Escuro: `#598F74`
- Azul: `#081534`

## 📱 Deploy

Para fazer deploy na Vercel:

```bash
npm run build
```

Ou conecte o repositório GitHub diretamente na Vercel.

**Importante**: Configure as variáveis de ambiente na Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (URL do seu site em produção)

## 📄 Licença

© 2024-2025 Franca. Todos os direitos reservados.

## 🤝 Suporte

Em caso de dúvidas ou problemas, entre em contato com a equipe de tecnologia.

---

Desenvolvido com 💚 pela equipe Franca | Versão 2.1.0
