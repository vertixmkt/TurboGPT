// ── App (root component) ─────────────────────────────────────────────────
var LangContext                   = window.LangContext;
var TRANSLATIONS                  = window.TRANSLATIONS;
var detectLang                    = window.detectLang;
var APP_CONFIG                    = window.APP_CONFIG;
var DEFAULT_LANG                  = APP_CONFIG.DEFAULT_LANG || "ptbr";
var PROMPTS_ALLOWED_SUBCATEGORIES = APP_CONFIG.PROMPTS_ALLOWED_SUBCATEGORIES || [];
var PROMPT_SUBCATEGORY_LABELS     = APP_CONFIG.PROMPT_SUBCATEGORY_LABELS || {};
var getHookCategoryMeta           = window.AppUtils.getHookCategoryMeta;
var filterAndRankPrompts          = window.AppUtils.filterAndRankPrompts;
var filterAndRankHooks            = window.AppUtils.filterAndRankHooks;
var copyToClipboard               = window.AppUtils.copyToClipboard;
var normalizeText                 = window.AppUtils.normalizeText;
var supabaseClient                = window.supabaseClient;

var Background                    = window.Background;
var Footer                        = window.Footer;

var FAVORITES_STORAGE_KEY = "turbo-gpt-favorite-hooks";
var PROMPT_FAVORITES_STORAGE_KEY = "turbo-gpt-favorite-prompts";
var SKILL_FAVORITES_STORAGE_KEY = "turbo-gpt-favorite-skills";
var RECENTS_STORAGE_KEY = "turbo-gpt-recent-hooks";

var CONTENT_FORMATS = [
  { id: "reels", label: "Reels", icon: "clapperboard", hint: "abertura forte", categoryIds: ["2-choque-surpresa", "3-polmica-contrariao", "8-urgncia-cta-direto", "13-resultado-transformao"], promptSubcategories: ["Copywriting", "Social Media"], terms: ["video", "reels", "shorts", "assista", "olha", "veja", "hook", "roteiro", "aconteceu", "resultado"] },
  { id: "story", label: "Story", icon: "smartphone", hint: "conversa rápida", categoryIds: ["5-perguntas-curiosidade", "6-storytelling-histria-pessoal", "8-urgncia-cta-direto"], promptSubcategories: ["Social Media", "Copywriting"], terms: ["story", "stories", "pergunta", "dm", "enquete", "historia", "hoje", "agora", "voce"] },
  { id: "carousel", label: "Post carrossel", icon: "panels-top-left", hint: "ideia em sequência", categoryIds: ["4-listas-numerados", "9-problema-dor", "10-tutorial-howto-soluo", "12-desafio-engajamento-interativo"], promptSubcategories: ["Social Media", "SEO & Content", "Copywriting"], terms: ["carrossel", "carousel", "post", "slides", "sequencia", "passo", "lista", "dicas", "erros", "como"] },
  { id: "ad", label: "Anúncio", icon: "megaphone", hint: "clique e oferta", categoryIds: ["8-urgncia-cta-direto", "9-problema-dor", "13-resultado-transformao", "1-segredo-informao-oculta"], promptSubcategories: ["Copywriting", "Sales & E-commerce", "Social Media"], terms: ["anuncio", "ad", "ads", "campanha", "criativo", "comprar", "resultado", "oferta", "solucao", "agora"] },
  { id: "vsl", label: "VSL", icon: "square-play", hint: "retenção e venda", categoryIds: ["1-segredo-informao-oculta", "3-polmica-contrariao", "6-storytelling-histria-pessoal", "9-problema-dor", "13-resultado-transformao"], promptSubcategories: ["Copywriting", "Sales & E-commerce"], terms: ["vsl", "sales video", "video sales", "pitch", "webinar", "segredo", "historia", "verdade", "problema", "resultado"] },
];

var OBJECTIVE_FILTERS = [
  { id: "atrai", label: "ATRAI", fullLabel: "Atrair atenção", icon: "sparkles", categoryIds: ["1-segredo-informao-oculta", "2-choque-surpresa", "5-perguntas-curiosidade"], promptSubcategories: ["Copywriting", "Social Media"], terms: ["headline", "hook", "attention", "awareness", "viral", "surpresa", "segredo", "sabia", "descobri", "acreditar"] },
  { id: "engaja", label: "ENGAJA", fullLabel: "Engajar", icon: "messages-square", categoryIds: ["3-polmica-contrariao", "5-perguntas-curiosidade", "11-what-if-imaginao"], promptSubcategories: ["Social Media", "Copywriting"], terms: ["engagement", "comment", "comentario", "quiz", "poll", "pergunta", "acha", "e se", "opinio", "comenta"] },
  { id: "vende", label: "VENDE", fullLabel: "Vender", icon: "badge-dollar-sign", categoryIds: ["8-urgncia-cta-direto", "9-problema-dor", "13-resultado-transformao"], promptSubcategories: ["Copywriting", "Sales & E-commerce"], terms: ["sales", "sell", "conversion", "checkout", "offer", "comprar", "oferta", "resultado", "solucao", "vagas"] },
  { id: "educa", label: "EDUCA", fullLabel: "Educar", icon: "book-open", categoryIds: ["4-listas-numerados", "7-teste-experimento-review", "10-tutorial-howto-soluo"], promptSubcategories: ["SEO & Content", "Social Media"], terms: ["educational", "tutorial", "how to", "guide", "blog", "article", "como", "passo", "dicas", "aprendi", "erros"] },
];

var STYLE_FILTERS = [
  { id: "curiosidade", label: "Curiosidade", color: "blue", categoryIds: ["2-choque-surpresa", "5-perguntas-curiosidade", "11-what-if-imaginao"], promptSubcategories: ["Copywriting", "Social Media"], terms: ["curiosity", "question", "unexpected", "por que", "voce sabia", "descobri", "pergunta"] },
  { id: "polemica", label: "Polêmica", color: "orange", categoryIds: ["3-polmica-contrariao"], promptSubcategories: ["Copywriting", "Social Media"], terms: ["controversial", "contrarian", "myth", "errado", "mito", "odio", "cancelar", "discordo"] },
  { id: "urgencia", label: "Urgência", color: "red", categoryIds: ["8-urgncia-cta-direto"], promptSubcategories: ["Copywriting", "Sales & E-commerce"], terms: ["urgency", "scarcity", "deadline", "limited", "agora", "hoje", "rapido", "antes", "urgente"] },
  { id: "storytelling", label: "Storytelling", color: "yellow", categoryIds: ["6-storytelling-histria-pessoal"], promptSubcategories: ["Copywriting", "Social Media"], terms: ["story", "storytelling", "narrative", "case study", "historia", "aconteceu", "jornada", "quando eu"] },
  { id: "autoridade", label: "Autoridade", color: "black", categoryIds: ["7-teste-experimento-review"], promptSubcategories: ["SEO & Content", "Sales & E-commerce"], terms: ["authority", "expert", "proof", "case study", "especialistas", "prova", "teste", "review", "metodo"] },
];

var AGGRESSION_FILTERS = [
  { id: "suave", label: "Suave", categoryIds: ["4-listas-numerados", "5-perguntas-curiosidade", "10-tutorial-howto-soluo"], promptSubcategories: ["SEO & Content", "Social Media"], terms: ["educational", "guide", "tips", "dicas", "como", "aprendi", "pergunta"] },
  { id: "moderado", label: "Moderado", categoryIds: ["1-segredo-informao-oculta", "6-storytelling-histria-pessoal", "9-problema-dor", "13-resultado-transformao"], promptSubcategories: ["Copywriting", "Sales & E-commerce"], terms: ["persuasive", "problem", "benefit", "segredo", "problema", "resultado", "verdade"] },
  { id: "forte", label: "Forte", categoryIds: ["2-choque-surpresa", "3-polmica-contrariao", "8-urgncia-cta-direto"], promptSubcategories: ["Copywriting", "Sales & E-commerce"], terms: ["direct response", "urgency", "scarcity", "shock", "chocante", "errado", "agora", "cancelar", "odio"] },
];

var STYLE_META = {
  curiosidade: { label: "Curiosidade", badgeClass: "bg-sky-100 text-sky-800 border-sky-200", railClass: "bg-sky-500", dotClass: "bg-sky-500" },
  urgencia: { label: "Urgência", badgeClass: "bg-red-100 text-red-800 border-red-200", railClass: "bg-red-500", dotClass: "bg-red-500" },
  segredo: { label: "Segredo", badgeClass: "bg-violet-100 text-violet-800 border-violet-200", railClass: "bg-violet-500", dotClass: "bg-violet-500" },
  storytelling: { label: "Storytelling", badgeClass: "bg-amber-100 text-amber-900 border-amber-200", railClass: "bg-amber-400", dotClass: "bg-amber-400" },
  polemica: { label: "Polêmica", badgeClass: "bg-orange-100 text-orange-900 border-orange-200", railClass: "bg-orange-500", dotClass: "bg-orange-500" },
  autoridade: { label: "Autoridade", badgeClass: "bg-stone-900 text-white border-stone-900", railClass: "bg-stone-900", dotClass: "bg-stone-900" },
  default: { label: "Hook", badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200", railClass: "bg-emerald-500", dotClass: "bg-emerald-500" },
};

function getPromptLabel(subcategory) {
  return PROMPT_SUBCATEGORY_LABELS[subcategory] || subcategory;
}

function getPromptText(item) {
  return (item.allPrompts && item.allPrompts.length ? item.allPrompts[0] : item.prompt) || "";
}

function getUserDisplayName(user) {
  if (!user) return "Sem login";
  var metadata = user.user_metadata || {};
  var name = metadata.full_name || metadata.name || metadata.display_name;
  if (name) return name;
  return user.email || "Usuário";
}

function getUserInitials(user) {
  var label = getUserDisplayName(user);
  var parts = label.split(/\s+/).filter(Boolean);
  if (!parts.length) return "TG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function UserAccountMenu(props) {
  var user = props.user;
  var open = props.open;
  var onToggle = props.onToggle;
  var onSignOut = props.onSignOut;
  var displayName = getUserDisplayName(user);
  var email = user && user.email;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex min-h-10 max-w-[220px] items-center gap-2 rounded-full px-2.5 text-left text-sm font-bold transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }}
        title={email || displayName}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
          {getUserInitials(user)}
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate" style={{ color: '#fff' }}>{displayName}</span>
          {email ? <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#888' }}>{email}</span> : null}
        </span>
        <i data-lucide="chevron-down" className={"h-4 w-4 shrink-0 transition-transform " + (open ? "rotate-180" : "")} style={{ color: '#888' }} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[90] w-[260px] overflow-hidden rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 22px 50px rgba(0,0,0,0.6)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="truncate text-sm font-black" style={{ color: '#fff' }}>{displayName}</p>
            {email ? <p className="mt-1 truncate text-xs font-medium" style={{ color: '#888' }}>{email}</p> : <p className="mt-1 text-xs font-medium" style={{ color: '#888' }}>Sessão não encontrada</p>}
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold transition-colors"
            style={{ color: '#888' }}
            onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}>
            <i data-lucide="log-out" className="h-4 w-4" />
            Sair da plataforma
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AuthInput(props) {
  return (
    <input
      type={props.type}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      required={props.required}
      className="w-full rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none"
      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.10)', color: '#ffffff', caretColor: '#3b82f6' }}
      onFocus={function(e) { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
      onBlur={function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }} />
  );
}

function AuthError(props) {
  if (!props.msg) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#ff6b6b' }}>
      <i data-lucide="alert-circle" className="h-4 w-4 shrink-0" />
      {props.msg}
    </div>
  );
}

function AuthSuccess(props) {
  if (!props.msg) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium" style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)', color: '#3b82f6' }}>
      <i data-lucide="check-circle" className="h-4 w-4 shrink-0" />
      {props.msg}
    </div>
  );
}

function LoginModal(props) {
  var onClose = props.onClose;
  var stateView = React.useState("login");
  var view = stateView[0], setView = stateView[1];
  var stateEmail = React.useState("");
  var email = stateEmail[0], setEmail = stateEmail[1];
  var statePassword = React.useState("");
  var password = statePassword[0], setPassword = statePassword[1];
  var stateLoading = React.useState(false);
  var loading = stateLoading[0], setLoading = stateLoading[1];
  var stateError = React.useState("");
  var errorMsg = stateError[0], setError = stateError[1];
  var stateSuccess = React.useState("");
  var successMsg = stateSuccess[0], setSuccess = stateSuccess[1];

  React.useEffect(function() {
    var onEsc = function(e) { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return function() { document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  var resetState = function() { setError(""); setSuccess(""); };

  var handleLogin = async function(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    resetState();
    try {
      var result = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password: password });
      if (result.error) { setError("Email ou senha incorretos."); setLoading(false); }
    } catch (_err) { setError("Erro ao conectar. Tente novamente."); setLoading(false); }
  };

  var handleForgot = async function(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    resetState();
    try {
      var redirectTo = window.location.origin + window.location.pathname;
      var result = await supabaseClient.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo });
      if (result.error) { setError("Não foi possível enviar o email. Verifique o endereço."); }
      else { setSuccess("Email enviado! Verifique sua caixa de entrada e clique no link de recuperação."); }
    } catch (_err) { setError("Erro ao conectar. Tente novamente."); }
    setLoading(false);
  };

  var switchView = function(next) { setView(next); resetState(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.80)' }} onClick={onClose}>
      <div className="modal-in w-full max-w-sm overflow-hidden rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 30px 90px rgba(0,0,0,0.8)' }} onClick={function(e) { e.stopPropagation(); }}>

        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                <i data-lucide={view === "login" ? "zap" : "key-round"} className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black" style={{ color: '#fff' }}>
                {view === "login" ? "Entrar na plataforma" : "Recuperar senha"}
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#888' }}>
                {view === "login" ? "Acesse sua biblioteca de hooks e prompts." : "Enviaremos um link de redefinição para seu email."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#888', background: 'transparent' }}>
              <i data-lucide="x" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "login" ? (
          <form onSubmit={handleLogin} className="px-6 pb-6 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#888' }}>Email</label>
              <AuthInput type="email" value={email} onChange={function(e) { setEmail(e.target.value); resetState(); }} placeholder="seu@email.com" required={true} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#888' }}>Senha</label>
                <button type="button" onClick={function() { switchView("forgot"); }} className="text-xs font-semibold hover:underline" style={{ color: '#3b82f6' }}>
                  Esqueci minha senha
                </button>
              </div>
              <AuthInput type="password" value={password} onChange={function(e) { setPassword(e.target.value); resetState(); }} placeholder="••••••••" required={true} />
            </div>
            <AuthError msg={errorMsg} />
            <button type="submit" disabled={loading} className="mt-1 w-full rounded-lg px-4 py-3 text-sm font-black transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="px-6 pb-6 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#888' }}>Email</label>
              <AuthInput type="email" value={email} onChange={function(e) { setEmail(e.target.value); resetState(); }} placeholder="seu@email.com" required={true} />
            </div>
            <AuthError msg={errorMsg} />
            <AuthSuccess msg={successMsg} />
            {!successMsg ? (
              <button type="submit" disabled={loading} className="mt-1 w-full rounded-lg px-4 py-3 text-sm font-black transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                {loading ? "Enviando…" : "Enviar link de recuperação"}
              </button>
            ) : null}
            <button type="button" onClick={function() { switchView("login"); }} className="w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-colors" style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#888', background: 'transparent' }}>
              Voltar para o login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ResetPasswordModal(props) {
  var onDone = props.onDone;
  var statePassword = React.useState("");
  var password = statePassword[0], setPassword = statePassword[1];
  var stateConfirm = React.useState("");
  var confirm = stateConfirm[0], setConfirm = stateConfirm[1];
  var stateLoading = React.useState(false);
  var loading = stateLoading[0], setLoading = stateLoading[1];
  var stateError = React.useState("");
  var errorMsg = stateError[0], setError = stateError[1];
  var stateSuccess = React.useState(false);
  var success = stateSuccess[0], setSuccess = stateSuccess[1];

  var handleSubmit = async function(e) {
    e.preventDefault();
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    setError("");
    try {
      var result = await supabaseClient.auth.updateUser({ password: password });
      if (result.error) { setError("Não foi possível redefinir a senha. Tente novamente."); setLoading(false); }
      else { setSuccess(true); setTimeout(onDone, 2000); }
    } catch (_err) { setError("Erro ao conectar. Tente novamente."); setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.80)' }}>
      <div className="modal-in w-full max-w-sm overflow-hidden rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 30px 90px rgba(0,0,0,0.8)' }}>
        <div className="px-6 pt-6 pb-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
            <i data-lucide="lock-keyhole" className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black" style={{ color: '#fff' }}>Definir nova senha</h2>
          <p className="mt-1 text-sm" style={{ color: '#888' }}>Escolha uma senha segura para sua conta.</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#888' }}>Nova senha</label>
            <AuthInput type="password" value={password} onChange={function(e) { setPassword(e.target.value); setError(""); }} placeholder="••••••••" required={true} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: '#888' }}>Confirmar senha</label>
            <AuthInput type="password" value={confirm} onChange={function(e) { setConfirm(e.target.value); setError(""); }} placeholder="••••••••" required={true} />
          </div>
          <AuthError msg={errorMsg} />
          {success ? (
            <AuthSuccess msg="Senha redefinida com sucesso! Redirecionando…" />
          ) : (
            <button type="submit" disabled={loading} className="mt-1 w-full rounded-lg px-4 py-3 text-sm font-black transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
              {loading ? "Salvando…" : "Salvar nova senha"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function readStoredList(key) {
  try {
    var value = window.localStorage.getItem(key);
    var parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeStoredList(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value || []));
  } catch (error) {}
}

function clearAuthStorage() {
  var storageKey = (APP_CONFIG && APP_CONFIG.SUPABASE_AUTH_STORAGE_KEY) || "turbo-gpt-auth";
  [window.localStorage, window.sessionStorage].forEach(function(storage) {
    if (!storage) return;
    try {
      storage.removeItem(storageKey);
      storage.removeItem(storageKey + "-code-verifier");
      Object.keys(storage).forEach(function(key) {
        if (
          key.indexOf(storageKey) === 0 ||
          key.indexOf("sb-") === 0 ||
          key.indexOf("supabase.auth.") === 0 ||
          key.toLowerCase().indexOf("supabase") !== -1 ||
          key.toLowerCase().indexOf("auth-token") !== -1
        ) storage.removeItem(key);
      });
    } catch (error) {}
  });
}

function toggleListItem(list, id) {
  return list.indexOf(id) === -1 ? [id].concat(list) : list.filter(function(itemId) { return itemId !== id; });
}

function addRecent(list, id) {
  return [id].concat((list || []).filter(function(itemId) { return itemId !== id; })).slice(0, 24);
}

function includesAnyTerm(item, terms) {
  var blob = normalizeText([item.text, item.categoryLabel, item.categoryId].join(" "));
  return (terms || []).some(function(term) {
    return blob.indexOf(normalizeText(term)) !== -1;
  });
}

function getPromptRuleBlob(item) {
  return normalizeText([item.name, item.description, item.subcategory, getPromptText(item)].join(" "));
}

function includesAnyPromptTerm(item, terms) {
  var blob = getPromptRuleBlob(item);
  return (terms || []).some(function(term) {
    return blob.indexOf(normalizeText(term)) !== -1;
  });
}

function matchesHookRule(item, rule) {
  if (!rule) return true;
  if ((rule.categoryIds || []).indexOf(item.categoryId) !== -1) return true;
  return includesAnyTerm(item, rule.terms);
}

function matchesPromptRule(item, rule) {
  if (!rule) return true;
  if ((rule.promptSubcategories || []).indexOf(item.subcategory) !== -1) return true;
  return includesAnyPromptTerm(item, rule.terms);
}

function getHookRuleScore(item, rule) {
  if (!rule) return 0;
  var score = 0;
  if ((rule.categoryIds || []).indexOf(item.categoryId) !== -1) score += 16;
  if (includesAnyTerm(item, rule.terms)) score += 8;
  return score;
}

function getPromptRuleScore(item, rule) {
  if (!rule) return 0;
  var score = 0;
  if ((rule.promptSubcategories || []).indexOf(item.subcategory) !== -1) score += 16;
  if (includesAnyPromptTerm(item, rule.terms)) score += 8;
  return score;
}

function getHookStyleId(item) {
  if (item.categoryId === "1-segredo-informao-oculta") return "segredo";
  if (item.categoryId === "8-urgncia-cta-direto") return "urgencia";
  if (item.categoryId === "6-storytelling-histria-pessoal") return "storytelling";
  if (item.categoryId === "3-polmica-contrariao") return "polemica";
  if (item.categoryId === "7-teste-experimento-review") return "autoridade";
  if (item.categoryId === "2-choque-surpresa" || item.categoryId === "5-perguntas-curiosidade" || item.categoryId === "11-what-if-imaginao") return "curiosidade";
  return "default";
}

function getHookStyleMeta(item) {
  return STYLE_META[getHookStyleId(item)] || STYLE_META.default;
}

function getHighlightBadges(item) {
  var styleId = getHookStyleId(item);
  var badges = [];
  var index = Number(String(item.id || "").split("-").pop()) || 0;

  if (["segredo", "urgencia", "polemica"].indexOf(styleId) !== -1) badges.push("💰 Alta conversão");
  if (["curiosidade", "polemica", "urgencia"].indexOf(styleId) !== -1 || index % 9 === 0) badges.push("⚡ Viral");
  if (["storytelling", "segredo"].indexOf(styleId) !== -1 || index % 11 === 0) badges.push("🔥 Mais usados");

  return badges.slice(0, 2);
}

function SimpleCopyButton(props) {
  var text = props.text || "";
  var label = props.label || "Copiar";
  var onCopied = props.onCopied || function() {};
  var copiedState = React.useState(false);
  var copied = copiedState[0], setCopied = copiedState[1];

  var handleCopy = async function(event) {
    event.stopPropagation();
    await copyToClipboard(text);
    onCopied();
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 1400);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-all active:scale-[0.98]"
      style={copied
        ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
        : { background: '#161616', color: '#fff', border: '1px solid rgba(255,255,255,0.10)' }}
      title={copied ? "Copiado" : label}>
      <i data-lucide={copied ? "check" : "copy"} className="h-4 w-4" />
      <span>{copied ? "Copiado!" : label}</span>
    </button>
  );
}

function SaveButton(props) {
  var saved = props.saved;
  var onToggle = props.onToggle;

  return (
    <button
      type="button"
      onClick={function(event) { event.stopPropagation(); onToggle(); }}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-all active:scale-[0.98]"
      style={saved
        ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
        : { background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.10)' }}
      title={saved ? "Remover dos favoritos" : "Salvar"}>
      <i data-lucide={saved ? "bookmark-check" : "bookmark"} className="h-4 w-4" />
      <span>{saved ? "Salvo" : "Salvar"}</span>
    </button>
  );
}

function ResultRow(props) {
  var item = props.item;
  var onOpen = props.onOpen;
  var isHook = item.type === "hook";
  var label = isHook ? item.categoryLabel : getPromptLabel(item.subcategory);

  return (
    <button
      type="button"
      onClick={function() { onOpen(item); }}
      className="group grid w-full grid-cols-[1fr_auto] gap-3 px-4 py-3 text-left transition-colors"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}>
      <span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#888' }}>{isHook ? "Hook" : "Prompt"} · {label}</span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed" style={{ color: '#fff' }}>{isHook ? item.text : item.name}</span>
      </span>
      <i data-lucide="arrow-up-right" className="mt-2 h-4 w-4" style={{ color: '#888' }} />
    </button>
  );
}

function FilterChip(props) {
  var active = props.active;
  var label = props.label;
  var icon = props.icon;
  var onClick = props.onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all active:scale-[0.97]"
      style={active
        ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
        : { background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
      {icon ? <i data-lucide={icon} className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

function ContentTypeToggle(props) {
  var contentType = props.contentType;
  var onChange = props.onChange;
  var options = [
    { id: "hooks", label: "Hooks", icon: "anchor", hint: "aberturas" },
    { id: "prompts", label: "Prompts", icon: "file-text", hint: "comandos" },
    { id: "skills", label: "Skills", icon: "wand-2", hint: "agentes" },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-2 rounded-2xl p-1.5 sm:w-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {options.map(function(option) {
        var active = contentType === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={function() { onChange(option.id); }}
            className="group flex min-h-14 items-center gap-3 rounded-xl px-3 text-left transition-all active:scale-[0.98]"
            style={active ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' } : { color: '#888' }}>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all" style={active
              ? { background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.15)' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <i data-lucide={option.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black leading-tight">{option.label}</span>
              <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.10em]" style={active ? { color: 'rgba(255,255,255,0.6)' } : { color: '#666' }}>{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ViewModeButton(props) {
  var active = props.active;
  var label = props.label;
  var icon = props.icon;
  var count = props.count;
  var onClick = props.onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-3 pr-4 text-sm font-black transition-all active:scale-[0.97]"
      style={active
        ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
        : { background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={active
        ? { background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.15)' }
        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <i data-lucide={icon} className="h-4 w-4" />
      </span>
      <span>{label}</span>
      {typeof count === "number" ? <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(0,0,0,0.15)' }}>{count}</span> : null}
    </button>
  );
}

function ContentFormatCard(props) {
  var format = props.format;
  var active = props.active;
  var onClick = props.onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-[132px] min-w-0 rounded-lg p-4 text-left transition-all active:scale-[0.98] hover:-translate-y-1"
      style={active
        ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
        : { background: '#0f0f0f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md" style={active
        ? { background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.15)' }
        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <i data-lucide={format.icon} className="h-5 w-5" />
      </span>
      <span className="mt-4 block break-words text-xl font-bold leading-tight">{format.label}</span>
      <span className="mt-1 block text-sm" style={active ? { color: 'rgba(255,255,255,0.6)' } : { color: '#888' }}>{format.hint}</span>
    </button>
  );
}

function HookCard(props) {
  var item = props.item;
  var saved = props.saved;
  var onOpen = props.onOpen;
  var onCopy = props.onCopy;
  var onToggleSave = props.onToggleSave;
  var styleMeta = getHookStyleMeta(item);
  var badges = getHighlightBadges(item);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-lg p-5 transition-all hover:-translate-y-1"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', minHeight: '236px' }}
      onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.20), 0 8px 32px rgba(59,130,246,0.15)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div className={"absolute inset-y-0 left-0 w-1.5 " + styleMeta.railClass} />
      <button type="button" onClick={onOpen} className="flex-1 block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] " + styleMeta.badgeClass}>
            <span className={"h-2 w-2 rounded-full " + styleMeta.dotClass} />
            {styleMeta.label}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#888' }}>{item.categoryLabel}</span>
        </div>
        <h3 className="mt-5 text-xl font-bold leading-snug tracking-normal md:text-[21px]" style={{ color: '#fff' }}>{item.text}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map(function(badge) {
            return <span key={badge} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: '#888' }}>{badge}</span>;
          })}
        </div>
      </button>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <SimpleCopyButton text={item.text} label="Copiar" onCopied={onCopy} />
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>
    </article>
  );
}

function PromptCard(props) {
  var item = props.item;
  var onOpen = props.onOpen;
  var saved = props.saved;
  var onToggleSave = props.onToggleSave;
  var text = getPromptText(item);

  return (
    <article
      className="flex flex-col rounded-lg p-5 transition-all hover:-translate-y-1"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.20), 0 8px 32px rgba(59,130,246,0.15)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <button type="button" onClick={onOpen} className="flex-1 block w-full text-left">
        <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: 'rgba(255,255,255,0.06)', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>{getPromptLabel(item.subcategory)}</span>
        <h3 className="mt-4 text-lg font-bold leading-snug" style={{ color: '#fff' }}>{item.name}</h3>
        {item.description ? <p className="mt-2 text-sm leading-relaxed" style={{ color: '#888' }}>{item.description}</p> : null}
      </button>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <SimpleCopyButton text={text} label="Copiar prompt" />
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>
    </article>
  );
}

function downloadSkill(item, ext) {
  var filename = item.id + "." + ext;
  var blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SkillCard(props) {
  var item = props.item;
  var saved = props.saved;
  var onToggleSave = props.onToggleSave;

  return (
    <article
      className="flex flex-col rounded-lg p-5 transition-all hover:-translate-y-1"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.20), 0 8px 32px rgba(59,130,246,0.15)'; }}
      onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div className="flex-1">
        <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.20)' }}>Skill</span>
        <h3 className="mt-4 text-lg font-bold leading-snug" style={{ color: '#fff' }}>{item.name}</h3>
        {item.description ? <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: '#888' }}>{item.description}</p> : null}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <SimpleCopyButton text={item.content} label="Copiar" />
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={function() { downloadSkill(item, "txt"); }}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all"
          style={{ background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
          <i data-lucide="download" className="h-3.5 w-3.5" />
          .txt
        </button>
        <button
          type="button"
          onClick={function() { downloadSkill(item, "md"); }}
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all"
          style={{ background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
          <i data-lucide="download" className="h-3.5 w-3.5" />
          .md
        </button>
      </div>
    </article>
  );
}

function DetailModal(props) {
  var item = props.item;
  var onClose = props.onClose;

  React.useEffect(function() {
    var onEsc = function(event) {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return function() { document.removeEventListener("keydown", onEsc); };
  }, [onClose]);

  if (!item) return null;

  var isHook = item.type === "hook";
  var label = isHook ? item.categoryLabel : getPromptLabel(item.subcategory);
  var title = isHook ? "Hook" : item.name;
  var body = isHook ? item.text : getPromptText(item);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.82)' }} onClick={onClose}>
      <div className="modal-in max-h-[88vh] w-full max-w-2xl overflow-auto rounded-2xl p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 30px 90px rgba(0,0,0,0.8)' }} onClick={function(event) { event.stopPropagation(); }}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>{label}</span>
            <h2 className="mt-3 text-2xl font-bold" style={{ color: '#fff' }}>{title}</h2>
            {!isHook && item.description ? <p className="mt-2 text-sm leading-relaxed" style={{ color: '#888' }}>{item.description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#888', background: 'transparent' }} title="Fechar">
            <i data-lucide="x" className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <pre className="max-h-[52vh] whitespace-pre-wrap text-base leading-relaxed" style={{ color: '#fff' }}>{body}</pre>
          <div className="mt-4 flex justify-end">
            <SimpleCopyButton text={body} label="Copiar" />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  var stateLang = React.useState(DEFAULT_LANG || detectLang());
  var lang = stateLang[0];
  var tr = (TRANSLATIONS && TRANSLATIONS[lang]) || TRANSLATIONS.ptbr;

  var stateContentType = React.useState("hooks");
  var contentType = stateContentType[0], setContentType = stateContentType[1];
  var stateSearch = React.useState("");
  var search = stateSearch[0], setSearch = stateSearch[1];
  var statePromptCategory = React.useState("All");
  var activePromptCategory = statePromptCategory[0], setActivePromptCategory = statePromptCategory[1];
  var stateHookCategory = React.useState("all");
  var activeHookCategory = stateHookCategory[0], setActiveHookCategory = stateHookCategory[1];
  var stateFormat = React.useState("reels");
  var activeFormat = stateFormat[0], setActiveFormat = stateFormat[1];
  var stateObjective = React.useState("atrai");
  var activeObjective = stateObjective[0], setActiveObjective = stateObjective[1];
  var stateStyle = React.useState("all");
  var activeStyle = stateStyle[0], setActiveStyle = stateStyle[1];
  var stateAggression = React.useState("all");
  var activeAggression = stateAggression[0], setActiveAggression = stateAggression[1];
  var stateViewMode = React.useState("all");
  var viewMode = stateViewMode[0], setViewMode = stateViewMode[1];
  var stateFavorites = React.useState(function() { return readStoredList(FAVORITES_STORAGE_KEY); });
  var favoriteIds = stateFavorites[0], setFavoriteIds = stateFavorites[1];
  var statePromptFavorites = React.useState(function() { return readStoredList(PROMPT_FAVORITES_STORAGE_KEY); });
  var promptFavoriteIds = statePromptFavorites[0], setPromptFavoriteIds = statePromptFavorites[1];
  var stateRecents = React.useState(function() { return readStoredList(RECENTS_STORAGE_KEY); });
  var recentIds = stateRecents[0], setRecentIds = stateRecents[1];
  var stateSessionUser = React.useState(null);
  var sessionUser = stateSessionUser[0], setSessionUser = stateSessionUser[1];
  var stateUserMenuOpen = React.useState(false);
  var userMenuOpen = stateUserMenuOpen[0], setUserMenuOpen = stateUserMenuOpen[1];
  var stateLoginModalOpen = React.useState(false);
  var loginModalOpen = stateLoginModalOpen[0], setLoginModalOpen = stateLoginModalOpen[1];
  var stateResetModalOpen = React.useState(false);
  var resetModalOpen = stateResetModalOpen[0], setResetModalOpen = stateResetModalOpen[1];
  var stateVisibleCount = React.useState(36);
  var visibleCount = stateVisibleCount[0], setVisibleCount = stateVisibleCount[1];
  var stateSelected = React.useState(null);
  var selected = stateSelected[0], setSelected = stateSelected[1];
  var stateSkillFavorites = React.useState(function() { return readStoredList(SKILL_FAVORITES_STORAGE_KEY); });
  var skillFavoriteIds = stateSkillFavorites[0], setSkillFavoriteIds = stateSkillFavorites[1];

  var allPromptItems = React.useMemo(function() {
    return (window.LLM_PROMPTS_DATA || []).filter(function(item) {
      return PROMPTS_ALLOWED_SUBCATEGORIES.indexOf(item.subcategory) !== -1;
    });
  }, []);

  var hookGroups = React.useMemo(function() {
    return (window.CONTENT_HOOKS_DATA || []).map(function(category) {
      return getHookCategoryMeta(category);
    });
  }, []);

  var allHooks = React.useMemo(function() {
    return filterAndRankHooks(hookGroups, { search: "", activeIntent: "all", activeCategory: "all" });
  }, [hookGroups]);

  var hookMap = React.useMemo(function() {
    var map = {};
    allHooks.forEach(function(item) { map[item.id] = item; });
    return map;
  }, [allHooks]);

  var allSkillItems = React.useMemo(function() {
    return (window.SKILLS_DATA || []);
  }, []);

  var activeFormatRule = CONTENT_FORMATS.find(function(item) { return item.id === activeFormat; });
  var activeObjectiveRule = OBJECTIVE_FILTERS.find(function(item) { return item.id === activeObjective; });
  var activeStyleRule = STYLE_FILTERS.find(function(item) { return item.id === activeStyle; });
  var activeAggressionRule = AGGRESSION_FILTERS.find(function(item) { return item.id === activeAggression; });

  var promptGroups = React.useMemo(function() {
    return PROMPTS_ALLOWED_SUBCATEGORIES.map(function(subcategory) {
      return {
        id: subcategory,
        label: getPromptLabel(subcategory),
        count: allPromptItems.filter(function(item) { return item.subcategory === subcategory; }).length,
      };
    });
  }, [allPromptItems]);

  var activeItems = React.useMemo(function() {
    if (contentType === "skills") {
      var q = normalizeText(search.trim());
      return allSkillItems.filter(function(item) {
        if (viewMode === "favorites" && skillFavoriteIds.indexOf(item.id) === -1) return false;
        if (!q) return true;
        return normalizeText(item.name).indexOf(q) !== -1 || normalizeText(item.description).indexOf(q) !== -1;
      });
    }

    if (contentType === "prompts") {
      return filterAndRankPrompts(allPromptItems, {
        search: search,
        activeIntent: "all",
        activeSubcategory: activePromptCategory,
      })
        .filter(function(item) {
          if (viewMode === "favorites" && promptFavoriteIds.indexOf(item.id) === -1) return false;
          if (!matchesPromptRule(item, activeFormatRule)) return false;
          if (!matchesPromptRule(item, activeObjectiveRule)) return false;
          if (!matchesPromptRule(item, activeStyleRule)) return false;
          if (!matchesPromptRule(item, activeAggressionRule)) return false;
          return true;
        })
        .sort(function(a, b) {
          var scoreA = getPromptRuleScore(a, activeFormatRule) + getPromptRuleScore(a, activeObjectiveRule) + getPromptRuleScore(a, activeStyleRule) + getPromptRuleScore(a, activeAggressionRule);
          var scoreB = getPromptRuleScore(b, activeFormatRule) + getPromptRuleScore(b, activeObjectiveRule) + getPromptRuleScore(b, activeStyleRule) + getPromptRuleScore(b, activeAggressionRule);
          return scoreB - scoreA;
        });
    }

    var rankedHooks = filterAndRankHooks(hookGroups, {
      search: search,
      activeIntent: "all",
      activeCategory: activeHookCategory,
    });

    return rankedHooks
      .filter(function(item) {
        if (viewMode === "favorites" && favoriteIds.indexOf(item.id) === -1) return false;
        if (viewMode === "recent" && recentIds.indexOf(item.id) === -1) return false;
        if (!matchesHookRule(item, activeFormatRule)) return false;
        if (!matchesHookRule(item, activeObjectiveRule)) return false;
        if (!matchesHookRule(item, activeStyleRule)) return false;
        if (!matchesHookRule(item, activeAggressionRule)) return false;
        return true;
      })
      .sort(function(a, b) {
        if (viewMode === "recent") return recentIds.indexOf(a.id) - recentIds.indexOf(b.id);
        var scoreA = getHookRuleScore(a, activeFormatRule) + getHookRuleScore(a, activeObjectiveRule) + getHookRuleScore(a, activeStyleRule) + getHookRuleScore(a, activeAggressionRule);
        var scoreB = getHookRuleScore(b, activeFormatRule) + getHookRuleScore(b, activeObjectiveRule) + getHookRuleScore(b, activeStyleRule) + getHookRuleScore(b, activeAggressionRule);
        return scoreB - scoreA;
      });
  }, [contentType, allPromptItems, allSkillItems, hookGroups, activePromptCategory, activeHookCategory, search, activeFormat, activeObjective, activeStyle, activeAggression, viewMode, favoriteIds, promptFavoriteIds, skillFavoriteIds, recentIds]);

  var searchResults = React.useMemo(function() {
    if (!search.trim()) return [];

    if (contentType === "prompts") {
      return filterAndRankPrompts(allPromptItems, {
        search: search,
        activeIntent: "all",
        activeSubcategory: "All",
      }).slice(0, 6).map(function(item) {
        return Object.assign({ type: "prompt" }, item);
      });
    }

    return filterAndRankHooks(hookGroups, {
      search: search,
      activeIntent: "all",
      activeCategory: "all",
    }).slice(0, 6).map(function(item) {
      return Object.assign({ type: "hook" }, item);
    });
  }, [contentType, allPromptItems, hookGroups, search]);

  React.useEffect(function() {
    writeStoredList(FAVORITES_STORAGE_KEY, favoriteIds);
  }, [favoriteIds]);

  React.useEffect(function() {
    writeStoredList(PROMPT_FAVORITES_STORAGE_KEY, promptFavoriteIds);
  }, [promptFavoriteIds]);

  React.useEffect(function() {
    writeStoredList(SKILL_FAVORITES_STORAGE_KEY, skillFavoriteIds);
  }, [skillFavoriteIds]);

  React.useEffect(function() {
    writeStoredList(RECENTS_STORAGE_KEY, recentIds);
  }, [recentIds]);

  React.useEffect(function() {
    var mounted = true;
    if (!supabaseClient || !supabaseClient.auth) return function() {};

    supabaseClient.auth.getSession().then(function(result) {
      if (!mounted) return;
      var session = result && result.data && result.data.session;
      setSessionUser(session ? session.user : null);
    });

    var subscriptionResult = supabaseClient.auth.onAuthStateChange(function(event, session) {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setResetModalOpen(true);
        return;
      }
      setSessionUser(session ? session.user : null);
      setUserMenuOpen(false);
      if (event === "SIGNED_IN") setLoginModalOpen(false);
    });

    return function() {
      mounted = false;
      var subscription = subscriptionResult && subscriptionResult.data && subscriptionResult.data.subscription;
      if (subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  React.useEffect(function() {
    setVisibleCount(36);
  }, [contentType, activePromptCategory, activeHookCategory, activeFormat, activeObjective, activeStyle, activeAggression, search, viewMode]);

  React.useEffect(function() {
    if (window.lucide) window.lucide.createIcons();
  }, [contentType, activePromptCategory, activeHookCategory, activeFormat, activeObjective, activeStyle, activeAggression, search, activeItems.length, selected, visibleCount, viewMode, favoriteIds.length, recentIds.length]);

  var currentCategories = contentType === "prompts"
    ? [{ id: "All", label: tr.all, count: allPromptItems.length }].concat(promptGroups)
    : [{ id: "all", label: "Todas", count: allHooks.length }].concat(hookGroups);
  var activeCategory = contentType === "prompts" ? activePromptCategory : activeHookCategory;
  var visibleItems = activeItems.slice(0, visibleCount);

  var handleCategorySelect = function(categoryId) {
    if (contentType === "prompts") setActivePromptCategory(categoryId);
    else setActiveHookCategory(categoryId);
  };

  var markRecent = function(item) {
    if (!item || item.type === "prompt") return;
    setRecentIds(function(current) { return addRecent(current, item.id); });
  };

  var handleOpenItem = function(item) {
    markRecent(item);
    setSelected(item);
  };

  var toggleFavorite = function(item) {
    setFavoriteIds(function(current) { return toggleListItem(current, item.id); });
  };

  var togglePromptFavorite = function(item) {
    setPromptFavoriteIds(function(current) { return toggleListItem(current, item.id); });
  };

  var toggleSkillFavorite = function(item) {
    setSkillFavoriteIds(function(current) { return toggleListItem(current, item.id); });
  };

  var handleSignOut = async function() {
    setUserMenuOpen(false);
    setSessionUser(null);
    try {
      if (supabaseClient && supabaseClient.auth) {
        await supabaseClient.auth.signOut({ scope: "local" });
      }
    } catch (_err) {}
    clearAuthStorage();
    window.location.replace(window.location.pathname);
  };

  return (
    <LangContext.Provider value={{ lang: lang, setLang: function() {}, tr: tr }}>
      <div className="relative min-h-screen overflow-x-hidden" style={{ color: '#fff' }}>
        <Background />

        <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.90)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-6">
            <div className="flex w-full items-center justify-between gap-3 md:w-auto">
              <button type="button" onClick={function() { setViewMode("all"); setContentType("hooks"); }} className="flex min-w-0 items-center gap-3 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                  <i data-lucide="zap" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-black tracking-normal" style={{ color: '#fff' }}>Turbo GPT</span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#888' }}>Hooks e prompts</span>
                </span>
              </button>

              {sessionUser ? (
                <div className="md:hidden relative">
                  <button
                    type="button"
                    onClick={function() { setUserMenuOpen(!userMenuOpen); }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-2.5 text-sm font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }}
                    title={sessionUser.email}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                      {getUserInitials(sessionUser)}
                    </span>
                    <i data-lucide="chevron-down" className={"h-4 w-4 transition-transform " + (userMenuOpen ? "rotate-180" : "")} style={{ color: '#888' }} />
                  </button>
                  {userMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[90] w-[260px] overflow-hidden rounded-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 22px 50px rgba(0,0,0,0.6)' }}>
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="truncate text-sm font-black" style={{ color: '#fff' }}>{getUserDisplayName(sessionUser)}</p>
                        <p className="mt-1 truncate text-xs font-medium" style={{ color: '#888' }}>{sessionUser.email}</p>
                      </div>
                      <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold transition-colors" style={{ color: '#888' }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}>
                        <i data-lucide="log-out" className="h-4 w-4" />
                        Sair da plataforma
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={function() { setLoginModalOpen(true); }}
                  className="md:hidden inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-black transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                  <i data-lucide="log-in" className="h-4 w-4" />
                  Entrar
                </button>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2 md:mx-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <i data-lucide="search" className="h-5 w-5 shrink-0" style={{ color: '#888' }} />
              <input
                value={search}
                onChange={function(event) { setSearch(event.target.value); }}
                placeholder="Buscar por palavra, categoria ou tipo de hook"
                className="min-h-9 min-w-0 w-full bg-transparent text-base font-medium focus:outline-none"
                style={{ color: '#fff' }} />
              {search ? (
                <button type="button" onClick={function() { setSearch(""); }} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md" style={{ color: '#888' }} title="Limpar busca">
                  <i data-lucide="x" className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={function() { setViewMode(viewMode === "favorites" ? "all" : "favorites"); setContentType("hooks"); }}
                className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition-all"
                style={viewMode === "favorites"
                  ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
                <i data-lucide="bookmark" className="h-4 w-4" />
                Favoritos
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.10)' }}>{favoriteIds.length}</span>
              </button>
              {sessionUser ? (
                <UserAccountMenu
                  user={sessionUser}
                  open={userMenuOpen}
                  onToggle={function() { setUserMenuOpen(!userMenuOpen); }}
                  onSignOut={handleSignOut} />
              ) : (
                <button
                  type="button"
                  onClick={function() { setLoginModalOpen(true); }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-sm font-black transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                  <i data-lucide="log-in" className="h-4 w-4" />
                  Entrar
                </button>
              )}
            </div>
          </div>

          {search.trim() ? (
            <div className="mx-auto max-w-[1240px] px-4 pb-3 md:px-6">
              <div className="overflow-hidden rounded-lg" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 18px 42px rgba(0,0,0,0.6)' }}>
                {searchResults.length ? searchResults.map(function(item) {
                  return <ResultRow key={item.type + "-" + item.id} item={item} onOpen={handleOpenItem} />;
                }) : <div className="px-4 py-4 text-sm font-medium" style={{ color: '#888' }}>Nenhum resultado encontrado.</div>}
              </div>
            </div>
          ) : null}
        </header>

        <main className="relative mx-auto min-h-screen max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
          <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}>
                <i data-lucide="trophy" className="h-4 w-4" style={{ color: '#3b82f6' }} />
                Top criador da semana
              </div>
              <h1 className="mt-4 max-w-[10ch] text-3xl font-black leading-tight tracking-normal sm:max-w-none md:text-5xl" style={{ color: '#fff' }}>O que você quer criar hoje?</h1>
            </div>
            <div className="rounded-lg px-4 py-3" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-bold" style={{ color: '#fff' }}>Você já salvou {favoriteIds.length + promptFavoriteIds.length + skillFavoriteIds.length} ideias</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em]" style={{ color: '#888' }}>{activeItems.length} resultados prontos</p>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
            {CONTENT_FORMATS.map(function(format) {
              return (
                <ContentFormatCard
                  key={format.id}
                  format={format}
                  active={activeFormat === format.id}
                  onClick={function() { setActiveFormat(format.id); if (contentType === "hooks") setViewMode("all"); }} />
              );
            })}
          </section>

          <section className="mt-6 rounded-lg p-4" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ContentTypeToggle
                contentType={contentType}
                onChange={function(nextType) {
                  setContentType(nextType);
                  setViewMode("all");
                }} />

              <div className="flex gap-2 overflow-x-auto pb-1">
                <ViewModeButton active={viewMode === "all"} label="Todos" icon="layout-grid" onClick={function() { setViewMode("all"); }} />
                <ViewModeButton active={viewMode === "favorites"} label="Favoritos" icon="bookmark" count={contentType === "hooks" ? favoriteIds.length : promptFavoriteIds.length} onClick={function() { setViewMode("favorites"); }} />
                {contentType === "hooks" ? (
                  <ViewModeButton active={viewMode === "recent"} label="Usados recentemente" icon="history" onClick={function() { setViewMode("recent"); }} />
                ) : null}
              </div>
            </div>

            {contentType === "skills" ? null : <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em]" style={{ color: '#888' }}>Objetivo do conteúdo</p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {OBJECTIVE_FILTERS.map(function(filter) {
                    return <FilterChip key={filter.id} active={activeObjective === filter.id} label={filter.label} icon={filter.icon} onClick={function() { setActiveObjective(activeObjective === filter.id ? "all" : filter.id); }} />;
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em]" style={{ color: '#888' }}>Estilo {contentType === "prompts" ? "do prompt" : "do hook"}</p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  <FilterChip active={activeStyle === "all"} label="Todos" icon="sparkles" onClick={function() { setActiveStyle("all"); }} />
                  {STYLE_FILTERS.map(function(filter) {
                    return <FilterChip key={filter.id} active={activeStyle === filter.id} label={filter.label} onClick={function() { setActiveStyle(activeStyle === filter.id ? "all" : filter.id); }} />;
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em]" style={{ color: '#888' }}>Nível de agressividade</p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  <FilterChip active={activeAggression === "all"} label="Todos" icon="sliders-horizontal" onClick={function() { setActiveAggression("all"); }} />
                  {AGGRESSION_FILTERS.map(function(filter) {
                    return <FilterChip key={filter.id} active={activeAggression === filter.id} label={filter.label} onClick={function() { setActiveAggression(activeAggression === filter.id ? "all" : filter.id); }} />;
                  })}
                </div>
              </div>
            </div>}
          </section>

          {contentType !== "skills" ? <section className="mt-5">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
              {currentCategories.map(function(category) {
                var selectedCategory = activeCategory === category.id;
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={function() { handleCategorySelect(category.id); }}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all active:scale-[0.97]"
                    style={selectedCategory
                      ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff', border: '1px solid rgba(59,130,246,0.35)' }
                      : { background: '#161616', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {category.icon ? <span>{category.icon}</span> : null}
                    {category.label}
                    <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: 'rgba(255,255,255,0.10)' }}>{category.count}</span>
                  </button>
                );
              })}
            </div>
          </section> : null}

          <section className="mt-6 pb-12">
            {!sessionUser ? (
              <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                  <i data-lucide="lock" className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-black" style={{ color: '#fff' }}>Acesso exclusivo para membros</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: '#888' }}>Faça login para acessar a biblioteca completa de {allHooks.length} hooks e {allPromptItems.length} prompts.</p>
                <button
                  type="button"
                  onClick={function() { setLoginModalOpen(true); }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #000000 100%)', color: '#fff' }}>
                  <i data-lucide="log-in" className="h-4 w-4" />
                  Entrar na plataforma
                </button>
              </div>
            ) : visibleItems.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map(function(item) {
                  if (contentType === "skills") {
                    return <SkillCard key={"skill-" + item.id} item={item} saved={skillFavoriteIds.indexOf(item.id) !== -1} onToggleSave={function() { toggleSkillFavorite(item); }} />;
                  }
                  if (contentType === "prompts") {
                    return <PromptCard key={"prompt-" + item.id} item={item} saved={promptFavoriteIds.indexOf(item.id) !== -1} onToggleSave={function() { togglePromptFavorite(item); }} onOpen={function() { handleOpenItem(Object.assign({ type: "prompt" }, item)); }} />;
                  }
                  return (
                    <HookCard
                      key={"hook-" + item.id}
                      item={item}
                      saved={favoriteIds.indexOf(item.id) !== -1}
                      onOpen={function() { handleOpenItem(Object.assign({ type: "hook" }, item)); }}
                      onCopy={function() { markRecent(Object.assign({ type: "hook" }, item)); }}
                      onToggleSave={function() { toggleFavorite(item); }} />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg px-5 py-10 text-center" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-lg font-bold" style={{ color: '#fff' }}>Nenhum item encontrado.</p>
                <p className="mt-2 text-sm" style={{ color: '#888' }}>Ajuste a busca ou remova um filtro para ampliar os resultados.</p>
              </div>
            )}

            {activeItems.length > visibleItems.length ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={function() { setVisibleCount(visibleCount + 36); }}
                  className="rounded-md px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }}>
                  Mostrar mais
                </button>
              </div>
            ) : null}
          </section>
        </main>
        <Footer />
        <DetailModal item={selected} onClose={function() { setSelected(null); }} />
        {loginModalOpen ? <LoginModal onClose={function() { setLoginModalOpen(false); }} /> : null}
        {resetModalOpen ? <ResetPasswordModal onDone={function() { setResetModalOpen(false); window.location.replace(window.location.pathname); }} /> : null}
      </div>
    </LangContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
