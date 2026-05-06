// ── Layout: Background, Footer ───────────────────────────────────────────
var LangContext = window.LangContext;

window.Background = function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "#000" }} />
  );
};

window.Footer = function Footer() {
  var tr = React.useContext(LangContext).tr;
  return (
    <footer className="relative z-10 px-6 py-8 text-center text-xs uppercase tracking-[0.22em] backdrop-blur-sm"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#000', color: '#888' }}>
      {tr.footer}
    </footer>
  );
};
