# Checklist de Auditoria

Use antes de modificar qualquer arquivo. Registre achados e o que deve ser preservado.

## 1. Tecnologias e arquitetura

- [ ] Framework e versão (React, Vue, Next, Vite, etc.) confirmados em `package.json`/config.
- [ ] Linguagem (JS/TS) e nível de tipagem.
- [ ] Estilização real: Tailwind, CSS Modules, styled-components, SCSS, CSS puro.
- [ ] Versão do Tailwind e método de configuração (v3 config vs v4 `@theme`).
- [ ] Biblioteca de componentes/UI e de ícones disponíveis.
- [ ] Roteamento e estrutura de layouts/providers.
- [ ] Gerenciamento de estado e de dados (Context, Redux, React Query, etc.).
- [ ] Gráficos, datas, formulários, uploads, PDF/exportação.
- [ ] Scripts de dev, build, lint, typecheck e teste.

## 2. Estrutura

- [ ] Mapa de diretórios e responsabilidades.
- [ ] Páginas/rotas identificadas.
- [ ] Componentes compartilhados vs locais.
- [ ] Componentes duplicados ou quase idênticos.
- [ ] Estilos globais, tokens, tema e fontes.
- [ ] Pontos de entrada e boundary de erros/loading.

## 3. Preservação funcional

- [ ] Endpoints e contratos de API mapeados.
- [ ] Autenticação, autorização e permissões.
- [ ] Rotas e parâmetros.
- [ ] Contextos, hooks e estados globais.
- [ ] Regras de negócio embutidas em componentes.
- [ ] Formulários: validação, máscaras, submit, uploads.
- [ ] Integrações externas, relatórios e exportações.
- [ ] Dados reais e formatos esperados.

Marque explicitamente o que **não pode ser alterado**.

## 4. Consistência visual

- [ ] Existem tokens ou valores mágicos repetidos?
- [ ] Botões têm variantes e tamanhos consistentes?
- [ ] Inputs/selects compartilham altura, borda, foco e erro?
- [ ] Cards usam o mesmo raio, sombra, padding e título?
- [ ] Tabelas têm o mesmo padrão de header, linhas, ações e estados?
- [ ] Badges/chips comunicam status de forma uniforme?
- [ ] Modais têm mesmo header, footer, overlay e comportamento?
- [ ] Espaçamentos seguem uma escala?
- [ ] Tipografia tem escala e pesos definidos?
- [ ] Paleta é coerente e tem contraste adequado?

## 5. UX e hierarquia

- [ ] Título de página e ações primárias estão claros?
- [ ] Existe uma única ação primária por contexto?
- [ ] Ações destrutivas estão diferenciadas e confirmadas?
- [ ] Estados de loading, erro e vazio existem?
- [ ] Feedback de sucesso/erro é visível e próximo da ação?
- [ ] Navegação indica localização atual?
- [ ] Formulários têm labels, ajuda, validação e agrupamento lógico?
- [ ] Tabelas/listas têm busca, filtros, ordenação e paginação quando necessário?
- [ ] Textos usam linguagem do usuário e verbos claros?

## 6. Responsividade

- [ ] Sem overflow horizontal em 320–1440px.
- [ ] Grids se reorganizam, não apenas encolhem.
- [ ] Sidebar/header adaptam ou colapsam.
- [ ] Tabelas viram lista/cards no mobile quando necessário.
- [ ] Ações importantes continuam acessíveis no toque.
- [ ] Modais cabem na tela e permitem scroll interno.
- [ ] Tipografia e espaçamento escalam.

## 7. Acessibilidade

- [ ] HTML semântico (nav, main, header, section, button vs div).
- [ ] Labels associados a inputs.
- [ ] Foco visível e ordem de tabulação lógica.
- [ ] Contraste de texto e ícones adequado.
- [ ] Ícones decorativos com `aria-hidden`; interativos com nome acessível.
- [ ] Modais com foco preso, ESC e restauração de foco.
- [ ] Mensagens de erro anunciáveis.
- [ ] `prefers-reduced-motion` respeitado.

## 8. Validação

- [ ] Build executa sem erros.
- [ ] Lint executa sem erros novos.
- [ ] Typecheck (se existir) sem erros.
- [ ] Testes (se existirem) passam.
- [ ] Imports e rotas íntegros.
- [ ] Funcionalidades afetadas testadas manualmente.
