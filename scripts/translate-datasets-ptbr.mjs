#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const GOOGLE_TRANSLATE_MOBILE_URL = "https://translate.google.com/m";
const PLACEHOLDER_REGEX = /(\[[^\]\n]{1,160}\]|\{[^}\n]{1,160}\}|<[^>\n]{1,160}>)/g;
const BATCH_CHAR_LIMIT = 3500;
const REQUEST_DELAY_MS = 250;
const MOBILE_MAX_RETRIES = 4;
const PROMPT_SUBCATEGORIES_TO_TRANSLATE = new Set([
  "Copywriting",
  "SEO & Content",
  "Sales & E-commerce",
  "Social Media",
]);

const textCache = new Map();
const placeholderCache = new Map();

const DATASETS = {
  prompts: {
    inputPath: path.join(ROOT, "llm-prompts-data.js"),
    outputVar: "window.LLM_PROMPTS_DATA",
    batchSize: 10,
    progressPath: path.join(ROOT, "scripts/.translate-prompts-progress.json"),
    selectItems(items) {
      return items.filter(function(item) {
        return PROMPT_SUBCATEGORIES_TO_TRANSLATE.has(item.subcategory);
      });
    },
    async translateBatch(batch) {
      const requests = [];

      batch.forEach(function(item) {
        requests.push({ id: item.id, field: "name", text: item.name });
        requests.push({ id: item.id, field: "description", text: item.description });
        requests.push({ id: item.id, field: "prompt", text: item.prompt });
        (item.allPrompts || []).forEach(function(promptText, index) {
          requests.push({ id: item.id, field: "allPrompts", index: index, text: promptText });
        });
      });

      const translated = await translateTexts(requests.map(function(request) {
        return request.text;
      }));

      const byId = new Map();

      requests.forEach(function(request, index) {
        if (!byId.has(request.id)) {
          byId.set(request.id, { id: request.id, allPrompts: [] });
        }

        const item = byId.get(request.id);
        const translatedText = translated[index];

        if (request.field === "allPrompts") {
          item.allPrompts[request.index] = translatedText;
          return;
        }

        item[request.field] = translatedText;
      });

      return batch.map(function(item) {
        const translatedItem = byId.get(item.id);
        if (!translatedItem) {
          throw new Error("Prompt sem traducao retornada: " + item.id);
        }

        return {
          id: item.id,
          name: translatedItem.name,
          description: translatedItem.description,
          prompt: translatedItem.prompt,
          allPrompts: translatedItem.allPrompts,
        };
      });
    },
    merge(originalItems, translatedMap) {
      return originalItems.map(function(item) {
        const translated = translatedMap.get(item.id);
        if (!translated) {
          return item;
        }

        return {
          ...item,
          name: translated.name,
          description: translated.description,
          prompt: translated.prompt,
          allPrompts: translated.allPrompts,
        };
      });
    },
  },
  hooks: {
    inputPath: path.join(ROOT, "content-hooks-data.js"),
    outputVar: "window.CONTENT_HOOKS_DATA",
    batchSize: 2,
    progressPath: path.join(ROOT, "scripts/.translate-hooks-progress.json"),
    selectItems(items) {
      return items;
    },
    async translateBatch(batch) {
      const requests = [];

      batch.forEach(function(category) {
        category.hooks.forEach(function(hook, index) {
          requests.push({ id: category.id, index: index, text: hook });
        });
      });

      const translated = await translateTexts(requests.map(function(request) {
        return request.text;
      }));

      const byId = new Map();

      requests.forEach(function(request, index) {
        if (!byId.has(request.id)) {
          byId.set(request.id, { id: request.id, hooks: [] });
        }
        byId.get(request.id).hooks[request.index] = translated[index];
      });

      return batch.map(function(category) {
        const translatedCategory = byId.get(category.id);
        if (!translatedCategory || translatedCategory.hooks.length !== category.hooks.length) {
          throw new Error("Categoria de hooks com traducao incompleta: " + category.id);
        }

        return translatedCategory;
      });
    },
    merge(originalItems, translatedMap) {
      return originalItems.map(function(item) {
        const translated = translatedMap.get(item.id);
        if (!translated) {
          return item;
        }

        return {
          ...item,
          hooks: translated.hooks,
        };
      });
    },
  },
};

function parseArgs(argv) {
  const args = {
    dataset: "all",
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dataset" && argv[i + 1]) {
      args.dataset = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--force") {
      args.force = true;
    }
  }

  return args;
}

function parseAssignedJson(source, outputVar) {
  const prefix = outputVar + " = ";
  const start = source.indexOf(prefix);
  if (start === -1) {
    throw new Error("Prefixo nao encontrado em " + outputVar);
  }

  const jsonStart = source.indexOf("[", start);
  const jsonEnd = source.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error("Array JSON invalido em " + outputVar);
  }

  return JSON.parse(source.slice(jsonStart, jsonEnd + 1));
}

async function readDataset(config) {
  const source = await fs.readFile(config.inputPath, "utf8");
  return parseAssignedJson(source, config.outputVar);
}

async function readProgress(progressPath) {
  try {
    const raw = await fs.readFile(progressPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeProgress(progressPath, data) {
  await fs.writeFile(progressPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function clearProgress(progressPath) {
  try {
    await fs.unlink(progressPath);
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw error;
    }
  }
}

function splitIntoBatches(items, batchSize) {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

function protectPlaceholders(text) {
  const placeholders = [];
  let index = 0;

  const safeText = text.replace(PLACEHOLDER_REGEX, function(match) {
    const token = "__PH_" + index + "__";
    placeholders.push({
      token: token,
      original: match,
      open: match[0],
      inner: match.slice(1, -1),
      close: match[match.length - 1],
    });
    index += 1;
    return token;
  });

  return { safeText: safeText, placeholders: placeholders };
}

function formatPlaceholderInner(originalInner, translatedInner) {
  let formatted = translatedInner.trim();
  const isAllCaps = originalInner === originalInner.toUpperCase() && /[A-Z]/.test(originalInner);

  if (isAllCaps) {
    formatted = formatted.toUpperCase();
  }

  if (originalInner.includes("_")) {
    formatted = formatted
      .replace(/[^\p{L}\p{N}]+/gu, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  return formatted;
}

function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, function(_, code) {
      return String.fromCharCode(Number(code));
    });
}

function extractMobileTranslation(html) {
  const marker = 'class="result-container">';
  const start = html.lastIndexOf(marker);
  if (start === -1) {
    return null;
  }

  const contentStart = start + marker.length;
  const end = html.indexOf("</div>", contentStart);
  if (end === -1) {
    return null;
  }

  return decodeHtmlEntities(html.slice(contentStart, end));
}

async function googleTranslateTextViaMobile(text) {
  for (let attempt = 0; attempt < MOBILE_MAX_RETRIES; attempt += 1) {
    const response = await fetch(
      GOOGLE_TRANSLATE_MOBILE_URL + "?sl=en&tl=pt&q=" + encodeURIComponent(text)
    );

    if (!response.ok) {
      throw new Error("Falha no Google Translate mobile (" + response.status + ")");
    }

    const html = await response.text();
    const translated = extractMobileTranslation(html);
    if (translated !== null) {
      await sleep(REQUEST_DELAY_MS);
      return translated;
    }

    const waitMs = 2000 * (attempt + 1);
    console.log("Fallback mobile sem resposta valida; aguardando " + waitMs + "ms.");
    await sleep(waitMs);
  }

  throw new Error("Nao foi possivel extrair a traducao no fallback mobile.");
}

async function googleTranslateText(text) {
  return googleTranslateTextViaMobile(text);
}

function buildSegmentBatches(texts) {
  const batches = [];
  let current = [];
  let currentLength = 0;

  texts.forEach(function(text, index) {
    const marker = "__SEG_" + index + "__";
    const block = marker + "\n" + text;
    const blockLength = block.length + 1;

    if (current.length && currentLength + blockLength > BATCH_CHAR_LIMIT) {
      batches.push(current);
      current = [];
      currentLength = 0;
    }

    current.push({ marker: marker, text: text });
    currentLength += blockLength;
  });

  if (current.length) {
    batches.push(current);
  }

  return batches;
}

function extractMarkedSegments(translatedPayload, items) {
  const segments = [];

  items.forEach(function(item, index) {
    const marker = item.marker;
    const start = translatedPayload.indexOf(marker);
    if (start === -1) {
      throw new Error("Marcador nao encontrado na traducao: " + marker);
    }

    const contentStart = start + marker.length;
    const nextMarker = index + 1 < items.length ? items[index + 1].marker : null;
    const contentEnd = nextMarker ? translatedPayload.indexOf(nextMarker, contentStart) : translatedPayload.length;
    if (contentEnd === -1) {
      throw new Error("Fim do segmento nao encontrado para " + marker);
    }

    const raw = translatedPayload.slice(contentStart, contentEnd);
    segments.push(raw.replace(/^\n+/, "").replace(/\n+$/, ""));
  });

  return segments;
}

async function translateSegments(texts) {
  if (!texts.length) {
    return [];
  }

  const batches = buildSegmentBatches(texts);
  const translated = [];

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const payload = batch.map(function(item) {
      return item.marker + "\n" + item.text;
    }).join("\n");

    const translatedPayload = await googleTranslateText(payload);
    translated.push(...extractMarkedSegments(translatedPayload, batch));
  }

  return translated;
}

async function translatePlaceholderMap(placeholders) {
  const unique = [];

  placeholders.forEach(function(placeholder) {
    if (!placeholderCache.has(placeholder.original)) {
      placeholderCache.set(placeholder.original, null);
      unique.push(placeholder);
    }
  });

  if (!unique.length) {
    return;
  }

  const translatedInners = await translateSegments(unique.map(function(placeholder) {
    return placeholder.inner;
  }));

  unique.forEach(function(placeholder, index) {
    const translatedInner = formatPlaceholderInner(placeholder.inner, translatedInners[index]);
    placeholderCache.set(
      placeholder.original,
      placeholder.open + translatedInner + placeholder.close
    );
  });
}

async function translateTexts(texts) {
  const results = new Array(texts.length);
  const missing = [];

  texts.forEach(function(text, index) {
    if (!text || !text.trim()) {
      results[index] = text;
      return;
    }

    if (textCache.has(text)) {
      results[index] = textCache.get(text);
      return;
    }

    missing.push({ index: index, text: text });
  });

  if (!missing.length) {
    return results;
  }

  const protectedEntries = missing.map(function(entry) {
    return {
      index: entry.index,
      text: entry.text,
      protected: protectPlaceholders(entry.text),
    };
  });

  const placeholders = protectedEntries.flatMap(function(entry) {
    return entry.protected.placeholders;
  });

  await translatePlaceholderMap(placeholders);

  const translatedSafeTexts = await translateSegments(protectedEntries.map(function(entry) {
    return entry.protected.safeText;
  }));

  protectedEntries.forEach(function(entry, localIndex) {
    let restored = translatedSafeTexts[localIndex];

    entry.protected.placeholders.forEach(function(placeholder) {
      restored = restored.split(placeholder.token).join(placeholderCache.get(placeholder.original));
    });

    textCache.set(entry.text, restored);
    results[entry.index] = restored;
  });

  return results;
}

async function translateDataset(name, config, force) {
  const originalItems = await readDataset(config);
  const selectedItems = config.selectItems(originalItems);
  const progress = force ? {} : await readProgress(config.progressPath);
  const translatedMap = new Map();

  Object.keys(progress).forEach(function(id) {
    translatedMap.set(id, progress[id]);
  });

  const pendingItems = selectedItems.filter(function(item) {
    return !translatedMap.has(item.id);
  });

  const batches = splitIntoBatches(pendingItems, config.batchSize);

  if (!pendingItems.length) {
    console.log("[" + name + "] nada pendente; regravando arquivo final.");
  }

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    console.log("[" + name + "] lote " + (i + 1) + "/" + batches.length + " (" + batch.length + " itens)");
    const translatedBatch = await config.translateBatch(batch);

    translatedBatch.forEach(function(item) {
      translatedMap.set(item.id, item);
      progress[item.id] = item;
    });

    await writeProgress(config.progressPath, progress);
  }

  const translatedItems = config.merge(originalItems, translatedMap);
  const output = config.outputVar + " = " + JSON.stringify(translatedItems, null, 2) + ";\n";
  await fs.writeFile(config.inputPath, output, "utf8");
  await clearProgress(config.progressPath);

  console.log("[" + name + "] concluido: " + selectedItems.length + " itens traduzidos.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const selected = args.dataset === "all"
    ? Object.keys(DATASETS)
    : args.dataset.split(",").map(function(value) { return value.trim(); }).filter(Boolean);

  for (const name of selected) {
    if (!DATASETS[name]) {
      throw new Error("Dataset invalido: " + name);
    }
  }

  for (const name of selected) {
    await translateDataset(name, DATASETS[name], args.force);
  }
}

main().catch(function(error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
