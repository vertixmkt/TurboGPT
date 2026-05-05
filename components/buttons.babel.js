// ── Buttons: DownloadButton, CopyButton ─────────────────────────────────
var LangContext = window.LangContext;
var copyToClipboard = window.AppUtils.copyToClipboard;

window.DownloadButton = function DownloadButton(props) {
  var label = props.label, onClick = props.onClick, primary = props.primary || false, full = props.full || false;
  var cls = primary
    ? "bg-stone-900 text-white hover:bg-stone-700"
    : "bg-white/80 border border-stone-900/10 text-stone-900 hover:bg-white";
  return (
    <button onClick={onClick} className={(full ? "w-full" : "flex-1") + " rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] transition-all " + cls}>
      {label}
    </button>
  );
};

window.CopyButton = function CopyButton(props) {
  var text = props.text, full = props.full || false;
  var tr = React.useContext(LangContext).tr;
  var copiedState = React.useState(false);
  var copied = copiedState[0], setCopied = copiedState[1];
  var handle = async function(e) {
    e.stopPropagation();
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };
  return (
    <button onClick={handle}
      className={(full ? "w-full" : "inline-flex") + " items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm uppercase tracking-[0.16em] transition-all " + (copied ? "border-stone-900/10 bg-[var(--accent)] text-stone-900" : "border-stone-900/10 bg-white/80 text-stone-900 hover:bg-white")}>
      <i data-lucide={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? tr.copied : tr.copy}
    </button>
  );
};
