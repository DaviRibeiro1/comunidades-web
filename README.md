# 🏘️ Comunidades Web

> Frontend web do marketplace de serviços comunitários — desenvolvido com React + Vite

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy](#-deploy)
- [Projetos Relacionados](#-projetos-relacionados)

---

## 📌 Sobre o Projeto

Interface web do **Comunidades**, plataforma que conecta moradores de um mesmo bairro ou condomínio por meio de um marketplace de serviços e produtos. Cada comunidade possui seu próprio espaço fechado com membros, anúncios e gestão independentes.

Este repositório contém apenas o **frontend web**. O backend está em [comunidades-api](https://github.com/[org]/comunidades-api).

**URL de produção:** `https://comunidades-web-3vzc.vercel.app`  
**API utilizada:** `https://web-production-8f5c4.up.railway.app`

---

## ✨ Funcionalidades

- 🔐 **Login e cadastro** via convite por e-mail
- 🏘️ **Feed de anúncios** com atualização em tempo real (SSE)
- 🔍 **Filtros** por categoria (Serviço/Produto) e busca por texto
- 📢 **Publicação de anúncios** com foto (upload via Cloudinary)
- 🤝 **Candidaturas** — candidatar-se, acompanhar e cancelar
- 🏗️ **Gerenciar comunidade** — membros, anúncios e convites em tela unificada com abas
- 🏘️ **Minhas comunidades** — lista todas com papel e estatísticas
- 🔔 **Notificações acionáveis** — aprovação de comunidade e convite de promoção abrem modal ao clicar
- ⚙️ **Editar e excluir comunidade** com confirmação por digitação do nome
- 👑 **Painel do Dono** — aprovar/rejeitar pedidos e visualizar todas as comunidades
- 📱 **Design responsivo** — funciona em computador, tablet e celular

---

## 🗂️ Estrutura do Projeto

```
comunidades-web/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── services.js
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   └── ui/
│   │       └── Badge.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useCommunities.js
│   │   ├── useNotifications.js
│   │   └── useSSE.js           
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RequestCommunityPage.jsx
│   │   │   └── AcceptInvitePage.jsx
│   │   ├── shared/
│   │   │   ├── HomePage.jsx
│   │   │   ├── MyCommunitiesPage.jsx
│   │   │   ├── ManageCommunityPage.jsx
│   │   │   └── NotificationsPage.jsx   
│   │   ├── member/
│   │   │   ├── MyServicesPage.jsx
│   │   │   └── MyApplicationsPage.jsx
│   │   └── owner/
│   │       ├── PendingRequestsPage.jsx
│   │       └── AllCommunitiesPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Tecnologias

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 18.3.1 |
| Bundler | Vite | 5.4.0 |
| Roteamento | React Router DOM | 6.26.0 |
| Upload de imagens | Cloudinary | Free tier |
| Eventos em tempo real | SSE (nativo) | — |
| Estilização | CSS puro (variáveis) | — |
| Deploy | Vercel | — |

---

## 📦 Pré-requisitos

- Node.js 18+
- npm ou yarn
- API do Comunidades rodando (local ou produção)

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/[org]/comunidades-web.git
cd comunidades-web
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute em modo desenvolvimento

```bash
npm run dev
```

### 4. Build para produção

```bash
npm run build
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz com as seguintes variáveis:

```env
# URL base da API backend
VITE_API_URL=http://localhost:8000

# Cloudinary — upload de fotos dos anúncios
VITE_CLOUDINARY_CLOUD_NAME=seu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=comunidades_preset
```

Em produção (Vercel), configure as mesmas variáveis no dashboard:  
**Vercel → Projeto → Settings → Environment Variables**

```env
VITE_API_URL=https://web-production-8f5c4.up.railway.app
VITE_CLOUDINARY_CLOUD_NAME=dm2vqfwnd
VITE_CLOUDINARY_UPLOAD_PRESET=comunidades_preset
```

> ⚠️ Todas as variáveis expostas ao browser devem começar com `VITE_`. O arquivo `.env` não deve ser versionado.

---

## 🧭 Papéis e Navegação

O menu lateral é gerado dinamicamente com base no papel do usuário na comunidade ativa (`my_role`):

| Papel | Itens do menu |
|---|---|
| **Admin** | Início, Pedidos Pendentes, Todas as Comunidades, Notificações |
| **Fundador** | Início, Minhas Comunidades, Gerenciar Comunidade, Notificações |
| **Gerente** | Início, Minhas Comunidades, Gerenciar Comunidade, Notificações |
| **Membro** | Início, Minhas Comunidades, Meus Anúncios, Minhas Candidaturas, Notificações |

---

## 🚢 Deploy

O deploy é feito automaticamente pela **Vercel** a cada push na branch `main`.

```
Push em main
    → Vercel detecta alteração
        → npm run build
            → publica em comunidades-web-3vzc.vercel.app ✓
```

Para fazer deploy manual via CLI:

```bash
npm install -g vercel
vercel --prod
```

---

## 📁 Padrão de Código

### Chamadas à API

Todas as chamadas usam o helper `apiFetch` de `src/api/client.js`:

```javascript
// Exemplo de uso
import { apiFetch } from '../api/client'

const data = await apiFetch('/communities/', { token })
```

Os endpoints ficam organizados em `src/api/services.js`:

```javascript
export const communitiesApi = {
  list:   (token) => apiFetch('/communities/', { token }),
  update: (token, id, body) => apiFetch(`/communities/${id}`, { method: 'PATCH', token, body }),
  delete: (token, id) => apiFetch(`/communities/${id}`, { method: 'DELETE', token }),
}
```

### Contextos globais

```javascript
// Autenticação
const { user, token, logout } = useAuth()

// Toast
const toast = useToast()
toast('Salvo com sucesso!')
toast('Erro ao salvar', 'error')
```

---

## 🔗 Projetos Relacionados

- **API Backend:** [comunidades-api](https://github.com/[org]/comunidades-api) — Python + FastAPI
- **Aplicativo Android:** [comunidades-android](https://github.com/[org]/comunidades-android) — Kotlin + Jetpack Compose

---

<div align="center">
  <p>Desenvolvido como Projeto Integrador VI — Fatec Osasco</p>
  <p>Tecnologia em Desenvolvimento de Software Multiplataforma — 2026</p>
</div>
