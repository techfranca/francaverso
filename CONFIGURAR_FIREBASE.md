# 🔥 Configuração do Firebase Auth - Francaverso

## ⏱️ Tempo estimado: 5 minutos

---

## Passo 1: Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Criar projeto"** (ou "Adicionar projeto")
3. Nome do projeto: `francaverso` (ou outro nome)
4. Desabilite o Google Analytics (não precisamos)
5. Clique em **"Criar projeto"**
6. Aguarde criar e clique em **"Continuar"**

---

## Passo 2: Habilitar Login com Google

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, clique em **"Google"**
4. Ative o toggle **"Ativar"**
5. Selecione seu e-mail de suporte
6. Clique em **"Salvar"**

✅ Pronto! O login com Google está habilitado.

---

## Passo 3: Registrar seu App Web

1. Na página inicial do projeto, clique no ícone **"Web"** (`</>`)
2. Apelido do app: `Francaverso Web`
3. **NÃO** marque "Firebase Hosting"
4. Clique em **"Registrar app"**
5. Vai aparecer um código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "francaverso-xxxxx.firebaseapp.com",
  projectId: "francaverso-xxxxx",
  storageBucket: "francaverso-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

6. **COPIE esses valores!**

---

## Passo 4: Configurar o .env.local

Abra o arquivo `.env.local` no projeto e substitua os valores do Firebase:

```env
# Firebase (autenticação)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=francaverso-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=francaverso-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=francaverso-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

---

## Passo 5: Adicionar Domínio Autorizado (Produção)

Se for fazer deploy em produção:

1. No Firebase Console, vá em **Authentication** > **Settings**
2. Na aba **"Authorized domains"**
3. Clique em **"Add domain"**
4. Adicione seu domínio (ex: `francaverso.vercel.app`)

---

## Passo 6: Criar Tabela de Clientes no Supabase

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase_setup.sql`
4. Clique em **"Run"**

---

## Passo 7: Atualizar Tabela de Users no Supabase

Execute também este SQL para adicionar a coluna firebase_uid na tabela users:

```sql
-- Adicionar coluna firebase_uid se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
```

---

## 🚀 Testar

1. Instale as dependências: `npm install`
2. Rode o projeto: `npm run dev`
3. Acesse: `http://localhost:3000`
4. Clique em **"Entrar com Google"**
5. Escolha sua conta Google
6. Você será redirecionado para o dashboard!

---

## ✅ Checklist Final

- [ ] Projeto Firebase criado
- [ ] Google Sign-In habilitado
- [ ] App Web registrado
- [ ] Variáveis do `.env.local` configuradas
- [ ] Domínio de produção autorizado (se aplicável)
- [ ] Tabela de clientes criada no Supabase
- [ ] Coluna firebase_uid adicionada na tabela users
- [ ] Teste de login funcionando

---

## 🆘 Problemas Comuns

### Erro "auth/popup-blocked"
- Permita popups para localhost no seu navegador

### Erro "auth/unauthorized-domain"
- Adicione o domínio em Firebase > Authentication > Settings > Authorized domains

### Usuário não aparece no banco
- Verifique se a API `/api/auth/sync` está funcionando
- Confira as credenciais do Supabase no `.env.local`

---

## 📝 Como funciona

1. Usuário clica em "Entrar com Google"
2. Firebase abre popup de login do Google
3. Após login, Firebase retorna os dados do usuário
4. O sistema sincroniza com Supabase (cria usuário se não existir)
5. Usuário é redirecionado para o dashboard

**Qualquer pessoa com conta Google pode fazer login!** Os dados ficam salvos no Supabase.

---

Desenvolvido com 💚 pela equipe Franca
