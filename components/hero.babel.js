// ── Hero ─────────────────────────────────────────────────────────────────
var LangContext = window.LangContext;

window.Hero = function Hero(props) {
  var totalAssets = props.totalAssets;
  var totalCategories = props.totalCategories;
  var totalCollections = props.totalCollections;
  var onScrollToGrid = props.onScrollToGrid;
  var contentType = props.contentType;
  var search = props.search;
  var onSearchChange = props.onSearchChange;
  var intents = props.intents || [];
  var activeIntent = props.activeIntent || "all";
  var onIntentChange = props.onIntentChange || function() {};
  var onClearFilters = props.onClearFilters || function() {};
  var searchScopeLabel = props.searchScopeLabel;
  var statusNote = props.statusNote || "";
  var tr = React.useContext(LangContext).tr;
  var hasActiveFilters = Boolean(search.trim() || activeIntent !== "all");
  var quickFiltersTitle = contentType === "content-hooks" ? tr.quickFiltersHooks : tr.quickFiltersPrompts;
  var searchExamples = contentType === "content-hooks" ? tr.hookSearchExamples : tr.promptSearchExamples;

  return (
    <section id="hero" className="relative z-10 border-b border-[var(--border-strong)]">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="relative overflow-hidden border-b border-[var(--border)] bg-grid px-6 py-12 md:col-span-7 md:border-b-0 md:border-r md:px-10 md:py-16">
          <div className="absolute right-8 top-8 h-40 w-40 rounded-full bg-white/70 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-stone-300/40 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="animate-entry inline-flex items-center gap-3 rounded-full border border-stone-900/10 bg-white/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-600" style={{ animationDelay: "80ms" }}>
              <span className="font-mono-ui">System v6</span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-900"></span>
              <span>{tr.heroBadge(totalAssets.toLocaleString())}</span>
            </div>

            <h1 className="animate-entry mt-8 font-display text-[52px] font-semibold leading-[0.9] tracking-[-0.08em] text-stone-900 sm:text-[72px] lg:text-[104px]" style={{ animationDelay: "180ms" }}>
              {tr.heroTitle1}<br />
              <span className="transparent-text-outline">{tr.heroTitle2}</span>
            </h1>

            <p className="animate-entry mt-8 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg" style={{ animationDelay: "280ms" }}>
              {tr.heroSubtitle}
            </p>

            <div className="animate-entry mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "360ms" }}>
              <button
                onClick={onScrollToGrid}
                className="group inline-flex items-center gap-3 rounded-full bg-stone-900 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-stone-700">
                {tr.exploreBtn}
                <i data-lucide="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="rounded-full border border-stone-900/10 bg-white/55 px-4 py-3 text-xs uppercase tracking-[0.2em] text-stone-500">
                {statusNote}
              </div>
            </div>

            <div className="animate-entry mt-12 grid max-w-3xl grid-cols-1 gap-3 text-left text-sm text-stone-600 sm:grid-cols-3" style={{ animationDelay: "460ms" }}>
              <div className="rounded-[22px] border border-stone-900/10 bg-white/45 px-4 py-4">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-stone-400">Assets</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-stone-900">{tr.statsAssets(totalAssets.toLocaleString())}</p>
              </div>
              <div className="rounded-[22px] border border-stone-900/10 bg-white/45 px-4 py-4">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-stone-400">Coleções</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-stone-900">{tr.statsLibraries(totalCollections)}</p>
              </div>
              <div className="rounded-[22px] border border-stone-900/10 bg-white/45 px-4 py-4">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-stone-400">Categorias</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-stone-900">{tr.statsCategories(totalCategories)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative px-6 py-12 md:col-span-5 md:px-8 md:py-16">
          <div className="glass-panel flashlight-card relative rounded-[30px] p-6 md:p-7" onMouseMove={function(event) {
            var rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--mouse-x", (event.clientX - rect.left) + "px");
            event.currentTarget.style.setProperty("--mouse-y", (event.clientY - rect.top) + "px");
          }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-stone-400">{quickFiltersTitle}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-stone-900">Busca editorial da biblioteca</p>
                </div>
                <div className="rounded-full border border-stone-900/10 bg-white/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  {tr.searchScopeLabel(searchScopeLabel)}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-stone-900/10 bg-white/72 shadow-[0_18px_40px_rgba(28,25,23,0.08)]">
                <div className="flex items-center gap-3 px-4 py-4">
                  <i data-lucide="search" className="h-4 w-4 text-stone-500" />
                  <input
                    value={search}
                    onChange={function(e) { onSearchChange(e.target.value); }}
                    placeholder={tr.searchPlaceholder}
                    className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                  {hasActiveFilters ? (
                    <button
                      onClick={onClearFilters}
                      className="shrink-0 rounded-full border border-stone-900/10 bg-stone-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-all hover:bg-stone-700">
                      {tr.clearFilters}
                    </button>
                  ) : null}
                </div>
                <div className="border-t border-stone-900/10 px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {intents.map(function(intent) {
                      var active = intent.id === activeIntent;
                      var empty = !intent.count;
                      return (
                        <button
                          key={intent.id}
                          onClick={function() { if (!empty || active) onIntentChange(active ? "all" : intent.id); }}
                          className={
                            "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all " +
                            (active
                              ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
                              : empty
                                ? "border-stone-900/5 bg-stone-200/40 text-stone-400"
                                : "border-stone-900/10 bg-white/70 text-stone-700 hover:text-stone-900")
                          }>
                          <span>{intent.label}</span>
                          <span className="rounded-full bg-black/8 px-2 py-0.5 text-[11px] text-inherit">{intent.count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-stone-500">{searchExamples}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-stone-900/10 bg-white/55 px-4 py-4">
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-stone-400">Curadoria</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">Prompts e hooks com busca, filtros rápidos e organização por intenção.</p>
                </div>
                <div className="rounded-[22px] border border-stone-900/10 bg-white/55 px-4 py-4">
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-stone-400">Acesso</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">Login persistente e liberação por pacote com validação via Hotmart.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
