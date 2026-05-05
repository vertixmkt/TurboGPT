// ── Config ───────────────────────────────────────────────────────────────
window.APP_CONFIG = {
  ITEMS_PER_PAGE:    24,
  DEFAULT_LANG:      "ptbr",
  SUPABASE_URL:      "https://ezdqcvcdptvzxnfhcgvo.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ACQdfSHgT0day9tCjakkCA_xktUkCRG",
  SUPABASE_AUTH_STORAGE_KEY: "turbo-gpt-auth",
  AUTH_REDIRECT_URL: "",

  PROMPTS_ALLOWED_SUBCATEGORIES: [
    "Copywriting",
    "SEO & Content",
    "Sales & E-commerce",
    "Social Media",
  ],

  PROMPT_SUBCATEGORY_LABELS: {
    "Copywriting": "Copywriting",
    "SEO & Content": "SEO & Conteúdo",
    "Sales & E-commerce": "Vendas & E-commerce",
    "Social Media": "Redes Sociais",
  },

  PACKAGE_DEFINITIONS: [
    {
      key: "prompts",
      badge: "Pacote 1",
      name: "Prompts de Marketing & Conteúdo",
      description: "Biblioteca focada em copy, SEO, conteúdo, redes sociais e vendas.",
      priceLabel: "Preço a definir",
      checkoutUrl: "#",
      productIds: [],
      includedItems: [
        "690 prompts curados para marketing e geração de conteúdo",
        "Filtros por Copywriting, SEO & Conteúdo, Redes Sociais e Vendas",
      ],
      contentTypes: ["llm-prompts"],
      buttonLabel: "Comprar pacote de prompts",
    },
    {
      key: "complete",
      badge: "Pacote 2",
      name: "Prompts + Hooks",
      description: "Inclui toda a biblioteca de prompts e também os hooks organizados por categoria.",
      priceLabel: "Preço a definir",
      checkoutUrl: "https://pay.hotmart.com/O104727779W",
      productIds: [],
      includedItems: [
        "Tudo do pacote de prompts",
        "1.134 hooks organizados em 15 categorias",
      ],
      contentTypes: ["llm-prompts", "content-hooks"],
      buttonLabel: "Comprar prompts + hooks",
    },
  ],
};
