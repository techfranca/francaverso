# 🚀 GUIA RÁPIDO - FRANCAVERSO

## Passo a Passo para Começar

### 1️⃣ Abrir o Projeto
```bash
cd metaverso
```

### 2️⃣ Instalar Dependências
```bash
npm install
```
*Aguarde alguns minutos enquanto as dependências são instaladas*

### 3️⃣ Iniciar o Servidor
```bash
npm run dev
```

### 4️⃣ Acessar no Navegador
Abra seu navegador e acesse: **http://localhost:3000**

### 5️⃣ Fazer Login
- Selecione seu usuário
- Digite a senha: `xxxxx-xxxxx`
- Clique em "Entrar no Francaverso"

## 🎯 Pronto!
Agora você pode acessar todas as ferramentas da Franca em um só lugar!

---

## 📦 Deploy na Vercel (Opcional)

1. Crie uma conta na Vercel: https://vercel.com
2. Conecte seu repositório GitHub
3. A Vercel detectará automaticamente que é um projeto Next.js
4. Clique em "Deploy"
5. Pronto! Seu Francaverso estará online! 🚀

---

## ❓ Problemas?

Se encontrar algum erro:

1. Verifique se o Node.js está instalado: `node --version`
   - Versão mínima recomendada: 18.x ou superior

2. Delete a pasta `node_modules` e o arquivo `package-lock.json`
   - Depois rode `npm install` novamente

3. Limpe o cache do Next.js:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 🎨 Personalização

Para adicionar novas ferramentas, edite o arquivo:
`app/dashboard/page.js`

Procure pelo objeto `tools` e adicione seus novos itens nas categorias existentes.

---

Dúvidas? Fale com o Davidson! 💚
