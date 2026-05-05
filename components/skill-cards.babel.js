// ── Skill Cards, Grid, Pagination ───────────────────────────────────────
var LangContext = window.LangContext;

window.SkillCard = function SkillCard(props) {
  var skill = props.skill, index = props.index, onOpen = props.onOpen;
  var tr = React.useContext(LangContext).tr;
  return (
    <article className="animate-entry group relative rounded-[32px] bg-neutral-900 p-[2px] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_45px_-15px_rgba(249,115,22,0.65)]"
      style={{ animationDelay: ((index % 12) * 75) + "ms" }}>
      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent opacity-80" />
      <div className="relative h-full rounded-[30px] bg-[#0a0a0a] p-8 pb-28">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-24 rounded-[30px] bg-gradient-to-b from-orange-500/10 to-transparent" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-2xl">{skill.emoji || "\u2728"}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
              <span className="relative inline-flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              {skill.badge || "Skill"}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">{skill.category}</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{skill.shortDesc}</p>
        </div>
        <button onClick={function() { onOpen(skill); }}
          className="absolute bottom-8 left-8 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all hover:brightness-110">
          {tr.viewSkill} <i data-lucide="arrow-up-right" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

window.SkillGrid = function SkillGrid(props) {
  var skills = props.skills, onOpen = props.onOpen, gridRef = props.gridRef;
  var SkillCard = window.SkillCard;
  return (
    <section ref={gridRef} className="relative z-10 mx-auto mt-10 max-w-7xl px-4 pb-12 md:px-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {skills.map(function(skill, index) {
          return <SkillCard key={skill.id + "-" + index} skill={skill} index={index} onOpen={onOpen} />;
        })}
      </div>
    </section>
  );
};

window.Pagination = function Pagination(props) {
  var page = props.page, totalPages = props.totalPages, onPageChange = props.onPageChange;
  var tr = React.useContext(LangContext).tr;
  if (totalPages <= 1) return null;
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={function() { onPageChange(Math.max(1, page - 1)); }} disabled={page === 1}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">{tr.prev}</button>
        <span className="px-3 text-sm text-neutral-400">{tr.pageOf(page, totalPages)}</span>
        <button onClick={function() { onPageChange(Math.min(totalPages, page + 1)); }} disabled={page === totalPages}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">{tr.next}</button>
      </div>
    </section>
  );
};
