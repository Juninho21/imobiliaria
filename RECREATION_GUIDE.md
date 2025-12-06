# 🏡 Guia de Recriação do Projeto - Corretora de Imóveis

Este documento contém todas as instruções necessárias para configurar, instalar e recriar este projeto do zero.

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: [React](https://reactjs.org/) (v19) via [Vite](https://vitejs.dev/)
*   **Linguagem**: JavaScript (JSX)
*   **Estilização**: CSS Vanilla (Modules/Global) + [BoxIcons](https://boxicons.com/) para ícones
*   **Animações**: [ScrollReveal](https://scrollrevealjs.org/)
*   **Carrossel**: [Swiper](https://swiperjs.com/)
*   **Backend & Banco de Dados**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
*   **Roteamento**: React Router DOM (v7)

---

## 🚀 Passo a Passo para Configuração

### 1. Inicializar o Projeto
```bash
# Criar projeto com Vite
npm create vite@latest imobiliaria -- --template react

# Entrar na pasta
cd imobiliaria

# Instalar dependências
npm install
```

### 2. Instalar Bibliotecas Adicionais
Execute o comando abaixo para instalar as libs usadas no projeto:
```bash
npm install firebase react-router-dom scrollreveal swiper boxicons
```
*(Nota: BoxIcons pode ser importado via CDN no `index.html` ou via npm)*

### 3. Configuração do Firebase 🔥

#### A. Criar Projeto
1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Crie um novo projeto (ex: `imobiliaria-2025`).
3.  Adicione um app **Web** </>.
4.  Copie as configurações (`firebaseConfig`) e crie um arquivo `src/firebase.js`.

#### B. Authentication (Autenticação)
1.  No menu **Authentication**, clique em "Get Started".
2.  Ative o provedor **Email/Password**.
3.  Ative o provedor **Google**.
4.  **Importante**: Para o Google Login funcionar em produção (Vercel), adicione o domínio do seu site em *Authentication > Settings > Authorized domains*.

#### C. Cloud Firestore (Banco de Dados)
1.  Crie um banco de dados no modo **Production**.
2.  Localização recomendada: `nam5` (us-central) ou `sa-east1` (São Paulo).
3.  As coleções serão criadas automaticamente pelo app, mas a estrutura usada é:
    *   `settings` (doc: `general`) - Configurações gerais do site.
    *   `properties` - Imóveis cadastrados (Subcoleção: `gallery`).
    *   `clients` - Clientes interessados.
    *   `invites` - Convites únicos para corretores.
    *   `messages` - Mensagens de contato.

#### D. Storage (Armazenamento)
1.  Inicie o Storage para comportar as imagens.
2.  Regras de segurança (básicas para desenvolvimento):
    ```
    allow read, write: if request.auth != null;
    allow read: if true; // Para imagens públicas do site
    ```

### 4. Estrutura de Arquivos Importantes

*   `src/firebase.js`: Inicialização do Firebase.
*   `src/contexts/AuthContext.jsx`: Gerencia login/logout e estado do usuário.
*   `src/contexts/SettingsContext.jsx`: Carrega configurações globais (título, cores, contatos).
*   `src/pages/Home.jsx`: Página principal (Pública).
*   `src/pages/Admin/`: Todas as páginas do painel administrativo.
*   `src/pages/RegisterBroker.jsx`: Página pública de cadastro de corretores (via convite).

### 5. Deployment na Vercel ☁️

1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Instale a CLI (opcional) ou conecte com seu **GitHub**.
3.  **Configuração Crítica**:
    Para que o roteamento (React Router) funcione e não dê erro 404 ao atualizar a página, crie um arquivo `vercel.json` na raiz do projeto com este conteúdo:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
4.  Faça o push para o GitHub e a Vercel fará o deploy automático.

---

## 📝 Comandos Úteis

*   `npm run dev`: Roda o projeto localmente.
*   `npm run build`: Gera a versão de produção na pasta `dist`.
*   `git push origin main`: Envia alterações e dispara deploy na Vercel (se conectado).

---

Este projeto foi construído com foco em **Mobile First** e facilidade de administração. Bons códigos! 🚀
