// ── Premium Access + Library Overview Panel ─────────────────────────────
var LangContext = window.LangContext;

var PROMPT_GROUP_ICONS = {
  "Copywriting": "pen-tool",
  "SEO & Content": "search",
  "Sales & E-commerce": "shopping-cart",
  "Social Media": "smartphone",
};

function AccessHighlightCard(props) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-stone-900/10 bg-white/55 p-4 transition-all duration-300 hover:border-stone-900/20 hover:bg-white/75">
      <div className={"absolute inset-x-0 top-0 h-px bg-gradient-to-r " + props.glowClass} />
      <div className={"inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-900/10 bg-gradient-to-br " + props.iconBgClass}>
        <i data-lucide={props.icon} className="h-4 w-4 text-stone-900" />
      </div>
      <p className="mt-4 text-sm font-semibold text-stone-900">{props.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{props.desc}</p>
    </article>
  );
}

function AccessStatusRow(props) {
  return (
    <div className="rounded-[22px] border border-stone-900/10 bg-white/60 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className={"mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-stone-900/10 bg-gradient-to-br " + props.iconBgClass}>
          <i data-lucide={props.icon} className="h-4 w-4 text-stone-900" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{props.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-stone-600">{props.desc}</p>
        </div>
      </div>
    </div>
  );
}

function PromptShortcutCard(props) {
  var enabled = props.enabled;
  var active = props.active;
  return (
    <button
      onClick={function() { if (enabled) props.onClick(); }}
      disabled={!enabled}
      className={
        "rounded-2xl border p-4 text-left transition-all " +
        (enabled
          ? active
            ? "border-stone-900/10 bg-[var(--accent)] shadow-[0_18px_35px_rgba(28,25,23,0.08)]"
            : "border-stone-900/10 bg-white/70 hover:border-stone-900/20 hover:bg-white/90"
          : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 opacity-65")
      }>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-900/10 bg-white/70 text-stone-900">
          <i data-lucide={enabled ? props.icon : "lock"} className="h-4 w-4" />
        </div>
        <span className="rounded-full bg-stone-900/6 px-2 py-1 text-[11px] text-stone-500">{props.count}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-stone-900">{props.label}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-500">
        {enabled ? props.openLabel : props.lockedLabel}
      </p>
    </button>
  );
}

window.AccessPanel = function AccessPanel(props) {
  var authMode = props.authMode || "default";
  var emailInput = props.emailInput;
  var onEmailInputChange = props.onEmailInputChange;
  var passwordInput = props.passwordInput;
  var onPasswordInputChange = props.onPasswordInputChange;
  var confirmPasswordInput = props.confirmPasswordInput;
  var onConfirmPasswordInputChange = props.onConfirmPasswordInputChange;
  var onSignIn = props.onSignIn;
  var onCreateAccount = props.onCreateAccount;
  var onRecoverPassword = props.onRecoverPassword;
  var onUpdatePassword = props.onUpdatePassword;
  var authLoading = props.authLoading;
  var authAction = props.authAction || "idle";
  var authMessage = props.authMessage;
  var sessionEmail = props.sessionEmail;
  var hasAccess = props.hasAccess;
  var onRefreshAccess = props.onRefreshAccess;
  var onSignOut = props.onSignOut;
  var promptGroups = props.promptGroups || [];
  var hookGroups = props.hookGroups || [];
  var activePromptSubcategory = props.activePromptSubcategory;
  var activeHookCategory = props.activeHookCategory;
  var onSelectPromptSubcategory = props.onSelectPromptSubcategory;
  var onSelectHookCategory = props.onSelectHookCategory;
  var promptAccessEnabled = Boolean(props.promptAccessEnabled);
  var hookAccessEnabled = Boolean(props.hookAccessEnabled);
  var packageNames = props.packageNames || [];
  var hasFallbackAccess = Boolean(props.hasFallbackAccess);
  var packageDefinitions = props.packageDefinitions || [];
  var tr = React.useContext(LangContext).tr;

  var isPasswordRecovery = authMode === "update-password";
  var hasSession = Boolean(sessionEmail);
  var statusBadgeClass = hasAccess
    ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
    : hasSession || isPasswordRecovery
      ? "border-stone-900/10 bg-stone-900 text-white"
      : "border-stone-900/10 bg-white/70 text-stone-700";
  var messageFrameClass = hasAccess
    ? "border-stone-900/10 bg-white/80 text-stone-700"
    : isPasswordRecovery
      ? "border-stone-900/10 bg-stone-900 text-white"
      : hasSession
        ? "border-stone-900/10 bg-white/75 text-stone-700"
        : "border-stone-900/10 bg-white/70 text-stone-700";

  var formTitle = isPasswordRecovery ? tr.accessRecoveryTitle : tr.accessFormTitle;
  var formSupportText = isPasswordRecovery ? tr.setPasswordPrompt : tr.hotmartEmailHint;
  var statusHeadline = hasAccess ? tr.activeAccess : (isPasswordRecovery ? tr.accessRecoveryTitle : tr.accessRequired);
  var statusSummary = hasAccess
    ? (hasFallbackAccess ? tr.accessFallbackVerified : tr.accessVerified)
    : hasSession
      ? tr.rememberSessionHint
      : tr.enterCredentialsMsg;

  var signInLabel = authLoading && authAction === "sign-in" ? tr.signingIn : tr.signIn;
  var createAccountLabel = authLoading && authAction === "create-account" ? tr.creatingAccount : tr.createAccount;
  var recoverPasswordLabel = authLoading && authAction === "recover-password" ? tr.sendingRecovery : tr.recoverPassword;
  var updatePasswordLabel = authLoading && authAction === "update-password" ? tr.updatingPassword : tr.updatePassword;
  var refreshAccessLabel = authLoading && (authAction === "refresh-access" || authAction === "check-session") ? tr.checking : tr.refreshAccess;

  var infoCards = [
    {
      icon: "mail",
      title: tr.accessHighlightsEmailTitle,
      desc: tr.accessHighlightsEmailDesc,
      glowClass: "from-stone-900/25 via-stone-900/6 to-transparent",
      iconBgClass: "from-[#ccff00]/55 via-white/60 to-transparent",
    },
    {
      icon: "shield",
      title: tr.accessHighlightsSessionTitle,
      desc: tr.accessHighlightsSessionDesc,
      glowClass: "from-stone-900/20 via-stone-900/6 to-transparent",
      iconBgClass: "from-stone-300/45 via-white/60 to-transparent",
    },
    {
      icon: "sparkles",
      title: tr.accessHighlightsUnlockTitle,
      desc: tr.accessHighlightsUnlockDesc,
      glowClass: "from-[#ccff00]/65 via-[#ccff00]/10 to-transparent",
      iconBgClass: "from-[#ccff00]/50 via-white/60 to-transparent",
    },
  ];

  return (
    <section id="acesso" className="relative z-10 border-b border-[var(--border-strong)] px-4 py-10 md:px-6">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] border border-stone-900/10 bg-gradient-to-br from-white/78 via-white/48 to-stone-200/78 p-[1px] shadow-[0_28px_90px_rgba(28,25,23,0.08)]">
        <div className="pointer-events-none absolute -right-16 top-[-120px] h-72 w-72 rounded-full bg-white/70 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-80px] h-72 w-72 rounded-full bg-[#ccff00]/20 blur-3xl" />
        <div className="relative rounded-[35px] bg-[#f2f1eb]/88 px-5 py-6 md:px-7 md:py-7">
          <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
            <div className="space-y-6">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-stone-600">
                  <i data-lucide="shield" className="h-3.5 w-3.5 text-stone-900" />
                  {tr.accessPremiumBadge}
                </span>
                <h2 className="mt-4 font-display text-3xl leading-[0.95] tracking-[-0.06em] text-stone-900 md:text-[44px]">
                  {tr.accessPanelTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
                  {tr.accessPanelSubtitle}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {infoCards.map(function(card) {
                  return (
                    <AccessHighlightCard
                      key={card.title}
                      icon={card.icon}
                      title={card.title}
                      desc={card.desc}
                      glowClass={card.glowClass}
                      iconBgClass={card.iconBgClass}
                    />
                  );
                })}
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-stone-900/10 bg-white/62 p-5 md:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_38%)]" />
                <div className="relative">
                  <div className="mb-5 flex flex-col gap-4 border-b border-stone-900/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-stone-400">{formTitle}</p>
                      <p className="mt-3 text-base font-semibold text-stone-900">
                        {sessionEmail ? tr.connectedAs(sessionEmail) : tr.signInWithEmail}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                        {formSupportText}
                      </p>
                    </div>
                    <span className={"inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold " + statusBadgeClass}>
                      {statusHeadline}
                    </span>
                  </div>

                  {!hasSession || isPasswordRecovery ? (
                    <div className="space-y-4">
                      {!isPasswordRecovery ? (
                        <>
                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-[22px] border border-stone-900/10 bg-white/80 px-4 py-3">
                              <div className="mb-2 inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-stone-400">
                                <i data-lucide="mail" className="h-3.5 w-3.5 text-stone-600" />
                                {tr.accessHighlightsEmailTitle}
                              </div>
                              <input
                                type="email"
                                value={emailInput}
                                onChange={function(e) { onEmailInputChange(e.target.value); }}
                                placeholder={tr.emailPlaceholder}
                                className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                            </div>

                            <div className="rounded-[22px] border border-stone-900/10 bg-white/80 px-4 py-3">
                              <div className="mb-2 inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-stone-400">
                                <i data-lucide="lock" className="h-3.5 w-3.5 text-stone-600" />
                                {tr.accessHighlightsSessionTitle}
                              </div>
                              <input
                                type="password"
                                value={passwordInput}
                                onChange={function(e) { onPasswordInputChange(e.target.value); }}
                                placeholder={tr.passwordPlaceholder}
                                className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={onSignIn}
                              disabled={authLoading}
                              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60">
                              {signInLabel}
                            </button>
                            <button
                              onClick={onCreateAccount}
                              disabled={authLoading}
                              className="rounded-full border border-stone-900/10 bg-white/75 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-stone-900 transition-all hover:border-stone-900/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                              {createAccountLabel}
                            </button>
                            <button
                              onClick={onRecoverPassword}
                              disabled={authLoading}
                              className="rounded-full border border-stone-900/10 bg-transparent px-5 py-2.5 text-sm uppercase tracking-[0.16em] text-stone-600 transition-all hover:border-stone-900/20 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60">
                              {recoverPasswordLabel}
                            </button>
                          </div>
                        </>
                      ) : null}

                      {isPasswordRecovery ? (
                        <>
                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-[22px] border border-stone-900/10 bg-white/80 px-4 py-3">
                              <div className="mb-2 inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-stone-400">
                                <i data-lucide="lock" className="h-3.5 w-3.5 text-stone-600" />
                                {tr.passwordPlaceholder}
                              </div>
                              <input
                                type="password"
                                value={passwordInput}
                                onChange={function(e) { onPasswordInputChange(e.target.value); }}
                                placeholder={tr.passwordPlaceholder}
                                className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                            </div>

                            <div className="rounded-[22px] border border-stone-900/10 bg-white/80 px-4 py-3">
                              <div className="mb-2 inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-stone-400">
                                <i data-lucide="shield" className="h-3.5 w-3.5 text-stone-600" />
                                {tr.confirmPasswordPlaceholder}
                              </div>
                              <input
                                type="password"
                                value={confirmPasswordInput}
                                onChange={function(e) { onConfirmPasswordInputChange(e.target.value); }}
                                placeholder={tr.confirmPasswordPlaceholder}
                                className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none" />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={onUpdatePassword}
                              disabled={authLoading}
                              className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60">
                              {updatePasswordLabel}
                            </button>
                            <button
                              onClick={onSignOut}
                              className="rounded-full border border-stone-900/10 bg-white/72 px-5 py-2.5 text-sm font-medium uppercase tracking-[0.16em] text-stone-700 transition-all hover:bg-white">
                              {tr.signOut}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={onRefreshAccess}
                        disabled={authLoading}
                        className="rounded-full border border-stone-900/10 bg-white/75 px-5 py-2.5 text-sm font-medium uppercase tracking-[0.16em] text-stone-900 transition-all hover:border-stone-900/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                        {refreshAccessLabel}
                      </button>
                      <button
                        onClick={onSignOut}
                        className="rounded-full border border-stone-900/10 bg-white/72 px-5 py-2.5 text-sm font-medium uppercase tracking-[0.16em] text-stone-700 transition-all hover:bg-white">
                        {tr.signOut}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[30px] border border-stone-900/10 bg-white/58 p-5">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-stone-400">{tr.accessStatusTitle}</p>
                <div className={"mt-4 rounded-[24px] border px-4 py-4 " + messageFrameClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-stone-500">
                        {hasSession ? tr.connectedAs(sessionEmail) : tr.signInWithEmail}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-stone-900">{statusHeadline}</p>
                      <p className="mt-2 text-sm leading-relaxed opacity-80">
                        {authMessage || statusSummary}
                      </p>
                    </div>
                    <span className={"inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold " + statusBadgeClass}>
                      {hasAccess ? tr.activeAccess : tr.accessRequired}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.18em] text-stone-400">
                    {hasAccess ? tr.packageUnlockedTitle : tr.packageLockedTitle}
                  </p>
                  {hasAccess ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {packageNames.map(function(name) {
                        return (
                          <span key={name} className="rounded-full border border-stone-900/10 bg-[var(--accent)] px-3 py-1 text-xs text-stone-900">
                            {name}
                          </span>
                        );
                      })}
                      {hasFallbackAccess ? (
                        <span className="rounded-full border border-stone-900/10 bg-stone-900 px-3 py-1 text-xs text-white">
                          {tr.packageFallbackTag}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {packageDefinitions.map(function(definition) {
                        return (
                          <a
                            key={definition.key}
                            href={definition.checkoutUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={
                              "inline-flex rounded-full border px-4 py-2 text-sm transition-all " +
                              (definition.checkoutUrl && definition.checkoutUrl !== "#"
                                ? "border-stone-900/10 bg-white/76 text-stone-900 hover:border-stone-900/20 hover:bg-white"
                                : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 text-stone-400")
                            }>
                            {definition.checkoutUrl && definition.checkoutUrl !== "#" ? definition.buttonLabel : tr.checkoutPending}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <AccessStatusRow
                    icon="mail"
                    title={tr.accessHighlightsEmailTitle}
                    desc={tr.hotmartEmailHint}
                    iconBgClass="from-[#ccff00]/50 via-white/60 to-transparent"
                  />
                  <AccessStatusRow
                    icon="shield"
                    title={tr.accessHighlightsSessionTitle}
                    desc={tr.rememberSessionHint}
                    iconBgClass="from-stone-300/45 via-white/60 to-transparent"
                  />
                  <AccessStatusRow
                    icon="sparkles"
                    title={tr.accessHighlightsUnlockTitle}
                    desc={tr.accessPremiumHint}
                    iconBgClass="from-[#ccff00]/45 via-white/60 to-transparent"
                  />
                </div>
              </div>

              <div id="biblioteca" className="rounded-[30px] border border-stone-900/10 bg-white/58 p-5">
                <div>
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-stone-400">{tr.accessWorkspaceTitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{tr.accessWorkspaceDesc}</p>
                </div>

                <div className="mt-5 grid gap-4">
                  <article className="rounded-[24px] border border-stone-900/10 bg-white/72 p-4">
                    <div className="mb-4">
                      <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-stone-400">{tr.promptSubcategoriesTitle}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{tr.promptSubcategoriesDesc}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {promptGroups.map(function(group) {
                        return (
                          <PromptShortcutCard
                            key={group.id}
                            enabled={promptAccessEnabled}
                            active={activePromptSubcategory === group.id}
                            count={group.count}
                            label={group.label}
                            icon={PROMPT_GROUP_ICONS[group.rawId] || "sparkles"}
                            openLabel={tr.openPromptGroup}
                            lockedLabel={tr.lockedPromptGroup}
                            onClick={function() { onSelectPromptSubcategory(group.id); }}
                          />
                        );
                      })}
                    </div>
                    <button
                      onClick={function() { if (promptAccessEnabled) onSelectPromptSubcategory("All"); }}
                      disabled={!promptAccessEnabled}
                      className={
                        "mt-4 inline-flex items-center rounded-full border px-4 py-2 text-sm transition-all " +
                        (promptAccessEnabled
                          ? activePromptSubcategory === "All"
                            ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
                            : "border-stone-900/10 bg-white/78 text-stone-700 hover:text-stone-900"
                          : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 text-stone-400")
                      }>
                      {tr.openAllPrompts}
                    </button>
                  </article>

                  <article className="rounded-[24px] border border-stone-900/10 bg-white/72 p-4">
                    <div className="mb-4">
                      <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-stone-400">{tr.hookSubcategoriesTitle}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{tr.hookSubcategoriesDesc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={function() { if (hookAccessEnabled) onSelectHookCategory("all"); }}
                        disabled={!hookAccessEnabled}
                        className={
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all " +
                          (hookAccessEnabled
                            ? activeHookCategory === "all"
                              ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
                              : "border-stone-900/10 bg-white/78 text-stone-700 hover:text-stone-900"
                            : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 text-stone-400")
                        }>
                        <span>{hookAccessEnabled ? tr.openAllHooks : tr.lockedHookGroup}</span>
                        <span className="rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">
                          {hookGroups.reduce(function(sum, group) { return sum + group.count; }, 0)}
                        </span>
                      </button>
                      {hookGroups.map(function(group) {
                        var active = activeHookCategory === group.id;
                        return (
                          <button
                            key={group.id}
                            onClick={function() { if (hookAccessEnabled) onSelectHookCategory(group.id); }}
                            disabled={!hookAccessEnabled}
                            className={
                              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all " +
                              (hookAccessEnabled
                                ? active
                                  ? "border-stone-900/10 bg-[var(--accent)] text-stone-900"
                                  : "border-stone-900/10 bg-white/78 text-stone-700 hover:text-stone-900"
                                : "cursor-not-allowed border-stone-900/5 bg-stone-200/50 text-stone-400")
                            }>
                            <span>{hookAccessEnabled ? group.icon : "🔒"}</span>
                            <span>{group.label}</span>
                            <span className="rounded-full bg-stone-900/6 px-2 py-0.5 text-[11px] text-stone-500">{group.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};
