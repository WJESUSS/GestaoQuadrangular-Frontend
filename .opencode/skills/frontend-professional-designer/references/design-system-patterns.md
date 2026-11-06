# Design System — Tokens e Padrões

Referência agnóstica de framework. Adapte aos tokens e bibliotecas já existentes no projeto. Verifique a versão do Tailwind antes de aplicar (v4 usa `@theme`, v3 usa `tailwind.config`).

## 1. Tokens

### Cor

Defina papéis, não nomes genéricos:

- `background`, `surface`, `surface-elevated`
- `border`, `border-strong`
- `text`, `text-muted`, `text-subtle`
- `primary`, `primary-hover`, `primary-foreground`
- `success`, `warning`, `danger`, `info` (+ foreground)
- `focus-ring`

Regras:

- Use escala de cinzas neutra para superfícies; reserve cor para ação e status.
- Garanta contraste: texto normal ≥ 4.5:1, texto grande/ícone ≥ 3:1.
- Não use a cor primária em tudo; ela deve indicar ação/seleção.
- Suporte tema claro/escuro via tokens, não via `dark:` espalhado.

### Tipografia

- Display: 1 família com personalidade, uso contido (títulos e números-chave).
- Corpo: 1 família legível; tamanho base 14–16px.
- Utilitária: mesma família em pesos menores para labels e dados, se necessário.
- Escala sugerida: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48.
- Altura de linha: 1.2–1.3 para títulos, 1.5–1.6 para corpo.
- Peso: não use mais de 3 pesos por tela.
- Evite uppercase em blocos longos; use em labels curtos com espaçamento.

### Espaçamento

- Escala base 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Padding de card: 16–24px. Gap de grid: 16–24px.
- Espaço entre seções: 32–64px. Não invente valores intermediários.

### Raio, sombra e borda

- Raio: pequeno 6px (inputs/buttons), médio 10–12px (cards/modals), full para avatares/badges.
- Sombra: no máximo 2 níveis; prefira borda sutil + sombra leve.
- Borda: 1px com token de `border`; estados de foco usam ring, não borda grossa.

### Breakpoints

- `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
- Mobile-first; adapte estrutura, não apenas tamanho.

## 2. Componentes

### Button

- Variantes: `primary`, `secondary`, `ghost`, `danger`, `link`.
- Tamanhos: `sm` (32px), `md` (40px), `lg` (48px).
- Estados: hover, focus-visible, active, disabled, loading (spinner + texto).
- Ícone opcional com gap consistente; nunca só ícone sem `aria-label`.
- Uma ação primária por contexto.

### Input / Select / Textarea

- Altura consistente (40px padrão), borda 1px, raio pequeno.
- Label sempre visível; placeholder é exemplo, não label.
- Estados: default, hover, focus-visible, disabled, error, success.
- Erro com mensagem textual + `aria-invalid` + `aria-describedby`.
- Select com affordance clara e navegação por teclado.

### Card

- Use quando houver agrupamento real de informação.
- Estrutura: header (título + ação), body, footer opcional.
- Padding 16–24px, raio médio, borda sutil. Evite sombra pesada.
- Não aninhe cards sem necessidade.

### Modal

- Overlay com contraste; painel com raio médio e sombra.
- Header (título + fechar), body com scroll, footer com ações.
- Foco preso, ESC fecha, foco retorna ao gatilho.
- Ação destrutiva exige confirmação clara.

### Table

- Header discreto, linhas com hover, densidade controlada.
- Colunas: alinhamento à esquerda para texto, direita para números.
- Ações em dropdown quando houver 3+.
- Estados: loading (skeleton), vazio (empty state), erro, sem resultados de filtro.
- Mobile: converter em lista/cards ou permitir scroll controlado com colunas prioritárias.
- Busca, filtros, ordenação e paginação quando o volume justificar.

### Badge / Status

- Use cor + texto, nunca só cor.
- Mapeamento fixo: success, warning, danger, info, neutral.
- Tamanho pequeno, uppercase opcional apenas em labels curtos.

### Dropdown

- Gatilho com estado aberto; painel com sombra leve, raio médio.
- Navegação por teclado, fechamento ao clicar fora e ESC.
- Itens com ícone + label + atalho opcional; destrutivo em cor de perigo.

### Tooltip

- Complementa, não substitui label. Atraso curto, texto conciso.
- Acessível por foco e hover.

### Alert

- Variantes: info, success, warning, danger.
- Ícone + título + descrição + ação opcional.
- Não use para feedback efêmero; use toast.

### Skeleton

- Reproduz a forma do conteúdo real; animação suave e respeitando `prefers-reduced-motion`.
- Evite skeletons genéricos que não correspondem ao layout.

### Empty State

- Ícone/ilustração discreta, título claro, explicação curta e ação primária.
- Diferencie "nada criado ainda" de "nenhum resultado para o filtro".

## 3. Layout e navegação

### App shell

- Sidebar fixa no desktop, colapsável/off-canvas no mobile.
- Header com contexto da página, busca e ações do usuário.
- Conteúdo com largura máxima e respiro consistente.
- Indicação clara da rota ativa.

### PageHeader

- Título, descrição curta, ações primária/secundária.
- Breadcrumb quando houver hierarquia profunda.
- Ações alinhadas e responsivas (empilhar no mobile).

### Dashboard

- Priorize 3–5 métricas principais no topo (não uma grade de cards iguais sem propósito).
- Cada bloco deve responder a uma pergunta do usuário.
- Gráficos com título, unidade, legenda e estado vazio.
- Evite excesso de cores; use a paleta para séries e status.

### Formulários

- Agrupe campos por contexto, com títulos de seção.
- Grid de 1 coluna no mobile, 2 no desktop para campos curtos.
- Ajuda abaixo do campo; erro substitui ajuda.
- Ação primária clara; secundária "Cancelar".
- Não esconda campos essenciais atrás de accordions sem motivo.

## 4. Boas práticas de implementação

- Use tokens/classes compartilhadas; não repita valores mágicos.
- Extraia variantes com `cva`/mapas de classe ou o padrão já existente no projeto.
- Combine classes condicionalmente sem conflitos; evite múltiplas fontes de verdade para cor/tamanho.
- Prefira componentes composicionais (`Card`, `Card.Header`) quando o projeto já usa esse padrão.
- Mantenha props públicas; ao evoluir, preserve nomes e comportamentos.
- Não substitua dados, chamadas ou handlers existentes durante o redesign.
- Verifique contraste, foco e responsividade em cada componente alterado.

## 5. Anti-padrões

- Gradientes chamativos sem função.
- Tudo dentro de cards, cards dentro de cards.
- Sombras fortes em todos os elementos.
- Raios muito grandes em componentes de dados.
- Ícones decorativos repetidos sem significado.
- Animações em excesso ou que atrapalham tarefas.
- Texto cinza claro sobre fundo claro.
- Muitas cores de destaque competindo.
- Layout que só encolhe no mobile.
- Botões sem ação ou ações duplicadas com nomes diferentes.
