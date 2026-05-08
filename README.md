# ⛪ GestaoQuadrangular — Frontend

> Interface web do Sistema de Gestão para Igreja Quadrangular em Células — SPA em React com painéis por perfil, autenticação JWT e geração de relatórios PDF no cliente.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Rodando Localmente](#-rodando-localmente)
- [Rodando com Docker](#-rodando-com-docker)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Integração com o Backend](#-integração-com-o-backend)

---

## 📖 Sobre o Projeto

O **GestaoQuadrangular Frontend** é uma Single Page Application (SPA) desenvolvida em React que consome a API REST do backend. O sistema possui painéis distintos por perfil de usuário — Administrador, Pastor, Secretaria, Líder de Célula e Tesouraria — com rotas protegidas por JWT e controle de acesso baseado em perfil (RBAC).

O frontend está hospedado na **Vercel** com suporte a rotas SPA via `vercel.json`.

---

## ✅ Funcionalidades

| Módulo | Perfil | Descrição |
|---|---|---|
| 🔐 **Login** | Todos | Autenticação com JWT, redirecionamento automático por perfil |
| 🏠 **Home** | Público | Página pública de apresentação do sistema |
| 👑 **Admin** | Admin | Gestão completa de usuários do sistema |
| ⛪ **Painel Pastor** | Pastor | Dashboard com métricas, alertas, ranking e pendências |
| 📊 **Relatório de Células** | Pastor | Análise detalhada por célula |
| 🏆 **Ranking de Células** | Pastor | Ranking de desempenho das células |
| 🔔 **Painel de Alertas** | Pastor | Visualização de alertas e pendências pastorais |
| 🎂 **Aniversariantes** | Pastor | Listagem de aniversariantes por período |
| 📈 **Discipulado** | Pastor | Relatórios e acompanhamento de discipulado |
| 🕊️ **Casas de Paz** | Pastor / Líder | Gestão e relatórios de Casas de Paz em PDF |
| 🏘️ **Solicitações de Multiplicação** | Pastor | Acompanhamento de células em processo de multiplicação |
| 📋 **Dashboard Líder** | Líder | Painel do líder com relatórios, fichas e visitantes |
| 📝 **Ficha de Encontros** | Líder | Registro e histórico de fichas de encontro |
| 👥 **Visitantes** | Líder / Secretaria | Cadastro e acompanhamento de visitantes |
| 📁 **Histórico de Relatórios** | Líder | Visualização de relatórios anteriores |
| 🗂️ **Secretaria — Membros** | Secretaria | Cadastro e gestão de membros |
| 🏠 **Secretaria — Células** | Secretaria | Gestão de células e vínculos |
| 📋 **Secretaria — Fichas** | Secretaria | Controle de fichas de encontro |
| 💰 **Tesouraria** | Tesoureiro | Dashboard financeiro, lançamentos, comparativos e dizimistas |

---

## 🛠️ Tecnologias

- **React 18.3** — biblioteca de UI
- **Vite 5.4** — bundler e dev server
- **React Router DOM 7** — roteamento SPA
- **Tailwind CSS 4.x** — estilização utilitária
- **Axios 1.x** — cliente HTTP com interceptors JWT
- **jwt-decode 4** — decodificação de tokens JWT no cliente
- **Recharts 3** — gráficos e visualizações de dados
- **jsPDF 4 + jspdf-autotable** — geração de PDFs no navegador
- **Framer Motion 12** — animações de interface
- **Lucide React** — biblioteca de ícones
- **React Hot Toast** — notificações toast
- **dayjs** — manipulação de datas
- **ESLint 9** — linting e qualidade de código

---

## 👤 Perfis de Acesso

O sistema utiliza RBAC (Role-Based Access Control) baseado no campo `perfil` do JWT.

| Perfil | Rota principal | Acesso |
|---|---|---|
| `ADMIN` | `/admin` | Gestão de usuários |
| `PASTOR` | `/pastor/*` | Painel pastoral completo |
| `SECRETARIO` | `/secretaria` | Membros, células e fichas |
| `LIDER_CELULA` | `/lider` | Dashboard do líder |
| `TESOUREIRO` | `/tesouraria/*` | Módulo financeiro |

Rotas protegidas pelo componente `PrivateRoute` que valida o JWT armazenado no `localStorage` e redireciona para `/unauthorized` em caso de perfil incompatível.

---

## 📁 Estrutura de Pastas

```
src/
├── auth/
│   └── AuthContext.jsx          # Contexto de autenticação global
├── components/
│   ├── ThemeToggle.jsx          # Alternador dark/light mode
│   └── UserForm.jsx             # Formulário de usuário reutilizável
├── context/
│   └── ThemeContext.jsx         # Contexto de tema (dark/light)
├── pages/
│   ├── Home.jsx                 # Página pública de apresentação
│   ├── Login.jsx                # Tela de login
│   ├── admin/
│   │   └── AdminUsers.jsx       # Gestão de usuários (Admin)
│   ├── pastor/
│   │   ├── PastorPage.jsx       # Layout e navegação do pastor
│   │   ├── PainelPastor.jsx     # Dashboard principal
│   │   ├── PainelAlertas.jsx    # Alertas e notificações
│   │   ├── RelatorioCelula.jsx  # Relatório por célula
│   │   ├── RelatorioCasasDePaz.jsx  # Casas de Paz (pastor)
│   │   ├── RankingCelulas.jsx   # Ranking de células
│   │   ├── Discipulado.jsx      # Discipulado pastoral
│   │   ├── Aniversariantes.jsx  # Aniversariantes
│   │   ├── TelaPendencias.jsx   # Pendências pastorais
│   │   └── SolicitacoesMultiplicacao.jsx
│   ├── lider/
│   │   ├── DashboardLider.jsx   # Painel do líder
│   │   ├── CasasDePazLider.jsx  # Casas de Paz (líder)
│   │   ├── TelaRelatorio.jsx    # Relatório da célula
│   │   ├── TelaFichas.jsx       # Fichas de encontro
│   │   ├── TelaVisitantes.jsx   # Visitantes
│   │   ├── RelatorioDiscipulado.jsx
│   │   ├── HistoricoRelatorios.jsx
│   │   └── ErrorBoundary.jsx
│   ├── secretaria/
│   │   ├── SecretariaPage.jsx   # Layout da secretaria
│   │   ├── Membros.jsx          # Gestão de membros
│   │   ├── Celulas.jsx          # Gestão de células
│   │   ├── SecretariaCelulas.jsx
│   │   ├── FichasEncontro.jsx   # Fichas de encontro
│   │   └── Visitante.jsx        # Visitantes
│   └── tesouraria/
│       ├── TesourariaPage.jsx   # Layout da tesouraria
│       ├── MenuTesouraria.jsx   # Menu principal
│       ├── TesourariaDashboard.jsx
│       ├── TesourariaLancamento.jsx
│       ├── TesourariaRegistros.jsx
│       ├── TesourariaRelatorio.jsx
│       ├── TesourariaComparativo.jsx
│       └── TesourariaDizimistas.jsx
├── routes/
│   └── ProtectedRoutes.jsx      # HOC de rotas protegidas
├── services/
│   ├── api.js                   # Instância Axios + interceptors JWT
│   └── authService.js           # Serviço de autenticação
├── styles/
│   └── theme.css                # Variáveis de tema CSS
├── utils/
│   └── jwt.js                   # Helpers de decodificação JWT
├── App.jsx                      # Roteamento principal
└── main.jsx                     # Entry point
```

---

## 📦 Pré-requisitos

- [Node.js 20+](https://nodejs.org/) (`.nvmrc` configurado)
- [Yarn](https://yarnpkg.com/) ou npm
- Backend rodando localmente ou na nuvem

---

## ⚙️ Configuração do Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Ou crie manualmente:

```env
# URL da API backend
VITE_API_URL=http://localhost:8080
```

Para apontar para o backend em produção no Render:

```env
VITE_API_URL=https://seu-backend.onrender.com
```

---

## ▶️ Rodando Localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/GestaoQuadrangular-Frontend.git
cd GestaoQuadrangular-Frontend

# Instale as dependências
yarn install
# ou: npm install

# Inicie o servidor de desenvolvimento
yarn dev
# ou: npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

---

## 🐳 Rodando com Docker

```bash
# Build da imagem
docker build -t gestao-quadrangular-frontend .

# Rodar o container
docker run -p 80:80 \
  -e VITE_API_URL=https://seu-backend.onrender.com \
  gestao-quadrangular-frontend
```

---

## 🚀 Deploy na Vercel

O projeto já está configurado para deploy contínuo na **Vercel** com suporte a roteamento SPA.

### Configuração automática (via Git)

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. A Vercel detecta automaticamente que é um projeto **Vite + React**
3. Configure as [variáveis de ambiente](#-variáveis-de-ambiente) no painel da Vercel
4. Clique em **Deploy** — a Vercel fará build e deploy automaticamente

### Configuração de build

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `yarn build` |
| **Output Directory** | `dist` |
| **Install Command** | `yarn install` |

### Suporte a SPA (vercel.json)

O arquivo `vercel.json` já está configurado na raiz do projeto para redirecionar todas as rotas para o `index.html`, garantindo que o React Router funcione corretamente:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API backend | `https://seu-backend.onrender.com` |

> ⚠️ No Vite, apenas variáveis prefixadas com `VITE_` são expostas ao cliente. Nunca exponha chaves secretas no frontend.

Configure as variáveis no painel da Vercel em **Settings → Environment Variables**, separando por ambiente (Production, Preview, Development).

---

## 🔗 Integração com o Backend

O frontend se comunica com o [GestaoQuadrangular Backend](../GestaoQuadrangular-Backend) via Axios, com interceptors configurados em `src/services/api.js`:

- **Interceptor de request:** injeta o `Bearer token` do `localStorage` em todas as requisições autenticadas
- **Interceptor de response:** detecta erros `401`, verifica expiração do token e redireciona para a home quando necessário
- Endpoints públicos ignorados pelo interceptor: `/auth/login`, `/auth/registro`, `/actuator`

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adiciona minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com ☕ e muito amor pela Igreja ⛪</p>
