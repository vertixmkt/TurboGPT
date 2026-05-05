// ── Image / Video Prompts View ───────────────────────────────────────────
var LangContext = window.LangContext;
var CopyButton  = window.CopyButton;
var ITEMS_PER_PAGE = window.APP_CONFIG.ITEMS_PER_PAGE;

function SubcategoryModal(props) {
  var item = props.item, onClose = props.onClose;
  var tr = React.useContext(LangContext).tr;
  React.useEffect(function() {
    var onEsc = function(e) { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return function() { document.removeEventListener("keydown", onEsc); };
  }, [onClose]);
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="modal-in relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8" onClick={function(e) { e.stopPropagation(); }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300">
          <i data-lucide="x" className="h-4 w-4" />
        </button>
        <h3 className="mb-1 pr-10 text-xl font-semibold text-white">{item.name}</h3>
        {item.description && <p className="mb-5 text-sm text-neutral-400">{item.description}</p>}
        <div className="space-y-4">
          {(item.prompts || []).map(function(p, i) {
            return (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                {p.title && <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">{p.title}</p>}
                <pre className="mb-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-neutral-300">{p.content}</pre>
                <CopyButton text={p.content} full={true} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.ImageVideoPromptsView = function ImageVideoPromptsView(props) {
  var type = props.type, search = props.search;
  var tr = React.useContext(LangContext).tr;
  var allItems = React.useMemo(function() {
    return (type === "image" ? window.IMAGE_PROMPTS_DATA : window.VIDEO_PROMPTS_DATA) || [];
  }, [type]);
  var stateSelected = React.useState(null);
  var selected = stateSelected[0], setSelected = stateSelected[1];
  var statePage = React.useState(1);
  var page = statePage[0], setPage = statePage[1];

  React.useEffect(function() { setPage(1); }, [search, type]);

  var filtered = React.useMemo(function() {
    var term = search.trim().toLowerCase();
    if (!term) return allItems;
    return allItems.filter(function(item) {
      return [item.name, item.description].concat((item.prompts || []).map(function(p) { return p.title + " " + p.content; })).join(" ").toLowerCase().includes(term);
    });
  }, [allItems, search]);

  var totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  var paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 text-center md:px-8">
        <p className="text-sm text-neutral-400">{tr.showingCategories(paged.length, filtered.length)}</p>
      </section>
      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4 pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paged.map(function(item, i) {
            return (
              <article key={item.id} onClick={function() { setSelected(item); }}
                className="animate-entry group cursor-pointer rounded-[24px] border border-white/8 bg-[#0a0a0a] p-6 transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)]"
                style={{ animationDelay: ((i % 12) * 50) + "ms" }}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-snug text-white">{item.name}</h3>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-neutral-400">{item.prompts ? item.prompts.length : 0}</span>
                </div>
                {item.description && <p className="line-clamp-2 text-xs text-neutral-400">{item.description}</p>}
                <div className="mt-4 flex items-center gap-1 text-xs text-orange-400 opacity-0 transition-opacity group-hover:opacity-100">
                  {tr.viewPrompts} <i data-lucide="arrow-up-right" className="h-3.5 w-3.5" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {totalPages > 1 && (
        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="flex items-center justify-center gap-2">
            <button onClick={function() { setPage(Math.max(1, page - 1)); }} disabled={page === 1}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-40">{tr.prev}</button>
            <span className="px-3 text-sm text-neutral-400">{tr.pageOf(page, totalPages)}</span>
            <button onClick={function() { setPage(Math.min(totalPages, page + 1)); }} disabled={page === totalPages}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-40">{tr.next}</button>
          </div>
        </section>
      )}
      <SubcategoryModal item={selected} onClose={function() { setSelected(null); }} />
    </>
  );
};
