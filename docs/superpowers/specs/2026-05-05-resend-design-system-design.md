# Design Spec — Resend Design System aplicado ao Turbo GPT

**Data:** 2026-05-05
**Abordagem aprovada:** C — Base Resend + identidade própria Turbo GPT

---

## Objetivo

Substituir o design system atual (inspirado em wescales.io, cards brancos sobre fundo escuro) pelo sistema visual do Resend: fundo preto puro, superfícies escuras, tipografia branca, bordas sutis em opacidade — mantendo o accent verde `#62FFB3` como diferenciador de identidade do Turbo GPT.

---

## Sistema de Cores

### Tokens CSS (substituir em `index.html`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#000000` | Fundo da página |
| `--surface` | `#0f0f0f` | Cards, painéis |
| `--surface-raised` | `#161616` | Hover states, inputs, botões secundários |
| `--border` | `rgba(255,255,255,0.08)` | Bordas padrão |
| `--border-hover` | `rgba(255,255,255,0.15)` | Bordas em hover/foco |
| `--text` | `#ffffff` | Texto principal |
| `--text-muted` | `#888888` | Labels, meta, texto secundário |
| `--accent` | `#62FFB3` | Logo, CTAs primários, filtros ativos |
| `--accent-dim` | `rgba(98,255,179,0.10)` | Backgrounds com accent |
| `--accent-text` | `#000000` | Texto sobre elementos com accent |

### Remover

- Gradiente `wescale-gradient` (azul → verde)
- Variáveis `--accent-blue`, `--gradient-primary`, `--gradient-soft`
- Radial gradients no `body` background

---

## Tipografia

- Fonte: Helvetica Now — mantida
- Hierarquia de pesos: mantida
- Mudança: todas as cores de texto migram para `--text` e `--text-muted`

---

## Componentes

### Header

- Background: `bg-black/90 backdrop-blur-xl`
- Border-bottom: `rgba(255,255,255,0.08)`
- Logo ícone `⚡`: fundo `#62FFB3`, texto `#000` (sem gradiente)
- Botão "Entrar": `bg-[#62FFB3] text-black font-black rounded-full`
- Input de busca: fundo `rgba(255,255,255,0.05)`, borda `rgba(255,255,255,0.08)`

### Cards de Hook

- Fundo: `#0f0f0f`
- Borda: `rgba(255,255,255,0.08)`
- Hover: borda `rgba(255,255,255,0.15)` + `translateY(-2px)`
- Texto principal: `#ffffff`
- Categoria/meta: `#888888`
- Barra lateral colorida (rail): mantida — identidade dos estilos de hook
- Badges ("Alta conversão", "Viral"): fundo `rgba(255,255,255,0.08)`, texto `#888`

### Cards de Prompt

- Mesmo padrão dos cards de hook
- Badge de subcategoria: fundo `rgba(255,255,255,0.06)`, texto `#888`

### Botões dentro de cards ("Copiar", "Salvar")

- Padrão: fundo `#161616`, borda `rgba(255,255,255,0.10)`, texto branco
- Hover: fundo `#1f1f1f`
- Estado copiado/salvo: fundo `#62FFB3`, texto `#000`

### Filtros (chips)

- Padrão: fundo `#161616`, borda `rgba(255,255,255,0.08)`, texto `#888`
- Hover: borda `rgba(255,255,255,0.15)`, texto branco
- Ativo: fundo `#62FFB3`, texto `#000`, sem sombra

### Content Format Cards (Reels, Story, etc.)

- Padrão: fundo `#0f0f0f`, borda `rgba(255,255,255,0.08)`
- Ativo: fundo `#62FFB3`, texto `#000`
- Hover: borda `rgba(255,255,255,0.15)` + `translateY(-2px)`

### View Mode Buttons (Todos / Favoritos / Recentes)

- Padrão: fundo `#161616`, borda `rgba(255,255,255,0.08)`, texto `#888`
- Ativo: fundo `#62FFB3`, texto `#000`

### Category Pills (subcategorias)

- Padrão: fundo `#161616`, borda `rgba(255,255,255,0.08)`, texto `#888`
- Ativo: fundo `#62FFB3`, texto `#000`

### Toggle de Conteúdo (Hooks | Prompts)

- Container: fundo `rgba(255,255,255,0.04)`, borda `rgba(255,255,255,0.08)`
- Opção ativa: fundo `#62FFB3`, texto `#000`
- Opção inativa: texto `#888`, hover texto branco

### Painel de Filtros

- Fundo: `#0f0f0f`, borda `rgba(255,255,255,0.08)`
- Labels uppercase: `#888888`

### Gate de Conteúdo (deslogado)

- Container: fundo `#0f0f0f`, borda `rgba(255,255,255,0.08)`
- Ícone cadeado: fundo `#62FFB3`, ícone `#000`
- Botão CTA: `bg-[#62FFB3] text-black`

### Modais (Login, Recuperar Senha, Redefinir Senha)

- Backdrop: `bg-black/80 backdrop-blur-md`
- Container: fundo `#0f0f0f`, borda `rgba(255,255,255,0.10)`, `rounded-2xl`
- Ícone no header do modal: fundo `#62FFB3`, ícone `#000`
- Inputs: fundo `#161616`, borda `rgba(255,255,255,0.10)`, texto branco (sem workaround de `color: #0c0a09`)
- Placeholder: `rgba(255,255,255,0.30)`
- Focus: borda `#62FFB3`, ring `rgba(98,255,179,0.20)`
- Botão submit: `bg-[#62FFB3] text-black`
- Link "Esqueci minha senha": cor `#62FFB3`
- Mensagem de erro: fundo `rgba(239,68,68,0.10)`, borda `rgba(239,68,68,0.20)`, texto `#ff6b6b`
- Mensagem de sucesso: fundo `rgba(98,255,179,0.10)`, borda `rgba(98,255,179,0.20)`, texto `#62FFB3`

### Menu de Conta (UserAccountMenu)

- Container: fundo `#0f0f0f`, borda `rgba(255,255,255,0.10)`
- Avatar: fundo `#62FFB3`, texto `#000`
- Botão "Sair": texto `#888`, hover fundo `rgba(255,255,255,0.05)` texto branco

### Detail Modal

- Backdrop e container: mesmo padrão dos outros modais
- Área de conteúdo: fundo `rgba(255,255,255,0.03)`, borda sutil
- `<pre>` text: texto branco

### Footer

- Fundo `#000`, texto `#888`

---

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `index.html` | CSS variables, background do body, remover radial gradients, remover `.wescale-gradient` |
| `components/app.babel.js` | Todas as classes Tailwind de cor/background/border |
| `components/layout.babel.js` | Background e footer |
| `components.bundle.js` | Recompilar após mudanças |

---

## O que NÃO muda

- Estrutura HTML/JSX dos componentes
- Lógica de filtros, favoritos, auth
- Fontes (Helvetica Now)
- Barras laterais coloridas dos hooks (identidade dos estilos)
- Ícones Lucide

---

## Critérios de sucesso

- Fundo completamente preto, sem radial gradients visíveis
- Cards legíveis com texto branco sobre `#0f0f0f`
- Accent verde `#62FFB3` aparece em: logo, botões primários, filtros ativos, modais
- Inputs dos modais com texto branco visível (sem o workaround de inline style)
- Bundle recompilado e validado (`node --check`)
- Servidor local funcionando sem erros visuais
