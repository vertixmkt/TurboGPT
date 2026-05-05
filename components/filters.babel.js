// ── Filters: ContentTypeTabs, CategoryFilter ────────────────────────────
var LangContext = window.LangContext;

window.ContentTypeTabs = function ContentTypeTabs(props) {
  var contentType = props.contentType;
  var onChange = props.onChange;
  var promptCount = props.promptCount || 0;
  var hooksCount = props.hooksCount || 0;
  var hasAccess = Boolean(props.hasAccess);
  var availableContentTypes = props.availableContentTypes || [];
  var tr = React.useContext(LangContext).tr;

  var tabs = [
    { id: "llm-prompts", label: tr.tabPrompts, icon: "message-square", count: promptCount },
    { id: "content-hooks", label: tr.tabHooks, icon: "anchor", count: hooksCount },
  ];

  return (
    <section id="colecoes" className="relative z-10 mx-auto mt-8 max-w-7xl px-4 md:px-8">
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map(function(tab) {
          var active = tab.id === contentType;
          var enabled = hasAccess && availableContentTypes.indexOf(tab.id) !== -1;

          return (
            <button
              key={tab.id}
              onClick={function() { if (enabled) onChange(tab.id); }}
              disabled={!enabled}
              className={
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all " +
                (active && enabled
                  ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
                  : enabled
                    ? "border-stone-900/10 bg-white/80 text-stone-700 hover:text-stone-900"
                    : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 text-stone-400")
              }>
              <i data-lucide={enabled ? tab.icon : "lock"} className="h-3.5 w-3.5" />
              {tab.label}
              <span className="rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">{tab.count}</span>
            </button>
          );
        })}
      </div>
      {hasAccess && availableContentTypes.length < tabs.length ? (
        <p className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-stone-500">{tr.tabsLockedHint}</p>
      ) : null}
    </section>
  );
};

window.CategoryFilter = function CategoryFilter(props) {
  var categories = props.categories;
  var categoryCounts = props.categoryCounts;
  var activeCategory = props.activeCategory;
  var onCategoryChange = props.onCategoryChange;
  var tr = React.useContext(LangContext).tr;

  return (
    <section className="animate-entry relative z-10 mx-auto mt-12 max-w-7xl px-4 md:px-8" style={{ animationDelay: "620ms" }}>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map(function(category, i) {
          var active = category === activeCategory;
          return (
            <button
              key={category}
              onClick={function() { onCategoryChange(category); }}
              className={
                "animate-entry inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all " +
                (active ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : "border-stone-900/10 bg-white/80 text-stone-700 hover:text-stone-900")
              }
              style={{ animationDelay: (640 + i * 30) + "ms" }}>
              <span>{category === "All" ? tr.all : category}</span>
              <span className="rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">{categoryCounts[category] || 0}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
