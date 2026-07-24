import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Landmark,
  History,
  Sun,
  Moon,
  Search,
  Download,
  Upload,
  Settings,
  Keyboard,
  RotateCcw,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import Dashboard from "./components/Dashboard.jsx";
import BankruptcyButton from "./components/BankruptcyButton.jsx";
import SessionList from "./components/SessionList.jsx";
import { LANGUAGES, t } from "./i18n.js";
import {
  STORAGE_KEY,
  SETTINGS_KEY,
  DEFAULT_SETTINGS,
  isExtension,
  getItem,
  setItem,
  queryTabs,
  buildName,
  shouldIncludeTab,
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
  const [undoState, setUndoState] = useState(null); // { kind, label, expiresAt, ... }
  const [undoTick, setUndoTick] = useState(0);
  const fileRef = useRef(null);
  const toastTimerRef = useRef(null);
  const undoTimerRef = useRef(null);

  const lang = settings.language || "en";
  const tt = useCallback((k, v) => t(lang, k, v), [lang]);

  const refresh = useCallback(async () => {
    const [tabs, saved, s] = await Promise.all([
      queryTabs(),
      getItem(STORAGE_KEY, []),
      getItem(SETTINGS_KEY, {}),
    ]);
    const merged = { ...DEFAULT_SETTINGS, ...s };
    setSettings(merged);
    const eligible = tabs.filter((tab) => shouldIncludeTab(tab, merged));
    setTabCount(eligible.length);
    setSessions(saved.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const apply = () => {
      const mode =
        settings.theme === "system"
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

  // Countdown re-render for undo bar
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
    const expiresAt = Date.now() + UNDO_WINDOW_MS;
    setUndoState({ ...state, expiresAt });
    undoTimerRef.current = setTimeout(() => setUndoState(null), UNDO_WINDOW_MS);
  };
  const dismissUndo = () => {
    clearTimeout(undoTimerRef.current);
    setUndoState(null);
  };

  const declareBankruptcy = async (sessionName) => {
    const tabs = await queryTabs();
    const savable = tabs.filter((tab) => shouldIncludeTab(tab, settings));
    if (savable.length === 0) { flash(tt("noTabs")); return; }
    const session = {
      id: crypto.randomUUID(),
      name: sessionName?.trim() || buildName(settings),
      createdAt: Date.now(),
      tabs: savable.map((tab) => ({
        url: tab.url,
        title: tab.title || tab.url,
        favIconUrl: tab.favIconUrl || "",
      })),
      notes: "",
      tags: [],
    };
    const next = [session, ...sessions];
    await setItem(STORAGE_KEY, next);
    setSessions(next);

    if (isExtension) {
      chrome.tabs.create({ url: "chrome://newtab" }, (freshTab) => {
        const toClose = tabs
          .filter((tab) => tab.id !== freshTab.id && !(settings.ignorePinned && tab.pinned))
          .map((tab) => tab.id);
        if (toClose.length) chrome.tabs.remove(toClose);
      });
    } else {
      flash(`Saved ${savable.length} tabs (preview mode).`);
    }
    armUndo({
      kind: "declare",
      sessionId: session.id,
      label: tt("undoDeclare", { n: savable.length }),
    });
  };

  const restoreSession = (session) => {
    if (!isExtension) { flash("Restore only works inside the extension."); return; }
    const createdIds = [];
    let pending = session.tabs.length;
    session.tabs.forEach((tab) => {
      chrome.tabs.create({ url: tab.url, active: false }, (created) => {
        if (created?.id) createdIds.push(created.id);
        pending -= 1;
        if (pending === 0) {
          armUndo({
            kind: "restore",
            createdIds,
            label: tt("undoRestore", { n: createdIds.length }),
          });
        }
      });
    });
  };

  const deleteSession = async (id) => {
    const target = sessions.find((s) => s.id === id);
    const next = sessions.filter((s) => s.id !== id);
    await setItem(STORAGE_KEY, next);
    setSessions(next);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    if (target) {
      armUndo({ kind: "delete", sessions: [target], label: tt("undoDelete", { n: 1 }) });
    } else {
      flash(tt("sessionDeleted"));
    }
  };

  const updateSession = async (id, patch) => {
    const next = sessions.map((s) => (s.id === id ? { ...s, ...patch } : s));
    await setItem(STORAGE_KEY, next);
    setSessions(next);
  };

  // Bulk actions
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const selectAllVisible = (visible) => setSelectedIds(new Set(visible.map((s) => s.id)));

  const bulkDelete = async () => {
    const ids = new Set(selectedIds);
    const removed = sessions.filter((s) => ids.has(s.id));
    const next = sessions.filter((s) => !ids.has(s.id));
    await setItem(STORAGE_KEY, next);
    setSessions(next);
    clearSelection();
    armUndo({ kind: "delete", sessions: removed, label: tt("undoDelete", { n: removed.length }) });
  };
  const bulkRestore = () => {
    const toRestore = sessions.filter((s) => selectedIds.has(s.id));
    if (!isExtension) { flash("Restore only works inside the extension."); return; }
    const createdIds = [];
    const allTabs = toRestore.flatMap((s) => s.tabs);
    let pending = allTabs.length;
    if (pending === 0) return;
    allTabs.forEach((tab) => {
      chrome.tabs.create({ url: tab.url, active: false }, (created) => {
        if (created?.id) createdIds.push(created.id);
        pending -= 1;
        if (pending === 0) {
          armUndo({ kind: "restore", createdIds, label: tt("undoRestore", { n: createdIds.length }) });
        }
      });
    });
    clearSelection();
  };

  // Undo actions
  const performUndo = async () => {
    if (!undoState) return;
    if (undoState.kind === "declare") {
      const session = sessions.find((s) => s.id === undoState.sessionId);
      const next = sessions.filter((s) => s.id !== undoState.sessionId);
      await setItem(STORAGE_KEY, next);
      setSessions(next);
      if (isExtension && session) {
        session.tabs.forEach((tab) => chrome.tabs.create({ url: tab.url, active: false }));
      }
      flash(tt("undone"));
    } else if (undoState.kind === "restore") {
      if (isExtension && undoState.createdIds?.length) {
        chrome.tabs.remove(undoState.createdIds);
      }
      flash(tt("undone"));
    } else if (undoState.kind === "delete") {
      const merged = [...(undoState.sessions || []), ...sessions].sort(
        (a, b) => b.createdAt - a.createdAt
      );
      await setItem(STORAGE_KEY, merged);
      setSessions(merged);
      flash(tt("undone"));
    }
    dismissUndo();
  };

  // Export/Import
  const exportSessions = () => {
    const payload = {
      app: "TabBankruptcy", version: 1,
      exportedAt: new Date().toISOString(), sessions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tabbankruptcy-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(tt("exported", { n: sessions.length }));
  };

  const importSessions = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = Array.isArray(data) ? data : data.sessions;
      if (!Array.isArray(incoming)) throw new Error("bad shape");
      const cleaned = incoming
        .filter((s) => s && Array.isArray(s.tabs))
        .map((s) => ({
          id: s.id || crypto.randomUUID(),
          name: s.name || "Imported session",
          createdAt: s.createdAt || Date.now(),
          notes: s.notes || "",
          tags: Array.isArray(s.tags) ? s.tags : [],
          tabs: s.tabs.map((tab) => ({
            url: tab.url, title: tab.title || tab.url, favIconUrl: tab.favIconUrl || "",
          })),
        }));
      const existingIds = new Set(sessions.map((s) => s.id));
      const merged = [...cleaned.filter((s) => !existingIds.has(s.id)), ...sessions].sort(
        (a, b) => b.createdAt - a.createdAt
      );
      await setItem(STORAGE_KEY, merged);
      setSessions(merged);
      flash(tt("imported", { n: cleaned.length }));
    } catch {
      flash(tt("importFailed"));
    }
  };

  const allTags = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => (s.tags || []).forEach((tg) => set.add(tg)));
    return [...set].sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const dayMs = 86400000;
    return sessions.filter((s) => {
      if (filter === "today" && now - s.createdAt > dayMs) return false;
      if (filter === "week" && now - s.createdAt > 7 * dayMs) return false;
      if (tagFilter && !(s.tags || []).includes(tagFilter)) return false;
      if (!q) return true;
      if (s.name.toLowerCase().includes(q)) return true;
      if ((s.notes || "").toLowerCase().includes(q)) return true;
      if ((s.tags || []).some((tg) => tg.toLowerCase().includes(q))) return true;
      return s.tabs.some(
        (tab) =>
          (tab.title || "").toLowerCase().includes(q) ||
          (tab.url || "").toLowerCase().includes(q)
      );
    });
  }, [sessions, query, filter, tagFilter]);

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : settings.theme === "light" ? "system" : "dark";
    const merged = { ...settings, theme: next };
    setSettings(merged);
    setItem(SETTINGS_KEY, merged);
  };

  const changeLang = (code) => {
    const merged = { ...settings, language: code };
    setSettings(merged);
    setItem(SETTINGS_KEY, merged);
    setLangMenu(false);
  };

  const openOptions = () => {
    if (isExtension && chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  };

  const secondsLeft = undoState ? Math.max(0, Math.ceil((undoState.expiresAt - Date.now()) / 1000)) : 0;
  void undoTick; // ensure re-render dependency

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 relative">
      <a
        href="#tb-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-50 focus:px-2 focus:py-1 focus:bg-neutral-900 focus:text-white dark:focus:bg-white dark:focus:text-neutral-900 focus:rounded"
      >
        {tt("skipToContent")}
      </a>

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
          <IconBtn onClick={openOptions} label={tt("settings")}>
            <Settings size={14} aria-hidden="true" />
          </IconBtn>
        </div>
      </header>

      {langMenu && (
        <div
          role="menu"
          aria-label={tt("language")}
          className="absolute right-3 top-14 z-10 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1 max-h-64 overflow-auto"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={lang === l.code}
              onClick={() => changeLang(l.code)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                lang === l.code ? "font-semibold" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <nav className="flex items-center gap-1 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800" aria-label={tt("primary")}>
        <NavBtn active={view === "home"} onClick={() => setView("home")}>
          {tt("home")}
        </NavBtn>
        <NavBtn active={view === "history"} onClick={() => setView("history")}>
          <History size={12} className="inline mr-1 -mt-0.5" aria-hidden="true" />
          {tt("history")}
          {sessions.length > 0 && (
            <span className="ml-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 text-[9px]" aria-label={`${sessions.length} ${tt("sessions")}`}>
              {sessions.length}
            </span>
          )}
        </NavBtn>
      </nav>

      <main id="tb-main" className="flex-1 overflow-y-auto tb-scroll" tabIndex={-1}>
        {view === "home" ? (
          <div className="p-4 space-y-4">
            <Dashboard tabCount={tabCount} sessionCount={sessions.length} t={tt} />
            <BankruptcyButton
              tabCount={tabCount}
              onDeclare={declareBankruptcy}
              confirmBeforeClose={settings.confirmBeforeClose}
              t={tt}
            />
            <p className="text-[11px] text-neutral-500 leading-relaxed px-1">{tt("intro")}</p>
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
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <label htmlFor="tb-search" className="sr-only">{tt("searchPlaceholder")}</label>
                <input
                  id="tb-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tt("searchPlaceholder")}
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs outline-none focus:border-neutral-900 dark:focus:border-white focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                />
              </div>
              <IconBtn onClick={exportSessions} label={tt("export")}><Download size={13} aria-hidden="true" /></IconBtn>
              <IconBtn onClick={() => fileRef.current?.click()} label={tt("import")}><Upload size={13} aria-hidden="true" /></IconBtn>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => e.target.files?.[0] && importSessions(e.target.files[0])}
              />
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label={tt("filter")}>
              {[["all", tt("filterAll")], ["today", tt("filterToday")], ["week", tt("filterWeek")]].map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  aria-pressed={filter === k}
                  className={`px-2 py-1 rounded-md text-[11px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                    filter === k
                      ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  {v}
                </button>
              ))}
              {allTags.length > 0 && (
                <>
                  <span className="mx-1 self-center text-neutral-300 dark:text-neutral-700" aria-hidden="true">|</span>
                  {allTags.map((tg) => (
                    <button
                      key={tg}
                      onClick={() => setTagFilter(tagFilter === tg ? null : tg)}
                      aria-pressed={tagFilter === tg}
                      className={`px-2 py-1 rounded-full text-[10px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                        tagFilter === tg
                          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      #{tg}
                    </button>
                  ))}
                </>
              )}
            </div>

            {selectedIds.size > 0 && (
              <div
                role="toolbar"
                aria-label={tt("bulkActions")}
                className="flex items-center gap-2 rounded-lg border border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5"
              >
                <span className="text-[11px] font-medium">
                  {tt("selected", { n: selectedIds.size })}
                </span>
                <button
                  onClick={() => selectAllVisible(filtered)}
                  className="text-[11px] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white rounded"
                >
                  {tt("selectAll")}
                </button>
                <div className="flex-1" />
                <button
                  onClick={bulkRestore}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  <RotateCcw size={11} aria-hidden="true" /> {tt("restoreAll")}
                </button>
                <button
                  onClick={bulkDelete}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  <Trash2 size={11} aria-hidden="true" /> {tt("delete")}
                </button>
                <button
                  onClick={clearSelection}
                  aria-label={tt("clearSelection")}
                  className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            )}

            <SessionList
              sessions={filtered}
              onRestore={restoreSession}
              onDelete={deleteSession}
              onUpdate={updateSession}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              t={tt}
            />
          </div>
        )}
      </main>

      {undoState && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-2 shadow-xl"
        >
          <span className="text-xs flex-1 truncate">{undoState.label}</span>
          <span className="text-[10px] opacity-60 tabular-nums" aria-hidden="true">{secondsLeft}s</span>
          <button
            onClick={performUndo}
            className="inline-flex items-center gap-1 text-xs font-semibold underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-neutral-900 rounded"
          >
            <Undo2 size={12} aria-hidden="true" /> {tt("undo")}
          </button>
          <button
            onClick={dismissUndo}
            aria-label={tt("dismiss")}
            className="p-0.5 rounded hover:bg-white/10 dark:hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white dark:focus-visible:ring-neutral-900"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      {toast && !undoState && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs px-3 py-1.5 rounded-lg shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, label, ...rest }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-7 w-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
      {...rest}
    >
      {children}
    </button>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
        active
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}

function ShortcutRow({ label, keys }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        {keys}
      </kbd>
    </li>
  );
}
