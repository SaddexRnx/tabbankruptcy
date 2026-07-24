import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Landmark, History, Sun, Moon, Search, Download, Upload, Settings,
  Keyboard, RotateCcw, Trash2, Undo2, X, ExternalLink,
  Archive, Ghost, Zap, AlertTriangle, Lock, PanelRight, Activity as ActivityIcon,
} from "lucide-react";
import Dashboard from "./components/Dashboard.jsx";
import BankruptcyButton from "./components/BankruptcyButton.jsx";
import SessionList from "./components/SessionList.jsx";
import { LANGUAGES, t } from "./i18n.js";
import {
  STORAGE_KEY, SETTINGS_KEY, ACTIVITY_KEY, DEFAULT_SETTINGS,
  isExtension, getItem, setItem, queryTabs, queryAllTabs, buildName,
  shouldIncludeTab, upgradeSession, pushRevision, CURRENT_SESSION_VERSION,
  hashPin, logActivity,
} from "./storage.js";

const UNDO_WINDOW_MS = 12000;

export default function App() {
  const [tabCount, setTabCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);
  const [langMenu, setLangMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [undoState, setUndoState] = useState(null);
  const [, setUndoTick] = useState(0);
  const [locked, setLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [activity, setActivity] = useState([]);
  const fileRef = useRef(null);
  const toastTimerRef = useRef(null);
  const undoTimerRef = useRef(null);

  const lang = settings.language || "en";
  const tt = useCallback((k, v) => t(lang, k, v), [lang]);

  const refresh = useCallback(async () => {
    const [tabs, savedRaw, s, act] = await Promise.all([
      queryTabs(), getItem(STORAGE_KEY, []), getItem(SETTINGS_KEY, {}), getItem(ACTIVITY_KEY, []),
    ]);
    const merged = { ...DEFAULT_SETTINGS, ...s };
    setSettings(merged);
    const saved = savedRaw.map(upgradeSession);
    const eligible = tabs.filter((tb) => shouldIncludeTab(tb, merged));
    setTabCount(eligible.length);
    setSessions(saved.sort((a, b) => b.createdAt - a.createdAt));
    setActivity(Array.isArray(act) ? act : []);
    // PIN gate: lock unless this popup session already unlocked
    const unlocked = sessionStorage.getItem("tb_unlocked") === "1";
    setLocked(!!merged.pinEnabled && !unlocked);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const tryUnlock = async () => {
    if (!settings.pinSalt || !settings.pinHash) { setLocked(false); return; }
    const { hash } = await hashPin(pinInput, settings.pinSalt);
    if (hash === settings.pinHash) {
      sessionStorage.setItem("tb_unlocked", "1");
      setLocked(false); setPinInput(""); setPinErr(false);
    } else { setPinErr(true); setPinInput(""); }
  };

  const openSidePanel = async () => {
    if (!isExtension) return;
    try {
      if (chrome.sidePanel?.open) {
        const win = await new Promise((r) => chrome.windows.getCurrent((w) => r(w)));
        await chrome.sidePanel.open({ windowId: win.id });
        window.close();
      } else if (chrome.sidebarAction?.open) {
        chrome.sidebarAction.open();
      } else {
        flash("Side panel not available in this browser.");
      }
    } catch (e) { flash("Couldn't open side panel."); }
  };

  useEffect(() => {
    const apply = () => {
      const mode = settings.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        : settings.theme;
      document.documentElement.classList.toggle("dark", mode === "dark");
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [settings.theme, lang]);

  useEffect(() => {
    if (!undoState) return;
    const iv = setInterval(() => setUndoTick((n) => n + 1), 500);
    return () => clearInterval(iv);
  }, [undoState]);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  };
  const armUndo = (state) => {
    clearTimeout(undoTimerRef.current);
    setUndoState({ ...state, expiresAt: Date.now() + UNDO_WINDOW_MS });
    undoTimerRef.current = setTimeout(() => setUndoState(null), UNDO_WINDOW_MS);
  };
  const dismissUndo = () => { clearTimeout(undoTimerRef.current); setUndoState(null); };

  const persistSessions = async (next) => {
    await setItem(STORAGE_KEY, next);
    setSessions(next);
  };

  const declareBankruptcy = async (sessionName) => {
    const tabs = await queryTabs();
    const savable = tabs.filter((tb) => shouldIncludeTab(tb, settings));
    if (savable.length === 0) { flash(tt("noTabs")); return; }
    const session = {
      id: crypto.randomUUID(),
      name: sessionName?.trim() || buildName(settings),
      createdAt: Date.now(), updatedAt: Date.now(),
      version: CURRENT_SESSION_VERSION,
      notes: "", tags: [], revisions: [],
      tabs: savable.map((tb) => ({ url: tb.url, title: tb.title || tb.url, favIconUrl: tb.favIconUrl || "" })),
    };
    await persistSessions([session, ...sessions]);
    await logActivity("declare", { name: session.name, tabs: savable.length });
    refresh();
    if (isExtension) {
      chrome.tabs.create({ url: "about:blank" }, (freshTab) => {
        const toClose = tabs.filter((tb) => tb.id !== freshTab.id && !(settings.ignorePinned && tb.pinned)).map((tb) => tb.id);
        if (toClose.length) chrome.tabs.remove(toClose);
      });
    } else flash(`Saved ${savable.length} tabs (preview mode).`);
    armUndo({ kind: "declare", sessionId: session.id, label: tt("undoDeclare", { n: savable.length }) });
  };

  const filterDedup = async (urls) => {
    if (!settings.dedupOnRestore) return urls;
    const cur = await queryAllTabs();
    const open = new Set(cur.map((tb) => tb.url));
    return urls.filter((u) => !open.has(u));
  };

  const restoreSession = async (session, forceNewWindow = false) => {
    if (!isExtension) { flash("Restore only works inside the extension."); return; }
    const urls = await filterDedup(session.tabs.map((tb) => tb.url));
    if (!urls.length) { flash(tt("nothingToRestore")); return; }
    await logActivity("restore", { name: session.name, tabs: urls.length });
    refresh();
    const useWindow = forceNewWindow || settings.restoreInNewWindow;
    if (useWindow && chrome.windows?.create) {
      chrome.windows.create({ url: urls }, (win) => {
        const ids = (win?.tabs || []).map((tb) => tb.id).filter(Boolean);
        armUndo({ kind: "restore", createdIds: ids, windowId: win?.id, label: tt("undoRestore", { n: urls.length }) });
      });
    } else {
      const createdIds = [];
      let pending = urls.length;
      urls.forEach((u) => {
        chrome.tabs.create({ url: u, active: false }, (c) => {
          if (c?.id) createdIds.push(c.id);
          if (--pending === 0)
            armUndo({ kind: "restore", createdIds, label: tt("undoRestore", { n: createdIds.length }) });
        });
      });
    }
  };

  const restoreRevision = async (sessionId, revision) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    // Snapshot current state onto revision stack, then swap in revision tabs/name/notes/tags.
    const withSnap = pushRevision(session, "restored-revision");
    const restored = {
      ...withSnap,
      name: revision.name || session.name,
      notes: revision.notes || "",
      tags: [...(revision.tags || [])],
      tabs: revision.tabs.map((tb) => ({ ...tb })),
      updatedAt: Date.now(),
    };
    await persistSessions(sessions.map((s) => (s.id === sessionId ? restored : s)));
    flash(tt("revisionRestored"));
  };

  const deleteSession = async (id) => {
    const target = sessions.find((s) => s.id === id);
    const next = sessions.filter((s) => s.id !== id);
    await persistSessions(next);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    if (target) { await logActivity("delete", { name: target.name }); refresh(); }
    if (target) armUndo({ kind: "delete", sessions: [target], label: tt("undoDelete", { n: 1 }) });
    else flash(tt("sessionDeleted"));
  };

  const updateSession = async (id, patch) => {
    const next = sessions.map((s) => {
      if (s.id !== id) return s;
      const withRev = pushRevision(s, "edit");
      return { ...withRev, ...patch, updatedAt: Date.now() };
    });
    await persistSessions(next);
  };

  const toggleSelect = (id) => setSelectedIds((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const clearSelection = () => setSelectedIds(new Set());
  const selectAllVisible = (visible) => setSelectedIds(new Set(visible.map((s) => s.id)));

  const bulkDelete = async () => {
    const ids = new Set(selectedIds);
    const removed = sessions.filter((s) => ids.has(s.id));
    await persistSessions(sessions.filter((s) => !ids.has(s.id)));
    clearSelection();
    armUndo({ kind: "delete", sessions: removed, label: tt("undoDelete", { n: removed.length }) });
  };
  const bulkRestore = async (forceNewWindow = false) => {
    if (!isExtension) { flash("Restore only works inside the extension."); return; }
    const toRestore = sessions.filter((s) => selectedIds.has(s.id));
    if (!toRestore.length) return;
    const urls = await filterDedup(toRestore.flatMap((s) => s.tabs.map((tb) => tb.url)));
    if (!urls.length) { flash(tt("nothingToRestore")); return; }
    const useWindow = forceNewWindow || settings.restoreInNewWindow;
    if (useWindow && chrome.windows?.create) {
      chrome.windows.create({ url: urls }, (win) => {
        const ids = (win?.tabs || []).map((tb) => tb.id).filter(Boolean);
        armUndo({ kind: "restore", createdIds: ids, windowId: win?.id, label: tt("undoRestore", { n: urls.length }) });
      });
    } else {
      const createdIds = [];
      let pending = urls.length;
      urls.forEach((u) => {
        chrome.tabs.create({ url: u, active: false }, (c) => {
          if (c?.id) createdIds.push(c.id);
          if (--pending === 0) armUndo({ kind: "restore", createdIds, label: tt("undoRestore", { n: createdIds.length }) });
        });
      });
    }
    clearSelection();
  };

  const performUndo = async () => {
    if (!undoState) return;
    if (undoState.kind === "declare") {
      const session = sessions.find((s) => s.id === undoState.sessionId);
      await persistSessions(sessions.filter((s) => s.id !== undoState.sessionId));
      if (isExtension && session) session.tabs.forEach((tb) => chrome.tabs.create({ url: tb.url, active: false }));
    } else if (undoState.kind === "restore") {
      if (isExtension) {
        if (undoState.windowId && chrome.windows?.remove) chrome.windows.remove(undoState.windowId);
        else if (undoState.createdIds?.length) chrome.tabs.remove(undoState.createdIds);
      }
    } else if (undoState.kind === "delete") {
      const merged = [...(undoState.sessions || []), ...sessions].sort((a, b) => b.createdAt - a.createdAt);
      await persistSessions(merged);
    } else if (undoState.kind === "nuke") {
      // Reopen archived ghost tabs and remove the auto-created Ghosts session
      if (isExtension && undoState.tabs?.length) {
        undoState.tabs.forEach((tb) => chrome.tabs.create({ url: tb.url, active: false }));
      }
      if (undoState.sessionId) {
        await persistSessions(sessions.filter((s) => s.id !== undoState.sessionId));
      }
    }
    flash(tt("undone")); dismissUndo();
  };


  // Export / Import with versioning
  const exportSessions = () => {
    const payload = { app: "TabBankruptcy", version: 1, exportedAt: new Date().toISOString(), sessions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tabbankruptcy-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    flash(tt("exported", { n: sessions.length }));
  };

  const importSessions = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = Array.isArray(data) ? data : data.sessions;
      if (!Array.isArray(incoming)) throw new Error("bad shape");
      const cleaned = incoming.filter((s) => s && Array.isArray(s.tabs)).map(upgradeSession);
      const byId = new Map(sessions.map((s) => [s.id, s]));
      let merged = [...sessions];
      let added = 0, revised = 0;
      for (const inc of cleaned) {
        const existing = byId.get(inc.id);
        if (!existing) { merged.unshift(inc); added += 1; continue; }
        // Same id → snapshot current state onto revisions and adopt incoming
        const withSnap = pushRevision(existing, "import-overwrite");
        const combinedRevs = [...withSnap.revisions, ...(inc.revisions || [])].slice(0, 20);
        const replaced = { ...inc, revisions: combinedRevs, updatedAt: Date.now() };
        merged = merged.map((s) => (s.id === existing.id ? replaced : s));
        revised += 1;
      }
      merged.sort((a, b) => b.createdAt - a.createdAt);
      await persistSessions(merged);
      flash(tt("importedVersioned", { added, revised }));
    } catch { flash(tt("importFailed")); }
  };

  // Cloud
  const sendMsg = (msg) => new Promise((resolve) => {
    if (!isExtension) return resolve({ ok: false });
    try { chrome.runtime.sendMessage(msg, (r) => resolve(r || { ok: false })); }
    catch { resolve({ ok: false }); }
  });
  const cloudPush = async () => {
    const r = await sendMsg({ type: "CLOUD_PUSH" });
    flash(r?.ok ? tt("cloudPushed", { n: r.count ?? sessions.length }) : (r?.error || tt("cloudFailed")));
  };
  const cloudPull = async () => {
    const r = await sendMsg({ type: "CLOUD_PULL" });
    if (!r?.sessions) { flash(r?.error || tt("cloudFailed")); return; }
    const incoming = r.sessions.map(upgradeSession);
    // Merge: import-style with revisioning
    const byId = new Map(sessions.map((s) => [s.id, s]));
    let merged = [...sessions];
    for (const inc of incoming) {
      const existing = byId.get(inc.id);
      if (!existing) { merged.unshift(inc); continue; }
      const withSnap = pushRevision(existing, "cloud-pull");
      const combinedRevs = [...withSnap.revisions, ...(inc.revisions || [])].slice(0, 20);
      merged = merged.map((s) => (s.id === existing.id ? { ...inc, revisions: combinedRevs } : s));
    }
    merged.sort((a, b) => b.createdAt - a.createdAt);
    await persistSessions(merged);
    flash(tt("cloudPulled", { n: incoming.length }));
  };

  const allTags = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => (s.tags || []).forEach((tg) => set.add(tg)));
    return [...set].sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now(); const day = 86400000;
    return sessions.filter((s) => {
      if (filter === "today" && now - s.createdAt > day) return false;
      if (filter === "week" && now - s.createdAt > 7 * day) return false;
      if (tagFilter && !(s.tags || []).includes(tagFilter)) return false;
      if (!q) return true;
      if (s.name.toLowerCase().includes(q)) return true;
      if ((s.notes || "").toLowerCase().includes(q)) return true;
      if ((s.tags || []).some((tg) => tg.toLowerCase().includes(q))) return true;
      return s.tabs.some((tb) => (tb.title || "").toLowerCase().includes(q) || (tb.url || "").toLowerCase().includes(q));
    });
  }, [sessions, query, filter, tagFilter]);

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : settings.theme === "light" ? "system" : "dark";
    const merged = { ...settings, theme: next }; setSettings(merged); setItem(SETTINGS_KEY, merged);
  };
  const changeLang = (code) => {
    const merged = { ...settings, language: code }; setSettings(merged); setItem(SETTINGS_KEY, merged); setLangMenu(false);
  };
  const openOptions = () => { if (isExtension && chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); };

  const secondsLeft = undoState ? Math.max(0, Math.ceil((undoState.expiresAt - Date.now()) / 1000)) : 0;

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 relative">
      <a href="#tb-main" className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-50 focus:px-2 focus:py-1 focus:bg-neutral-900 focus:text-white dark:focus:bg-white dark:focus:text-neutral-900 focus:rounded">{tt("skipToContent")}</a>

      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center" aria-hidden="true">
            <Landmark size={16} className="text-white dark:text-neutral-900" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight truncate">TabBankruptcy</h1>
            <p className="text-[10px] text-neutral-500 -mt-0.5 truncate">{tt("tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={toggleTheme} label={`${tt("theme")}: ${settings.theme}`}>
            {settings.theme === "dark" ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
          </IconBtn>
          <IconBtn onClick={() => setLangMenu((v) => !v)} label={tt("language")} aria-haspopup="menu" aria-expanded={langMenu}>
            <span className="text-[10px] font-semibold uppercase">{lang}</span>
          </IconBtn>
          <IconBtn onClick={openOptions} label={tt("settings")}><Settings size={14} aria-hidden="true" /></IconBtn>
        </div>
      </header>

      {langMenu && (
        <div role="menu" aria-label={tt("language")}
          className="absolute right-3 top-14 z-10 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1 max-h-64 overflow-auto">
          {LANGUAGES.map((l) => (
            <button key={l.code} role="menuitemradio" aria-checked={lang === l.code} onClick={() => changeLang(l.code)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${lang === l.code ? "font-semibold" : ""}`}>
              {l.label}
            </button>
          ))}
        </div>
      )}

      <nav className="flex items-center gap-1 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800" aria-label={tt("primary")}>
        <NavBtn active={view === "home"} onClick={() => setView("home")}>{tt("home")}</NavBtn>
        <NavBtn active={view === "history"} onClick={() => setView("history")}>
          <History size={12} className="inline mr-1 -mt-0.5" aria-hidden="true" />
          {tt("history")}
          {sessions.length > 0 && (
            <span className="ml-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 text-[9px]">{sessions.length}</span>
          )}
        </NavBtn>
      </nav>

      <main id="tb-main" className="flex-1 overflow-y-auto tb-scroll" tabIndex={-1}>
        {view === "home" ? (
          <div className="p-4 space-y-4">
            <Dashboard tabCount={tabCount} sessionCount={sessions.length} t={tt} />
            <BankruptcyButton tabCount={tabCount} onDeclare={declareBankruptcy} confirmBeforeClose={settings.confirmBeforeClose} t={tt} />
            <p className="text-[11px] text-neutral-500 leading-relaxed px-1">{tt("intro")}</p>

            <AutoArchiveCard settings={settings} setSettings={setSettings} t={tt} flash={flash} />
            <GhostCheckerCard settings={settings} setSettings={setSettings} t={tt} flash={flash} refresh={refresh} armUndo={armUndo} />

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-neutral-500">
                <Keyboard size={12} aria-hidden="true" /> {tt("shortcuts")}
              </div>
              <ul className="mt-2 space-y-1 text-[11px]">
                <ShortcutRow label={tt("openDashboard")} keys="Ctrl+Shift+B" />
                <ShortcutRow label={tt("declareBankruptcy")} keys="Ctrl+Shift+X" />
                <ShortcutRow label={tt("restoreLast")} keys="Ctrl+Shift+L" />
              </ul>
            </div>
            {(settings.cloudEndpointUrl || settings.syncToStorageSync) && (
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">{tt("cloud")}</div>
                {settings.cloudEndpointUrl && (
                  <div className="flex gap-2">
                    <button onClick={cloudPush} className="flex-1 text-xs px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">{tt("pushToCloud")}</button>
                    <button onClick={cloudPull} className="flex-1 text-xs px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">{tt("pullFromCloud")}</button>
                  </div>
                )}
                {settings.syncToStorageSync && <p className="text-[10px] text-neutral-500">{tt("browserSyncOn")}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <label htmlFor="tb-search" className="sr-only">{tt("searchPlaceholder")}</label>
                <input id="tb-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tt("searchPlaceholder")}
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs outline-none focus:border-neutral-900 dark:focus:border-white focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white" />
              </div>
              <IconBtn onClick={exportSessions} label={tt("export")}><Download size={13} aria-hidden="true" /></IconBtn>
              <IconBtn onClick={() => fileRef.current?.click()} label={tt("import")}><Upload size={13} aria-hidden="true" /></IconBtn>
              <input ref={fileRef} type="file" accept="application/json" hidden
                onChange={(e) => e.target.files?.[0] && importSessions(e.target.files[0])} />
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label={tt("filter")}>
              {[["all", tt("filterAll")], ["today", tt("filterToday")], ["week", tt("filterWeek")]].map(([k, v]) => (
                <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
                  className={`px-2 py-1 rounded-md text-[11px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                    filter === k ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                                 : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}>{v}</button>
              ))}
              {allTags.length > 0 && (
                <>
                  <span className="mx-1 self-center text-neutral-300 dark:text-neutral-700" aria-hidden="true">|</span>
                  {allTags.map((tg) => (
                    <button key={tg} onClick={() => setTagFilter(tagFilter === tg ? null : tg)} aria-pressed={tagFilter === tg}
                      className={`px-2 py-1 rounded-full text-[10px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                        tagFilter === tg ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                                         : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}>#{tg}</button>
                  ))}
                </>
              )}
            </div>

            {selectedIds.size > 0 && (
              <div role="toolbar" aria-label={tt("bulkActions")}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5">
                <span className="text-[11px] font-medium">{tt("selected", { n: selectedIds.size })}</span>
                <button onClick={() => selectAllVisible(filtered)} className="text-[11px] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded">{tt("selectAll")}</button>
                <div className="flex-1" />
                <button onClick={() => bulkRestore(false)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                  <RotateCcw size={11} aria-hidden="true" /> {tt("restoreAll")}
                </button>
                <button onClick={() => bulkRestore(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                  <ExternalLink size={11} aria-hidden="true" /> {tt("restoreInWindow")}
                </button>
                <button onClick={bulkDelete}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                  <Trash2 size={11} aria-hidden="true" /> {tt("delete")}
                </button>
                <button onClick={clearSelection} aria-label={tt("clearSelection")}
                  className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            )}

            <SessionList
              sessions={filtered}
              onRestore={(s) => restoreSession(s, false)}
              onRestoreInWindow={(s) => restoreSession(s, true)}
              onDelete={deleteSession}
              onUpdate={updateSession}
              onRestoreRevision={restoreRevision}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              t={tt}
            />
          </div>
        )}
      </main>

      {undoState && (
        <div role="status" aria-live="polite"
          className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-2 shadow-xl">
          <span className="text-xs flex-1 truncate">{undoState.label}</span>
          <span className="text-[10px] opacity-60 tabular-nums" aria-hidden="true">{secondsLeft}s</span>
          <button onClick={performUndo}
            className="inline-flex items-center gap-1 text-xs font-semibold underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-neutral-900 rounded">
            <Undo2 size={12} aria-hidden="true" /> {tt("undo")}
          </button>
          <button onClick={dismissUndo} aria-label={tt("dismiss")}
            className="p-0.5 rounded hover:bg-white/10 dark:hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-neutral-900">
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      {toast && !undoState && (
        <div role="status" aria-live="polite"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs px-3 py-1.5 rounded-lg shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, label, ...rest }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className="h-7 w-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
      {...rest}>{children}</button>
  );
}
function NavBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} aria-current={active ? "page" : undefined}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
        active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
               : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
      }`}>{children}</button>
  );
}
function ShortcutRow({ label, keys }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">{keys}</kbd>
    </li>
  );
}

function AutoArchiveCard({ settings, setSettings, t, flash }) {
  const cfg = settings.autoArchive || {};
  const on = !!cfg.enabled;
  const update = async (patch) => {
    const merged = { ...settings, autoArchive: { ...cfg, ...patch } };
    setSettings(merged);
    await setItem(SETTINGS_KEY, merged);
  };
  const openPanel = () => {
    if (!isExtension) return;
    // Firefox uses sidebar_action; opening it programmatically requires browser.sidebarAction.open()
    // which needs a user gesture — the popup click qualifies.
    if (typeof browser !== "undefined" && browser.sidebarAction?.open) {
      browser.sidebarAction.open().catch(() => flash(t("firefoxSidebarHint")));
      return;
    }
    chrome.windows?.getCurrent?.((w) => {
      chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL", windowId: w?.id }, (r) => {
        if (!r?.ok) flash(t("firefoxSidebarHint"));
      });
    });
  };
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Archive size={13} className="text-neutral-500" aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-wide text-neutral-500 flex-1">{t("autoArchive")}</span>
        <button
          onClick={() => update({ enabled: !on })}
          aria-pressed={on}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
            on ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
               : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          {on ? t("on") : t("off")}
        </button>
      </div>
      <p className="text-[11px] text-neutral-500 leading-relaxed">{t("autoArchiveDesc")}</p>
      <div className="flex items-center gap-2 text-[11px]">
        <label htmlFor="tb-idle" className="text-neutral-600 dark:text-neutral-400">{t("idleMin")}</label>
        <input id="tb-idle" type="number" min={5} max={720} value={cfg.idleMinutes ?? 30}
          onChange={(e) => update({ idleMinutes: Math.max(5, Math.min(720, Number(e.target.value) || 30)) })}
          className="w-16 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[11px] outline-none focus:border-neutral-900 dark:focus:border-white" />
        <span className="text-neutral-500">{t("minutes")}</span>
        <div className="flex-1" />
        {on && (
          <button onClick={openPanel}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
            <ExternalLink size={11} aria-hidden="true" /> {t("openSidePanel")}
          </button>
        )}
      </div>
    </div>
  );
}

function GhostCheckerCard({ settings, setSettings, t, flash, refresh, armUndo }) {
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  const send = (msg) => new Promise((resolve) => {
    if (!isExtension) return resolve({ ok: false });
    try { chrome.runtime.sendMessage(msg, (r) => resolve(r || { ok: false })); }
    catch { resolve({ ok: false }); }
  });

  const scan = async () => {
    setScanning(true);
    const r = await send({ type: "GHOST_SCAN" });
    setScanning(false);
    const list = r?.items || [];
    setItems(list);
    setSelected(new Set(list.map((i) => i.id)));
  };

  const requestNuke = () => {
    if (!selected.size) return;
    if (settings.skipGhostConfirm) return doNuke();
    setDontShow(false);
    setConfirmOpen(true);
  };

  const doNuke = async () => {
    const ids = [...selected];
    setConfirmOpen(false);
    if (dontShow) {
      const merged = { ...settings, skipGhostConfirm: true };
      setSettings(merged); await setItem(SETTINGS_KEY, merged);
    }
    const r = await send({ type: "NUKE_GHOSTS", ids });
    if (r?.ok && armUndo) {
      armUndo({
        kind: "nuke",
        sessionId: r.sessionId,
        tabs: r.tabs || [],
        label: t("undoNuke", { n: r.archived ?? ids.length }),
      });
    } else {
      flash(t("ghostsNuked", { n: ids.length }));
    }
    setItems(null); setSelected(new Set());
    refresh?.();
  };


  const toggle = (id) => setSelected((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Ghost size={13} className="text-neutral-500" aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-wide text-neutral-500 flex-1">{t("ghostChecker")}</span>
      </div>
      <p className="text-[11px] text-neutral-500 leading-relaxed">{t("ghostDesc")}</p>

      {items === null ? (
        <button onClick={scan} disabled={scanning}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white disabled:opacity-50">
          <Search size={12} aria-hidden="true" /> {scanning ? t("scanning") : t("scanGhosts")}
        </button>
      ) : items.length === 0 ? (
        <>
          <p className="text-[11px] text-center text-neutral-500 py-2">{t("noGhosts")}</p>
          <button onClick={() => setItems(null)}
            className="w-full text-[11px] px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            {t("scanGhosts")}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium">{t("ghostsFound", { n: items.length })}</span>
            <button onClick={() => setItems(null)} className="text-[11px] text-neutral-500 hover:underline">
              {t("cancel")}
            </button>
          </div>
          <ul className="max-h-40 overflow-y-auto tb-scroll space-y-1 border border-neutral-200 dark:border-neutral-800 rounded-md p-1.5">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-1.5 text-[11px]">
                <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggle(i.id)}
                  aria-label={`Select ${i.title}`}
                  className="h-3 w-3 accent-neutral-900 dark:accent-white" />
                {i.favIconUrl ? (
                  <img src={i.favIconUrl} alt="" className="w-3 h-3 rounded-sm flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                ) : <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />}
                <span className="flex-1 truncate" title={i.title}>{i.title}</span>
                <span className="text-[9px] text-neutral-500 flex gap-0.5">
                  {i.reasons.map((r) => (
                    <span key={r} className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-1">
                      {t(`reason_${r}`)}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={requestNuke} disabled={!selected.size}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
            <Zap size={12} aria-hidden="true" /> {t("nukeGhosts")} ({selected.size})
          </button>
        </>
      )}

      {confirmOpen && (
        <div className="absolute inset-0 z-20 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true" aria-labelledby="tb-nuke-title">
          <div className="w-full rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center" aria-hidden="true">
                <AlertTriangle size={16} className="text-white dark:text-neutral-900" />
              </div>
              <h3 id="tb-nuke-title" className="text-sm font-semibold">{t("confirmNukeTitle")}</h3>
            </div>
            <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-relaxed">{t("confirmNukeBody")}</p>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)}
                className="h-3 w-3 accent-neutral-900 dark:accent-white" />
              {t("neverShowAgain")}
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setConfirmOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                {t("cancel")}
              </button>
              <button onClick={doNuke} autoFocus
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                <Zap size={11} aria-hidden="true" /> {t("proceed")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
