// ── Utilities ─────────────────────────────────────────────────────────────
var PROMPT_SEARCH_INTENTS = [
  {
    id: "vendas",
    label: "Vendas",
    aliases: ["venda", "vendas", "oferta", "ofertas", "checkout", "funil", "conversao", "e-commerce", "ecommerce", "comprar"],
    subcategories: ["Copywriting", "Sales & E-commerce"],
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    aliases: ["conteudo", "post", "postagem", "postagens", "legenda", "legendas", "roteiro", "roteiros", "artigo", "artigos", "blog", "feed"],
    subcategories: ["Copywriting", "SEO & Content", "Social Media"],
  },
  {
    id: "carrossel",
    label: "Carrossel",
    aliases: ["carrossel", "carrosseis", "slide", "slides", "sequencia", "sequencias", "instagram carousel"],
    subcategories: ["Social Media"],
  },
  {
    id: "anuncios",
    label: "Anúncios",
    aliases: ["anuncio", "anuncios", "ads", "campanha", "campanhas", "criativo", "criativos", "trafego", "copy de anuncio"],
    subcategories: ["Copywriting", "Sales & E-commerce", "Social Media"],
  },
  {
    id: "seo",
    label: "SEO",
    aliases: ["seo", "palavra-chave", "palavras-chave", "keyword", "keywords", "google", "organico", "serp", "ranqueamento"],
    subcategories: ["Copywriting", "SEO & Content"],
  },
  {
    id: "social",
    label: "Redes Sociais",
    aliases: ["instagram", "tiktok", "reels", "stories", "story", "shorts", "linkedin", "social media", "rede social", "redes sociais"],
    subcategories: ["Social Media"],
  },
  {
    id: "youtube",
    label: "YouTube",
    aliases: ["youtube", "thumbnail", "thumb", "video", "videos", "shorts", "titulo de video", "titulo do youtube"],
    subcategories: ["Copywriting", "Social Media"],
  },
  {
    id: "cta",
    label: "CTA",
    aliases: ["cta", "call to action", "chamada para acao", "conversao", "inscrever", "comprar", "clique", "captacao", "lead"],
    subcategories: ["Copywriting", "Sales & E-commerce", "Social Media"],
  },
];

var HOOK_SEARCH_INTENTS = [
  {
    id: "curiosidade",
    label: "Curiosidade",
    aliases: ["curiosidade", "curioso", "descobrir", "pergunta", "perguntas", "por que", "como assim"],
    categoryIds: ["1-segredo-informao-oculta", "5-perguntas-curiosidade", "11-what-if-imaginao"],
  },
  {
    id: "segredo",
    label: "Segredo",
    aliases: ["segredo", "oculto", "ninguem sabe", "ninguem te conta", "informacao oculta", "revelado"],
    categoryIds: ["1-segredo-informao-oculta"],
  },
  {
    id: "polemica",
    label: "Polêmica",
    aliases: ["polemica", "discordo", "contrario", "contrariacao", "choque", "surpresa", "polarisar", "impopular"],
    categoryIds: ["2-choque-surpresa", "3-polmica-contrariao"],
  },
  {
    id: "storytelling",
    label: "Storytelling",
    aliases: ["storytelling", "historia", "historia pessoal", "caso real", "jornada", "narrativa"],
    categoryIds: ["6-storytelling-histria-pessoal"],
  },
  {
    id: "dor",
    label: "Dor",
    aliases: ["dor", "problema", "erro", "travado", "dificuldade", "frustracao", "medo", "perda"],
    categoryIds: ["9-problema-dor"],
  },
  {
    id: "tutorial",
    label: "Tutorial",
    aliases: ["tutorial", "passo a passo", "como fazer", "how to", "solucao", "review", "teste", "experimento"],
    categoryIds: ["7-teste-experimento-review", "10-tutorial-howto-soluo"],
  },
  {
    id: "urgencia",
    label: "Urgência",
    aliases: ["urgencia", "agora", "hoje", "antes que", "cta direto", "ultimas vagas", "rapido"],
    categoryIds: ["8-urgncia-cta-direto"],
  },
  {
    id: "transformacao",
    label: "Transformação",
    aliases: ["transformacao", "resultado", "antes e depois", "conquista", "mudanca", "evolucao"],
    categoryIds: ["13-resultado-transformao"],
  },
];

var PROMPT_TAGS_BY_SUBCATEGORY = {
  "Copywriting": ["copywriting", "copy", "headline", "mensagem persuasiva"],
  "SEO & Content": ["seo", "conteudo", "blog", "artigo"],
  "Sales & E-commerce": ["vendas", "oferta", "produto", "checkout"],
  "Social Media": ["social media", "redes sociais", "conteudo social"],
};

var SEARCH_STOPWORDS = {
  a: true,
  o: true,
  os: true,
  as: true,
  um: true,
  uma: true,
  uns: true,
  umas: true,
  de: true,
  do: true,
  da: true,
  dos: true,
  das: true,
  e: true,
  ou: true,
  em: true,
  no: true,
  na: true,
  nos: true,
  nas: true,
  por: true,
  para: true,
  pra: true,
  pro: true,
  com: true,
  sem: true,
  ao: true,
  aos: true,
  ate: true,
  ateh: true,
  the: true,
  and: true,
  for: true,
  to: true,
  of: true,
  in: true,
  on: true,
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenizeText(value) {
  return uniqueList(normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(function(token) {
      return token && token.length > 1 && !SEARCH_STOPWORDS[token];
    }));
}

function uniqueList(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesTerm(text, term) {
  var normalizedText = normalizeText(text);
  var normalizedTerm = normalizeText(term);
  if (!normalizedText || !normalizedTerm) return false;
  var pattern = new RegExp("(^|[^a-z0-9])" + escapeRegExp(normalizedTerm).replace(/\s+/g, "\\s+") + "([^a-z0-9]|$)");
  return pattern.test(normalizedText);
}

function matchesAnyAlias(text, aliases) {
  return (aliases || []).some(function(alias) {
    return includesTerm(text, alias);
  });
}

function getPromptIntents() {
  return PROMPT_SEARCH_INTENTS.slice();
}

function getHookIntents() {
  return HOOK_SEARCH_INTENTS.slice();
}

function getSearchIntents(contentType) {
  return contentType === "content-hooks" ? getHookIntents() : getPromptIntents();
}

function getPromptTagSeeds(item) {
  var subcategoryTags = PROMPT_TAGS_BY_SUBCATEGORY[item.subcategory] || [];
  return uniqueList([item.subcategory].concat(subcategoryTags));
}

function getPromptSearchBlob(item) {
  var parts = [
    item.name,
    item.description,
    item.prompt,
    item.subcategory,
  ];
  return normalizeText(parts.join(" "));
}

function getHookSearchBlob(item) {
  var parts = [
    item.text,
    item.categoryLabel,
    item.categoryId,
  ];
  return normalizeText(parts.join(" "));
}

function getTriggeredIntentIds(search, intents) {
  var normalizedQuery = normalizeText(search);
  if (!normalizedQuery) return [];
  return intents
    .filter(function(intent) {
      return matchesAnyAlias(normalizedQuery, intent.aliases);
    })
    .map(function(intent) { return intent.id; });
}

function matchesPromptIntent(item, intentId) {
  if (!intentId || intentId === "all") return true;
  var intent = PROMPT_SEARCH_INTENTS.find(function(entry) { return entry.id === intentId; });
  if (!intent) return false;
  if ((intent.subcategories || []).indexOf(item.subcategory) !== -1) return true;

  var searchBlob = getPromptSearchBlob(item);
  var tagBlob = normalizeText(getPromptTagSeeds(item).join(" "));
  return matchesAnyAlias(searchBlob, intent.aliases) || matchesAnyAlias(tagBlob, intent.aliases);
}

function matchesHookIntent(item, intentId) {
  if (!intentId || intentId === "all") return true;
  var intent = HOOK_SEARCH_INTENTS.find(function(entry) { return entry.id === intentId; });
  if (!intent) return false;
  if ((intent.categoryIds || []).indexOf(item.categoryId) !== -1) return true;
  return matchesAnyAlias(getHookSearchBlob(item), intent.aliases);
}

function scoreTextAgainstQuery(fields, queryTerms, phrase) {
  var score = 0;
  var matchedTerms = 0;
  var phraseMatched = false;
  if (!queryTerms.length && !phrase) return { score: score, matchedTerms: matchedTerms, phraseMatched: phraseMatched };

  if (phrase) {
    if (includesTerm(fields.primary, phrase)) { score += 32; phraseMatched = true; }
    if (includesTerm(fields.secondary, phrase)) { score += 18; phraseMatched = true; }
    if (includesTerm(fields.body, phrase)) { score += 12; phraseMatched = true; }
    if (includesTerm(fields.tags, phrase)) { score += 16; phraseMatched = true; }
  }

  queryTerms.forEach(function(term) {
    var matched = false;
    if (!term) return;
    if (includesTerm(fields.primary, term)) { score += 10; matched = true; }
    if (includesTerm(fields.secondary, term)) { score += 6; matched = true; }
    if (includesTerm(fields.body, term)) { score += 4; matched = true; }
    if (includesTerm(fields.tags, term)) { score += 7; matched = true; }
    if (matched) matchedTerms += 1;
  });

  return {
    score: score,
    matchedTerms: matchedTerms,
    phraseMatched: phraseMatched,
  };
}

function scorePromptItem(item, options) {
  var search = options.search || "";
  var activeIntent = options.activeIntent || "all";
  if (activeIntent !== "all" && !matchesPromptIntent(item, activeIntent)) return null;

  var queryTerms = tokenizeText(search);
  var phrase = normalizeText(search);
  var minimumMatchedTerms = options.minimumMatchedTerms || (queryTerms.length >= 2 ? 2 : 1);
  var tagBlob = normalizeText(getPromptTagSeeds(item).join(" "));
  var triggeredIntentIds = getTriggeredIntentIds(search, PROMPT_SEARCH_INTENTS);
  var fields = {
    primary: normalizeText(item.name),
    secondary: normalizeText([item.description, item.subcategory].join(" ")),
    body: normalizeText(item.prompt),
    tags: tagBlob,
  };

  if (!queryTerms.length && activeIntent === "all") return 0;

  var baseSearchMatch = scoreTextAgainstQuery(fields, queryTerms, phrase);
  var baseSearchScore = baseSearchMatch.score;
  var score = 0;
  if (activeIntent !== "all") score += 60;
  score += baseSearchScore;

  triggeredIntentIds.forEach(function(intentId) {
    if (matchesPromptIntent(item, intentId)) score += 14;
  });

  if (queryTerms.length >= minimumMatchedTerms && activeIntent === "all" && !baseSearchMatch.phraseMatched && baseSearchMatch.matchedTerms < minimumMatchedTerms) return null;
  if (queryTerms.length && activeIntent === "all" && baseSearchScore === 0) return null;
  if (queryTerms.length && score === 0) return null;
  return score;
}

function rankPromptItems(items, options) {
  return (items || [])
    .map(function(item, index) {
      return {
        item: item,
        index: index,
        score: scorePromptItem(item, options),
      };
    })
    .filter(function(entry) { return entry.score !== null; })
    .sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(function(entry) { return entry.item; });
}

function filterAndRankPrompts(items, options) {
  var list = items || [];
  var activeSubcategory = options.activeSubcategory || "All";
  var filtered = list.filter(function(item) {
    return activeSubcategory === "All" || item.subcategory === activeSubcategory;
  });

  var queryTerms = tokenizeText(options.search || "");
  var ranked = rankPromptItems(filtered, Object.assign({}, options, {
    minimumMatchedTerms: queryTerms.length >= 2 ? 2 : 1,
  }));

  if (!ranked.length && queryTerms.length >= 2 && (options.activeIntent || "all") === "all") {
    ranked = rankPromptItems(filtered, Object.assign({}, options, {
      minimumMatchedTerms: 1,
    }));
  }

  return ranked;
}

function getPromptSubcategoryCounts(items, options) {
  var list = items || [];
  var counts = { All: 0 };
  list.forEach(function(item) {
    var score = scorePromptItem(item, {
      search: options.search || "",
      activeIntent: options.activeIntent || "all",
    });
    if (score === null) return;
    counts.All += 1;
    counts[item.subcategory] = (counts[item.subcategory] || 0) + 1;
  });
  return counts;
}

function countPromptIntentMatches(items, intentId) {
  return (items || []).reduce(function(total, item) {
    return total + (matchesPromptIntent(item, intentId) ? 1 : 0);
  }, 0);
}

function flattenHooks(categories) {
  var flattened = [];
  (categories || []).forEach(function(category) {
    (category.hooks || []).forEach(function(hook, index) {
      flattened.push({
        id: category.id + "-" + index,
        text: hook,
        categoryId: category.id,
        categoryLabel: category.label,
        categoryIcon: category.icon,
      });
    });
  });
  return flattened;
}

function scoreHookItem(item, options) {
  var search = options.search || "";
  var activeIntent = options.activeIntent || "all";
  if (activeIntent !== "all" && !matchesHookIntent(item, activeIntent)) return null;

  var queryTerms = tokenizeText(search);
  var phrase = normalizeText(search);
  var minimumMatchedTerms = options.minimumMatchedTerms || (queryTerms.length >= 2 ? 2 : 1);
  var triggeredIntentIds = getTriggeredIntentIds(search, HOOK_SEARCH_INTENTS);
  var fields = {
    primary: normalizeText(item.categoryLabel),
    secondary: normalizeText(item.text),
    body: normalizeText(item.text),
    tags: normalizeText(item.categoryId),
  };

  if (!queryTerms.length && activeIntent === "all") return 0;

  var baseSearchMatch = scoreTextAgainstQuery(fields, queryTerms, phrase);
  var baseSearchScore = baseSearchMatch.score;
  var score = 0;
  if (activeIntent !== "all") score += 60;
  score += baseSearchScore;

  triggeredIntentIds.forEach(function(intentId) {
    if (matchesHookIntent(item, intentId)) score += 18;
  });

  if (queryTerms.length >= minimumMatchedTerms && activeIntent === "all" && !baseSearchMatch.phraseMatched && baseSearchMatch.matchedTerms < minimumMatchedTerms) return null;
  if (queryTerms.length && activeIntent === "all" && baseSearchScore === 0) return null;
  if (queryTerms.length && score === 0) return null;
  return score;
}

function rankHookItems(items, options) {
  return (items || [])
    .map(function(item, index) {
      return {
        item: item,
        index: index,
        score: scoreHookItem(item, options),
      };
    })
    .filter(function(entry) { return entry.score !== null; })
    .sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(function(entry) { return entry.item; });
}

function filterAndRankHooks(categories, options) {
  var selectedCategories = (options.activeCategory && options.activeCategory !== "all")
    ? (categories || []).filter(function(category) { return category.id === options.activeCategory; })
    : (categories || []);

  var flattened = flattenHooks(selectedCategories);
  var queryTerms = tokenizeText(options.search || "");
  var ranked = rankHookItems(flattened, Object.assign({}, options, {
    minimumMatchedTerms: queryTerms.length >= 2 ? 2 : 1,
  }));

  if (!ranked.length && queryTerms.length >= 2 && (options.activeIntent || "all") === "all") {
    ranked = rankHookItems(flattened, Object.assign({}, options, {
      minimumMatchedTerms: 1,
    }));
  }

  return ranked;
}

function getHookCategoryCounts(categories, options) {
  var counts = { all: 0 };
  flattenHooks(categories || []).forEach(function(item) {
    var score = scoreHookItem(item, {
      search: options.search || "",
      activeIntent: options.activeIntent || "all",
    });
    if (score === null) return;
    counts.all += 1;
    counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
  });
  return counts;
}

function countHookIntentMatches(categories, intentId) {
  return flattenHooks(categories || []).reduce(function(total, item) {
    return total + (matchesHookIntent(item, intentId) ? 1 : 0);
  }, 0);
}

window.AppUtils = {
  getHookCategoryMeta: function(category) {
    var rawName = String((category && category.name) || "").trim();
    var withoutOrder = rawName.replace(/^\d+\s+—\s+/u, "").trim();
    var chars = Array.from(withoutOrder);
    var firstChar = chars[0] || "";
    var hasIcon = firstChar && !/[\p{L}\p{N}]/u.test(firstChar);
    var icon = hasIcon ? firstChar : "✦";
    var label = (hasIcon ? chars.slice(1).join("") : withoutOrder).trim();

    return {
      id: category.id,
      rawName: rawName,
      icon: icon,
      label: label || rawName,
      count: (category.hooks || []).length,
      hooks: category.hooks || [],
    };
  },

  normalizeText: normalizeText,
  getSearchIntents: getSearchIntents,
  filterAndRankPrompts: filterAndRankPrompts,
  getPromptSubcategoryCounts: getPromptSubcategoryCounts,
  countPromptIntentMatches: countPromptIntentMatches,
  filterAndRankHooks: filterAndRankHooks,
  getHookCategoryCounts: getHookCategoryCounts,
  countHookIntentMatches: countHookIntentMatches,

  createPlainText: function(content) {
    return content
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1");
  },

  generateInstructions: function(skill, tr) {
    return (
      tr.instTitle(skill.name) + "\n\n" +
      tr.instWhatItDoes + "\n" + (skill.longDesc || "") + "\n\n" +
      tr.instTriggers + "\n" +
      (skill.triggers || []).map(function(t) { return '- "' + t + '"'; }).join("\n") + "\n\n" +
      tr.instClaude + "\n\n" +
      tr.instChatGPT + "\n\n" +
      tr.instGemini + "\n\n" +
      tr.instAPI
    );
  },

  buildMdContent: function(skill) {
    return "---\nname: " + skill.id + "\ndescription: " + (skill.shortDesc || "") + "\n---\n\n" + (skill.skillContent || "");
  },

  triggerBlobDownload: function(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  },

  buildPdfBlob: function(skill) {
    var jsPDF = window.jspdf.jsPDF;
    var pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
    pdf.text(skill.name || skill.id, 20, 20);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11);
    var lines = pdf.splitTextToSize(skill.skillContent || "", 170);
    var y = 30;
    lines.forEach(function(line) { if (y > 280) { pdf.addPage(); y = 20; } pdf.text(line, 20, y); y += 6; });
    return pdf.output("blob");
  },

  downloadSingleFile: async function(skill, format, tr) {
    var utils = window.AppUtils;
    if (format === "md") { utils.triggerBlobDownload(new Blob([utils.buildMdContent(skill)], { type: "text/markdown;charset=utf-8" }), skill.id + ".skill.md"); return; }
    if (format === "txt") { utils.triggerBlobDownload(new Blob([utils.createPlainText(skill.skillContent || "")], { type: "text/plain;charset=utf-8" }), skill.id + ".skill.txt"); return; }
    if (format === "pdf") { utils.triggerBlobDownload(utils.buildPdfBlob(skill), skill.id + ".skill.pdf"); }
  },

  downloadSkillZip: async function(skill, tr) {
    var utils = window.AppUtils;
    var zip = new JSZip();
    var folder = zip.folder(skill.id);
    folder.file(skill.id + ".skill.md", utils.buildMdContent(skill));
    folder.file(skill.id + ".skill.txt", utils.createPlainText(skill.skillContent || ""));
    folder.file(tr.instFilename, utils.generateInstructions(skill, tr));
    folder.file(skill.id + ".skill.pdf", utils.buildPdfBlob(skill));
    var blob = await zip.generateAsync({ type: "blob" });
    utils.triggerBlobDownload(blob, skill.id + ".zip");
  },

  copyToClipboard: async function(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch(e) {
      var el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el); return true;
    }
  }
};
