// ── Content Hooks View ───────────────────────────────────────────────────
var LangContext = window.LangContext;
var copyToClipboard = window.AppUtils.copyToClipboard;
var filterAndRankHooks = window.AppUtils.filterAndRankHooks;
var getHookCategoryCounts = window.AppUtils.getHookCategoryCounts;
var ITEMS_PER_PAGE = window.APP_CONFIG.ITEMS_PER_PAGE;

window.ContentHooksView = function ContentHooksView(props) {
  var search = props.search;
  var activeIntent = props.activeIntent || "all";
  var items = props.items || [];
  var activeCategory = props.activeCategory || "all";
  var onCategoryChange = props.onCategoryChange || function() {};
  var onResetSearch = props.onResetSearch || function() {};
  var tr = React.useContext(LangContext).tr;
  var allCategories = React.useMemo(function() { return items; }, [items]);
  var categoryCounts = React.useMemo(function() {
    return getHookCategoryCounts(allCategories, {
      search: search,
      activeIntent: activeIntent,
    });
  }, [allCategories, search, activeIntent]);
  var stateCopied = React.useState(null);
  var copiedId = stateCopied[0], setCopiedId = stateCopied[1];
  var statePage = React.useState(1);
  var page = statePage[0], setPage = statePage[1];

  React.useEffect(function() {
    setPage(1);
  }, [activeCategory, search, activeIntent]);

  React.useEffect(function() {
    if (!allCategories.length) return;
    if (activeCategory === "all") return;
    if (!allCategories.some(function(category) { return category.id === activeCategory; })) {
      onCategoryChange("all");
    }
  }, [allCategories, activeCategory, onCategoryChange]);

  var filteredHooks = React.useMemo(function() {
    return filterAndRankHooks(allCategories, {
      search: search,
      activeIntent: activeIntent,
      activeCategory: activeCategory,
    });
  }, [allCategories, activeCategory, search, activeIntent]);

  var totalPages = Math.max(1, Math.ceil(filteredHooks.length / ITEMS_PER_PAGE));

  React.useEffect(function() {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  var pagedHooks = filteredHooks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  React.useEffect(function() {
    if (window.lucide) window.lucide.createIcons();
  }, [pagedHooks.length, page, activeCategory, copiedId]);

  var handleCopy = async function(hook) {
    await copyToClipboard(hook.id ? hook.text : hook);
    setCopiedId(hook.id || hook);
    setTimeout(function() { setCopiedId(null); }, 2000);
  };

  return (
    <>
      <section className="relative z-10 mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={function() { onCategoryChange("all"); }}
            className={"rounded-full border px-4 py-2 text-sm transition-all " + (activeCategory === "all" ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : "border-stone-900/10 bg-white/80 text-stone-700 hover:text-stone-900")}>
            {tr.allHookCategories}
            <span className="ml-2 rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">
              {categoryCounts.all || 0}
            </span>
          </button>
          {allCategories.map(function(category) {
            var count = categoryCounts[category.id] || 0;
            var disabled = count === 0 && activeCategory !== category.id;
            return (
              <button key={category.id} onClick={function() { onCategoryChange(category.id); }}
                className={"rounded-full border px-4 py-2 text-sm transition-all " + (activeCategory === category.id ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : disabled ? "border-stone-900/5 bg-stone-200/50 text-stone-400" : "border-stone-900/10 bg-white/80 text-stone-700 hover:text-stone-900")}>
                <span>{category.icon}</span>
                <span className="ml-2">{category.label}</span>
                <span className="ml-2 rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 text-center md:px-8">
        <p className="font-mono-ui text-sm uppercase tracking-[0.18em] text-stone-500">{tr.showingHooks(pagedHooks.length, filteredHooks.length)}</p>
      </section>

      {filteredHooks.length === 0 ? (
        <section className="relative z-10 mx-auto mt-6 max-w-3xl px-4 pb-16 text-center md:px-8">
          <div className="rounded-[28px] border border-stone-900/10 bg-white/78 px-6 py-10">
            <h3 className="font-display text-2xl text-stone-900">{tr.noHookResultsTitle}</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">{tr.noHookResultsDesc}</p>
            <button onClick={onResetSearch}
              className="mt-5 rounded-full border border-stone-900/10 bg-stone-900 px-4 py-2 text-sm uppercase tracking-[0.16em] text-white transition-all hover:bg-stone-700">
              {tr.clearFilters}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 pb-8 md:px-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pagedHooks.map(function(hook) {
                var copied = copiedId === hook.id;
                return (
                  <div key={hook.id} className="flashlight-card group rounded-2xl border border-stone-900/10 bg-white/76 p-4 transition-all hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(28,25,23,0.08)]" onMouseMove={function(event) {
                    var rect = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty("--mouse-x", (event.clientX - rect.left) + "px");
                    event.currentTarget.style.setProperty("--mouse-y", (event.clientY - rect.top) + "px");
                  }}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/82 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-stone-500">
                        <span>{hook.categoryIcon}</span>
                        <span>{hook.categoryLabel}</span>
                      </span>
                      <button onClick={function() { handleCopy(hook); }}
                        className={"shrink-0 rounded-full border p-1.5 transition-all " + (copied ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : "border-stone-900/10 bg-white/82 text-stone-500 opacity-0 group-hover:opacity-100")}>
                        <i data-lucide={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-700">{hook.text}</p>
                  </div>
                );
              })}
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
    </>
  );
};
