# Turbo GPT

Nova plataforma isolada da `platform/` antiga, criada para o produto focado em:

- `Prompts de Marketing & Conteúdo`
- `Hooks`

No estado atual, esta pasta funciona como uma plataforma premium em PT-BR, com autenticação própria via Supabase e validação de acesso pelo mesmo email usado na compra da Hotmart.

## Objetivo

Construir uma nova versão da plataforma com:

- catálogo enxuto, sem `skills`, `image prompts` e `video prompts`
- navegação por subcategorias
- interface 100% em PT-BR
- separação comercial em dois pacotes na página de vendas

Pacotes previstos:

1. `Prompts de Marketing & Conteúdo`
2. `Prompts + Hooks`

Importante:
os cards de preço não são o foco da plataforma neste momento. A lógica comercial deve ser tratada na página de vendas.

## Estado Atual

- login persistente com email + senha
- recuperação/definição de senha integrada
- validação de acesso pelo email da compra na Hotmart
- liberação por pacote com fallback seguro enquanto os `productIds` não forem preenchidos
- `690 prompts` ativos nas subcategorias visíveis
- `1.134 hooks` organizados em `15 categorias`
- abertura local via `index.html`, inclusive por `file://`
- plataforma antiga preservada em `platform/`

## Isolamento

Esta pasta é independente da plataforma antiga no runtime.

O `index.html` daqui carrega apenas arquivos da própria pasta `Turbo GPT/`.

Arquivos principais carregados pela aplicação:

- `index.html`
- `components.bundle.js`
- `llm-prompts-data.js`
- `content-hooks-data.js`
- `js/config.js`
- `js/i18n.js`
- `js/utils.js`
- `js/context.js`

## Estrutura

```text
Turbo GPT/
├── index.html
├── components.bundle.js
├── llm-prompts-data.js
├── content-hooks-data.js
├── components/
├── js/
├── scripts/
└── vercel.json
```

Pastas e arquivos relevantes:

- `components/`: fontes dos componentes em `*.babel.js`
- `components.bundle.js`: bundle pronto usado pelo HTML local
- `js/config.js`: configuração geral, subcategorias, pacotes e auth storage
- `js/i18n.js`: textos da interface
- `js/supabase-init.js`: bootstrap do cliente Supabase
- `llm-prompts-data.js`: base de prompts
- `content-hooks-data.js`: base de hooks
- `scripts/build-components-bundle.mjs`: recompila o bundle dos componentes
- `scripts/translate-datasets-ptbr.mjs`: script usado para traduzir datasets para PT-BR

## Como Abrir Localmente

Basta abrir:

- `index.html`

Não precisa subir servidor só para visualizar a base atual.

## Fluxo de Edição

Se você editar arquivos dentro de `components/`, regenere o bundle:

```bash
node scripts/build-components-bundle.mjs
```

Se você alterar textos ou lógica da interface, normalmente os arquivos afetados serão:

- `components/*.babel.js`
- `js/config.js`
- `js/i18n.js`

Se você alterar só os datasets:

- `llm-prompts-data.js`
- `content-hooks-data.js`

não precisa rebuildar o bundle.

## Conteúdo Ativo

Subcategorias de prompts expostas hoje:

- `Copywriting`
- `SEO & Conteúdo`
- `Vendas & E-commerce`
- `Redes Sociais`

Categorias de hooks:

- organizadas por padrão persuasivo
- filtráveis dentro da própria plataforma

## Arquivos Mantidos Mas Fora do Escopo Atual

Esses arquivos existem na pasta, mas não fazem parte da experiência ativa do produto novo:

- `skills-data.js`
- `image-prompts-data.js`
- `video-prompts-data.js`

Eles podem ser removidos ou ignorados depois, mas hoje não são carregados pelo `index.html`.

## Configuração Comercial

As definições de pacotes estão em:

- `js/config.js`

Campos que ainda podem precisar de ajuste:

- `priceLabel`
- `checkoutUrl`
- `productIds`

## Observações

- esta pasta ainda não representa automaticamente um deploy separado; isso depende de criar um projeto separado na Vercel ou publicar em rota/domínio próprio
- mudanças aqui não alteram a `platform/` antiga, desde que o deploy também seja separado
- o idioma padrão da interface é `ptbr`

## Próximos Passos Sugeridos

1. preencher os `productIds` reais dos dois pacotes
2. definir os IDs e links reais dos pacotes
3. criar a página de vendas do novo produto
4. publicar esta pasta em um projeto separado na Vercel
