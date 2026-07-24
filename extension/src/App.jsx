import { useEffect, useState, useCallback } from "react";
import { Landmark, History } from "lucide-react";
import Dashboard from "./components/Dashboard.jsx";
import BankruptcyButton from "./components/BankruptcyButton.jsx";
import SessionList from "./components/SessionList.jsx";

const STORAGE_KEY = "tb_sessions";

// ---- chrome.* helpers (promise-wrapped, safe in non-extension previews) ----
const isExtension =
  typeof chrome !== "undefined" && chrome.tabs && chrome.storage;

const queryTabs = () =>
  new Promise((resolve) => {
    if (!isExtension) return resolve([]);
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs || []));
  });

const getSessions = () =>
  new Promise((resolve) => {
    if (!isExtension) {
      try {
        resolve(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
      } catch {
        resolve([]);
      }
      return;
    }
    chrome.storage.local.get([STORAGE_KEY], (res) =>
      resolve(res[STORAGE_KEY] || [])
    );
  });

const saveSessions = (sessions) =>
  new Promise((resolve) => {
    if (!isExtension) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return resolve();
    }
    chrome.storage.local.set({ [STORAGE_KEY]: sessions }, () => resolve());
  });

export default function App() {
  const [tabCount, setTabCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState("home"); // "home" | "history"
  const [toast, setToast] = useState(null);

  const refresh = useCallback(async () => {
    const [tabs, saved] = await Promise.all([queryTabs(), getSessions()]);
    setTabCount(tabs.length);
    setSessions(saved.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ---- Actions ----
  const declareBankruptcy = async (sessionName) => {
    const tabs = await queryTabs();
    // Skip the extension's own tabs & chrome:// internal pages we can't reopen cleanly
    const savable = tabs.filter(
      (t) => t.url && !t.url.startsWith("chrome-extension://")
    );

    if (savable.length === 0) {
      flash("No tabs to save.");
      return;
    }

    const session = {
      id: crypto.randomUUID(),
      name: sessionName || defaultSessionName(),
      createdAt: Date.now(),
      tabs: savable.map((t) => ({
        url: t.url,
        title: t.title || t.url,
        favIconUrl: t.favIconUrl || "",
      })),
    };

    const next = [session, ...sessions];
    await saveSessions(next);
    setSessions(next);

    if (isExtension) {
      // Open a fresh blank tab, then close everything else in this window
      chrome.tabs.create({ url: "about:blank" }, (freshTab) => {
        const toClose = tabs
          .filter((t) => t.id !== freshTab.id)
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
    for (const t of session.tabs) {
      chrome.tabs.create({ url: t.url, active: false });
    }
  };

  const deleteSession = async (id) => {
    const next = sessions.filter((s) => s.id !== id);
    await saveSessions(next);
    setSessions(next);
    flash("Session deleted.");
  };

  return (
    <div className="w-[400px] h-[600px] bg-zinc-900 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              TabBankruptcy
            </h1>
            <p className="text-[10px] text-zinc-500 -mt-0.5">
              File for tab relief
            </p>
          </div>
        </div>
        <nav className="flex bg-zinc-800/60 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setView("home")}
            className={`px-2.5 py-1 rounded-md transition ${
              view === "home"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              view === "history"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <History size={12} />
            History
            {sessions.length > 0 && (
              <span className="ml-0.5 bg-rose-500/20 text-rose-300 rounded-full px-1.5 text-[10px]">
                {sessions.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto tb-scroll">
        {view === "home" ? (
          <div className="p-4 space-y-4">
            <Dashboard tabCount={tabCount} sessionCount={sessions.length} />
            <BankruptcyButton
              tabCount={tabCount}
              onDeclare={declareBankruptcy}
            />
            <p className="text-[11px] text-zinc-500 leading-relaxed px-1">
              Saves every open tab in this window to a named session, then
              closes them all. Restore anytime from{" "}
              <span className="text-zinc-300">History</span>.
            </p>
          </div>
        ) : (
          <SessionList
            sessions={sessions}
            onRestore={restoreSession}
            onDelete={deleteSession}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 px-3 py-1.5 rounded-lg shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function defaultSessionName() {
  const d = new Date();
  const month = d.toLocaleString("en-US", { month: "short" });
  return `Session — ${month} ${d.getDate()}, ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}
