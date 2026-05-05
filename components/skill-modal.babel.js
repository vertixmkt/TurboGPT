// ── Skill Modal ──────────────────────────────────────────────────────────
var LangContext = window.LangContext;
var downloadSingleFile = window.AppUtils.downloadSingleFile;
var downloadSkillZip   = window.AppUtils.downloadSkillZip;
var DownloadButton     = window.DownloadButton;
var CopyButton         = window.CopyButton;

window.SkillModal = function SkillModal(props) {
  var skill = props.skill, onClose = props.onClose;
  var tr = React.useContext(LangContext).tr;

  React.useEffect(function() {
    var onEsc = function(e) { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return function() { document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  if (!skill) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="modal-in relative max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8" onClick={function(e) { e.stopPropagation(); }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300">
          <i data-lucide="x" className="h-4 w-4" />
        </button>
        <div className="mb-4 flex items-center gap-4 pr-10">
          <span className="text-4xl">{skill.emoji || "\u2728"}</span>
          <div>
            <h3 className="text-2xl font-semibold text-white">{skill.name}</h3>
            <span className="mt-1 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">{skill.category}</span>
          </div>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-neutral-300">{skill.longDesc || skill.shortDesc}</p>
        <p className="mb-5 break-all text-xs text-neutral-500">{tr.origin} {skill.sourcePath || "n/a"}</p>
        <div className="mb-6">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-neutral-500">{tr.triggers}</p>
          <div className="flex flex-wrap gap-2">
            {(skill.triggers || []).map(function(trigger) {
              return <span key={trigger} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">{trigger}</span>;
            })}
          </div>
        </div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <DownloadButton label=".skill.md"  onClick={function() { downloadSingleFile(skill, "md",  tr); }} />
          <DownloadButton label=".skill.txt" onClick={function() { downloadSingleFile(skill, "txt", tr); }} />
          <DownloadButton label=".skill.pdf" onClick={function() { downloadSingleFile(skill, "pdf", tr); }} />
        </div>
        <DownloadButton label={tr.downloadZip} onClick={function() { downloadSkillZip(skill, tr); }} primary={true} full={true} />
      </div>
    </div>
  );
};
