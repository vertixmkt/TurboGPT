# Roadmap - Turbo GPT

Roadmap de andamento da nova plataforma Turbo GPT, isolada da plataforma antiga em `App Vertix Skills Platform/platform`.

## Visao do Produto

Transformar a biblioteca de hooks e prompts em uma ferramenta pratica para criacao de conteudo, com fluxo guiado, filtros rapidos, favoritos e experiencia premium de baixo atrito.

Escopo atual do produto:

- Hooks para criacao de conteudo.
- Prompts de marketing e conteudo.
- Interface PT-BR.
- Acesso premium via Supabase/Hotmart.
- MVP sem geracao com IA dentro da plataforma.

Fora do escopo atual:

- Geracao automatica por LLM.
- Plataforma antiga.
- Skills, image prompts e video prompts como experiencia ativa.

## Estado Atual

Concluido:

- Projeto isolado em `Turbo GPT/`.
- `index.html` carrega apenas arquivos da propria pasta.
- Base ativa com `690 prompts` nas subcategorias permitidas.
- Base ativa com `1.134 hooks`.
- Interface simplificada para `Hooks | Prompts`.
- Fluxo principal: formato de conteudo > filtros > categorias > lista.
- Filtros combinaveis para hooks e prompts:
  - formato: Reels, Story, Post carrossel, Anuncio, VSL
  - objetivo: ATRAI, ENGAJA, VENDE, EDUCA
  - estilo: Curiosidade, Polemica, Urgencia, Storytelling, Autoridade
  - agressividade: Suave, Moderado, Forte
- Busca local em tempo real.
- Cards de hooks com:
  - copiar em 1 clique
  - salvar em 1 clique
  - badges visuais de valor percebido
  - feedback de copia
- Favoritos via `localStorage`.
- Usados recentemente via `localStorage`.
- Contador de ideias salvas.
- Menu de usuario no topo.
- Design system dark inspirado em `wescales.io`.
- Fontes locais `Helvetica Now` em `assets/fonts/`.
- Bundle recompilado em `components.bundle.js`.

## Arquivos Principais

- `index.html`: shell da aplicacao, tokens visuais, fontes e scripts.
- `components/app.babel.js`: interface principal, filtros, cards, favoritos, recentes e auth header.
- `components/layout.babel.js`: background e footer.
- `components.bundle.js`: bundle usado pelo HTML.
- `js/config.js`: Supabase, pacotes comerciais, subcategorias visiveis.
- `js/supabase-init.js`: cliente Supabase.
- `js/utils.js`: busca, ranking e helpers.
- `llm-prompts-data.js`: dataset de prompts.
- `content-hooks-data.js`: dataset de hooks.

## Como Rodar Localmente

Para visualizar a UI simples, `file://` ainda abre o HTML.

Para validar login/logout e Supabase Auth, usar servidor local:

```bash
python3 -m http.server 4173
```

Abrir:

```text
http://localhost:4173/index.html
```

Motivo: `file://` nao e um ambiente confiavel para Supabase Auth, persistencia de sessao, redirects e limpeza de storage.

## Pontos Criticos Abertos

### 1. Login e Logout

Status: em investigacao.

O header ja le a sessao com `supabaseClient.auth.getSession()` e tenta logout local com:

- `signOut({ scope: "local" })`
- limpeza de `turbo-gpt-auth`
- limpeza de chaves `sb-*`
- limpeza de chaves `supabase.auth.*`
- flag local `turbo-gpt-force-logout`

Problema atual:

- Usuario reportou que clicar em `Sair da plataforma` ainda nao remove a sessao.

Proxima acao:

- Testar exclusivamente em `http://localhost:4173/index.html`.
- Inspecionar DevTools > Application > Local Storage para identificar a chave exata que esta mantendo a sessao.
- Se necessario, implementar uma tela/modal de auth propria e centralizar todo o fluxo de sessao.

### 2. Formulario de Login

Status: pendente.

A UI atual mostra o usuario logado no topo, mas a experiencia simplificada ainda precisa definir onde o login aparece:

- modal de login;
- tela bloqueada antes da biblioteca;
- painel lateral;
- rota/tela separada.

Decisao recomendada:

- Para low-ticket, usar modal simples de login no topo quando o usuario estiver deslogado.

### 3. Controle Real de Acesso

Status: parcialmente implementado na base antiga de componentes, precisa reintegracao na UI nova.

Pendencias:

- Validar email da compra Hotmart.
- Preencher `productIds` reais em `js/config.js`.
- Separar acesso por pacote:
  - Prompts de Marketing & Conteudo
  - Prompts + Hooks
- Remover fallback quando os IDs comerciais estiverem prontos.

### 4. Deploy

Status: pendente.

Pendencias:

- Criar projeto separado na Vercel ou deploy proprio.
- Garantir que a plataforma antiga continue isolada.
- Configurar URLs autorizadas no Supabase Auth.
- Testar auth em dominio final.

## Proximos Marcos

### Marco 1 - Auth Estavel

Objetivo: login/logout confiavel em localhost e deploy.

Tarefas:

- Confirmar storage real criado pelo Supabase.
- Corrigir logout definitivamente.
- Criar modal/tela de login na UI nova.
- Adicionar feedback visual de login, erro e logout.
- Validar persistencia apos reload.

### Marco 2 - Acesso Comercial

Objetivo: liberar conteudo de acordo com pacote comprado.

Tarefas:

- Preencher `productIds`.
- Validar email da compra.
- Mapear pacote para conteudos liberados.
- Mostrar estado bloqueado quando necessario.
- Ajustar mensagens de upgrade para pacote completo.

### Marco 3 - UX de Conteudo

Objetivo: aumentar valor percebido sem IA.

Tarefas:

- Refinar ranking dos filtros por formato.
- Criar colecoes prontas por nicho/objetivo.
- Adicionar tags de uso nos prompts.
- Melhorar favoritos com busca dentro de favoritos.
- Adicionar botao para limpar filtros.
- Adicionar estado vazio mais util com sugestoes de filtros.

### Marco 4 - Qualidade Visual

Objetivo: consolidar o design system Turbo GPT.

Tarefas:

- Revisar spacing mobile.
- Refinar contraste de badges coloridos no dark mode.
- Padronizar radius, sombras e bordas.
- Criar estados hover/focus acessiveis.
- Remover resquicios de classes antigas claras quando nao forem mais necessarias.

### Marco 5 - Publicacao

Objetivo: colocar o produto em ambiente real.

Tarefas:

- Publicar em Vercel/projeto separado.
- Configurar dominio.
- Configurar redirects Supabase.
- Testar login, logout, reload, recuperar senha e acesso por pacote.
- Atualizar README com URL de producao.

## Riscos

- Supabase Auth em `file://` pode gerar comportamento inconsistente.
- A UI nova simplificada pode ter perdido partes do fluxo antigo de acesso.
- `components.bundle.js` precisa ser recompilado sempre que `components/*.babel.js` mudar.
- `components.bundle.js` esta no runtime principal; se ficar desatualizado, o HTML nao reflete o fonte.
- Os datasets antigos fora de escopo ainda existem na pasta e podem confundir manutencao futura.

## Decisoes Ja Tomadas

- Nao mexer na plataforma antiga.
- Foco atual em MVP/low-ticket.
- Nao implementar LLM agora.
- Aumentar valor percebido com filtros, favoritos, recentes e UX guiada.
- Usar design dark inspirado em `wescales.io`, mas mantendo a estrutura funcional do Turbo GPT.

## Comandos Uteis

Recompilar componentes:

```bash
node scripts/build-components-bundle.mjs
```

Rodar servidor local:

```bash
python3 -m http.server 4173
```

Validar sintaxe do bundle:

```bash
node --check components.bundle.js
```
