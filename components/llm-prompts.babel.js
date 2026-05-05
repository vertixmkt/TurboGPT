// ── LLM Prompts View ─────────────────────────────────────────────────────
var LangContext = window.LangContext;
var CopyButton  = window.CopyButton;
var ITEMS_PER_PAGE = window.APP_CONFIG.ITEMS_PER_PAGE;
var PROMPT_SUBCATEGORY_LABELS = window.APP_CONFIG.PROMPT_SUBCATEGORY_LABELS || {};
var filterAndRankPrompts = window.AppUtils.filterAndRankPrompts;
var getPromptSubcategoryCounts = window.AppUtils.getPromptSubcategoryCounts;

var SUB_EMOJI = {
  "Copywriting":"\u270D\uFE0F",
  "SEO & Content":"\uD83D\uDD0D",
  "Sales & E-commerce":"\uD83D\uDED2",
  "Social Media":"\uD83D\uDCF1",
};

function getSubcategoryLabel(subcategory) {
  return PROMPT_SUBCATEGORY_LABELS[subcategory] || subcategory;
}

function LLMPromptCard(props) {
  var item = props.item, index = props.index, onOpen = props.onOpen;
  var tr = React.useContext(LangContext).tr;
  return (
    <article
      className="flashlight-card animate-entry group relative cursor-pointer overflow-hidden rounded-[28px] border border-stone-900/10 bg-white/72 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(28,25,23,0.08)]"
      style={{ animationDelay: ((index % 12) * 60) + "ms" }}
      onMouseMove={function(event) {
        var rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mouse-x", (event.clientX - rect.left) + "px");
        event.currentTarget.style.setProperty("--mouse-y", (event.clientY - rect.top) + "px");
      }}
      onClick={function() { onOpen(item); }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent" />
      <div className="relative h-full p-6 pb-20">
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xl">{SUB_EMOJI[item.subcategory] || "\u2728"}</span>
            <span className="rounded-full border border-stone-900/10 bg-white/75 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-500">{getSubcategoryLabel(item.subcategory)}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug text-stone-900">{item.name}</h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-stone-600">{item.description}</p>
        </div>
        <button className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white transition-all hover:bg-stone-700">
          {tr.viewPrompt} <i data-lucide="arrow-up-right" className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function LLMPromptModal(props) {
  var item = props.item, onClose = props.onClose;
  var tr = React.useContext(LangContext).tr;
  React.useEffect(function() {
    var onEsc = function(e) { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return function() { document.removeEventListener("keydown", onEsc); };
  }, [onClose]);
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#eaeae5]/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="modal-in relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl border border-stone-900/10 bg-[#f6f5f0] p-6 shadow-[0_30px_90px_rgba(28,25,23,0.12)] md:p-8" onClick={function(e) { e.stopPropagation(); }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-stone-900/10 bg-white/80 p-2 text-stone-500">
          <i data-lucide="x" className="h-4 w-4" />
        </button>
        <div className="mb-4 pr-10">
          <span className="mb-2 inline-block rounded-full border border-stone-900/10 bg-white/80 px-3 py-1 text-xs text-stone-500">{getSubcategoryLabel(item.subcategory)}</span>
          <h3 className="text-xl font-semibold text-stone-900">{item.name}</h3>
          {item.description && <p className="mt-2 text-sm text-stone-600">{item.description}</p>}
        </div>
        <div className="space-y-4">
          {(item.allPrompts || [item.prompt]).map(function(p, i) {
            return (
              <div key={i} className="rounded-2xl border border-stone-900/10 bg-white/80 p-4">
                <pre className="mb-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-stone-700">{p}</pre>
                <CopyButton text={p} full={true} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.LLMPromptsView = function LLMPromptsView(props) {
  var search = props.search;
  var activeIntent = props.activeIntent || "all";
  var items = props.items || [];
  var activeSubcategory = props.activeSubcategory || "All";
  var onSubcategoryChange = props.onSubcategoryChange || function() {};
  var onResetSearch = props.onResetSearch || function() {};
  var tr = React.useContext(LangContext).tr;
  var allItems = React.useMemo(function() { return items; }, [items]);
  var subcategories = React.useMemo(function() {
    return ["All"].concat(Array.from(new Set(allItems.map(function(i) { return i.subcategory; }))).sort());
  }, [allItems]);
  var subcategoryCounts = React.useMemo(function() {
    return getPromptSubcategoryCounts(allItems, {
      search: search,
      activeIntent: activeIntent,
    });
  }, [allItems, search, activeIntent]);
  var statePage = React.useState(1);
  var page = statePage[0], setPage = statePage[1];
  var stateSelected = React.useState(null);
  var selected = stateSelected[0], setSelected = stateSelected[1];

  React.useEffect(function() { setPage(1); }, [activeSubcategory, search, activeIntent]);

  var filtered = React.useMemo(function() {
    return filterAndRankPrompts(allItems, {
      search: search,
      activeIntent: activeIntent,
      activeSubcategory: activeSubcategory,
    });
  }, [allItems, activeSubcategory, search, activeIntent]);

  var totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  React.useEffect(function() {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  var paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  React.useEffect(function() {
    if (window.lucide) window.lucide.createIcons();
  }, [paged.length, page, activeSubcategory, selected]);

  return (
    <>
      <section className="relative z-10 mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {subcategories.map(function(sub) {
            var count = sub === "All" ? (subcategoryCounts.All || 0) : (subcategoryCounts[sub] || 0);
            var disabled = count === 0 && activeSubcategory !== sub;
            return (
              <button key={sub} onClick={function() { onSubcategoryChange(sub); }}
                className={"rounded-full border px-4 py-2 text-sm transition-all " + (activeSubcategory === sub ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : disabled ? "border-stone-900/5 bg-stone-200/50 text-stone-400" : "border-stone-900/10 bg-white/80 text-stone-700 hover:text-stone-900")}>
                {sub === "All" ? tr.all : getSubcategoryLabel(sub)}
                <span className="ml-2 rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 text-center md:px-8">
        <p className="font-mono-ui text-sm uppercase tracking-[0.18em] text-stone-500">{tr.showingPrompts(paged.length, filtered.length)}</p>
      </section>
      {filtered.length === 0 ? (
        <section className="relative z-10 mx-auto mt-6 max-w-3xl px-4 pb-16 text-center md:px-8">
          <div className="rounded-[28px] border border-stone-900/10 bg-white/78 px-6 py-10">
            <h3 className="font-display text-2xl text-stone-900">{tr.noPromptResultsTitle}</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">{tr.noPromptResultsDesc}</p>
            <button onClick={onResetSearch}
              className="mt-5 rounded-full border border-stone-900/10 bg-stone-900 px-4 py-2 text-sm uppercase tracking-[0.16em] text-white transition-all hover:bg-stone-700">
              {tr.clearFilters}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 pb-8 md:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paged.map(function(item, i) { return <LLMPromptCard key={item.id} item={item} index={i} onOpen={setSelected} />; })}
            </div>
          </section>
          {totalPages > 1 && (
            <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 md:px-8">
              <div className="flex items-center justify-center gap-2">
                <button onClick={function() { setPage(Math.max(1, page - 1)); }} disabled={page === 1}
                  className="rounded-full border border-stone-900/10 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.16em] text-stone-900 disabled:opacity-40">{tr.prev}</button>
                <span className="px-3 text-sm font-mono-ui uppercase tracking-[0.18em] text-stone-500">{tr.pageOf(page, totalPages)}</span>
                <button onClick={function() { setPage(Math.min(totalPages, page + 1)); }} disabled={page === totalPages}
                  className="rounded-full border border-stone-900/10 bg-white/80 px-4 py-2 text-sm uppercase tracking-[0.16em] text-stone-900 disabled:opacity-40">{tr.next}</button>
              </div>
            </section>
          )}
        </>
      )}
      <LLMPromptModal item={selected} onClose={function() { setSelected(null); }} />
    </>
  );
};
