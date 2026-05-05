// ── Layout: Background, Navbar, Footer ──────────────────────────────────
var LangContext = window.LangContext;

window.Background = function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="absolute inset-0 bg-grid opacity-80" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,118,223,0.20),transparent_46%)]" />
      <div className="absolute left-[-12%] top-[34%] h-[360px] w-[520px] rotate-[-18deg] rounded-full border border-[#23e893]/20 opacity-40 blur-sm" />
      <div className="absolute right-[-12%] top-[18%] h-[420px] w-[520px] rotate-[22deg] rounded-full border border-[#0076df]/20 opacity-45 blur-sm" />
    </div>
  );
};

window.Navbar = function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-strong)] bg-black/82 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-5">
          <a href="#hero" className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-900">Visão</a>
          <a href="#acesso" className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-900">Acesso</a>
          <a href="#biblioteca" className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-900 md:block">Biblioteca</a>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
          <div className="wescale-gradient flex h-9 w-9 items-center justify-center rounded-full text-white">
            <i data-lucide="sparkles" className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-[-0.04em] text-stone-900">Turbo GPT</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-stone-900/10 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-600">PT-BR</span>
        </div>
      </div>
    </header>
  );
};

window.Footer = function Footer() {
  var tr = React.useContext(LangContext).tr;
  return (
    <footer className="relative z-10 border-t border-[var(--border-strong)] bg-black/72 px-6 py-8 text-center text-xs uppercase tracking-[0.22em] text-stone-500 backdrop-blur-sm">
      {tr.footer}
    </footer>
  );
};
