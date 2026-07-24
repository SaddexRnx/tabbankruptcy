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

export default function App() {
  const [tabCount, setTabCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [themeMenu, setThemeMenu] = useState(false);
  const fileRef = useRef(null);

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
    const eligible = tabs.filter((t) => shouldIncludeTab(t, merged));
    setTabCount(eligible.length);
    setSessions(saved.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Theme application
  useEffect(() => {
    const apply = () => {
      const mode =
        settings.theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : settings.theme;
      document.documentElement.classList.toggle("dark", mode === "dark");
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [settings.theme, lang]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const declareBankruptcy = async (sessionName) => {
    const tabs = await queryTabs();
    const savable = tabs.filter((t) => shouldIncludeTab(t, settings));
    if (savable.length === 0) {
      flash(tt("noTabs"));
      return;
    }
    const session = {
      id: crypto.randomUUID(),
      name: sessionName?.trim() || buildName(settings),
      createdAt: Date.now(),
      tabs: savable.map((t) => ({
        url: t.url,
        title: t.title || t.url,
        favIconUrl: t.favIconUrl || "",
      })),
    };
    const next = [session, ...sessions];
    await setItem(STORAGE_KEY, next);
    setSessions(next);

    if (isExtension) {
      chrome.tabs.create({ url: "chrome://newtab" }, (freshTab) => {
        const toClose = tabs
          .filter((t) => t.id !== freshTab.id && !(settings.ignorePinned && t.pinned))
          .map((t) => t.id);
        if (toClose.length) chrome.tabs.remove(toClose);
      });
    } else {
      flash(`Saved ${savable.length} tabs (preview mode).`);
      refresh();
    }
  };

  const restoreSession = (session) => {
    if (!isExtension) {
      flash("Restore only works inside the extension.");
      return;
    }
    for (const t of session.tabs) chrome.tabs.create({ url: t.url, active: false });
  };

  const deleteSession = async (id) => {
    const next = sessions.filter((s) => s.id !== id);
    await setItem(STORAGE_KEY, next);
    setSessions(next);
    flash(tt("sessionDeleted"));
  };

  // Export/Import
  const exportSessions = () => {
    const payload = {
      app: "TabBankruptcy",
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions,
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
          tabs: s.tabs.map((t) => ({
            url: t.url,
            title: t.title || t.url,
            favIconUrl: t.favIconUrl || "",
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

  // Filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const dayMs = 86400000;
    return sessions.filter((s) => {
      if (filter === "today" && now - s.createdAt > dayMs) return false;
      if (filter === "week" && now - s.createdAt > 7 * dayMs) return false;
      if (!q) return true;
      if (s.name.toLowerCase().includes(q)) return true;
      return s.tabs.some(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.url || "").toLowerCase().includes(q)
      );
    });
  }, [sessions, query, filter]);

  const toggleTheme = () => {
    const next =
      settings.theme === "dark" ? "light" : settings.theme === "light" ? "system" : "dark";
    const merged = { ...settings, theme: next };
    setSettings(merged);
    setItem(SETTINGS_KEY, merged);
  };

  const changeLang = (code) => {
    const merged = { ...settings, language: code };
    setSettings(merged);
    setItem(SETTINGS_KEY, merged);
    setThemeMenu(false);
  };

  const openOptions = () => {
    if (isExtension && chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
            <Landmark size={16} className="text-white dark:text-neutral-900" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight truncate">TabBankruptcy</h1>
            <p className="text-[10px] text-neutral-500 -mt-0.5 truncate">{tt("tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={toggleTheme} title={settings.theme}>
            {settings.theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          </IconBtn>
          <IconBtn onClick={() => setThemeMenu((v) => !v)} title="Language">
            <span className="text-[10px] font-semibold uppercase">{lang}</span>
          </IconBtn>
          <IconBtn onClick={openOptions} title={tt("settings")}>
            <Settings size={14} />
          </IconBtn>
        </div>
      </header>

      {themeMenu && (
        <div className="absolute right-3 top-14 z-10 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-1 max-h-64 overflow-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                lang === l.code ? "font-semibold" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* Tabs nav */}
      <nav className="flex items-center gap-1 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <NavBtn active={view === "home"} onClick={() => setView("home")}>
          {tt("home")}
        </NavBtn>
        <NavBtn active={view === "history"} onClick={() => setView("history")}>
          <History size={12} className="inline mr-1 -mt-0.5" />
          {tt("history")}
          {sessions.length > 0 && (
            <span className="ml-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-1.5 py-0.5 text-[9px]">
              {sessions.length}
            </span>
          )}
        </NavBtn>
      </nav>

      {/* Body */}
      <main className="flex-1 overflow-y-auto tb-scroll">
        {view === "home" ? (
          <div className="p-4 space-y-4">
            <Dashboard
              tabCount={tabCount}
              sessionCount={sessions.length}
              t={tt}
            />
            <BankruptcyButton
              tabCount={tabCount}
              onDeclare={declareBankruptcy}
              confirmBeforeClose={settings.confirmBeforeClose}
              t={tt}
            />
            <p className="text-[11px] text-neutral-500 leading-relaxed px-1">
              {tt("intro")}
            </p>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-neutral-500">
                <Keyboard size={12} /> {tt("shortcuts")}
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
            {/* Search + filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tt("searchPlaceholder")}
                  className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
              <IconBtn onClick={exportSessions} title={tt("export")}>
                <Download size={13} />
              </IconBtn>
              <IconBtn onClick={() => fileRef.current?.click()} title={tt("import")}>
                <Upload size={13} />
              </IconBtn>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => e.target.files?.[0] && importSessions(e.target.files[0])}
              />
            </div>
            <div className="flex gap-1">
              {[
                ["all", tt("filterAll")],
                ["today", tt("filterToday")],
                ["week", tt("filterWeek")],
              ].map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-2 py-1 rounded-md text-[11px] border transition ${
                    filter === k
                      ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <SessionList
              sessions={filtered}
              onRestore={restoreSession}
              onDelete={deleteSession}
              t={tt}
            />
          </div>
        )}
      </main>

      {toast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs px-3 py-1.5 rounded-lg shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="h-7 w-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
    >
      {children}
    </button>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
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
