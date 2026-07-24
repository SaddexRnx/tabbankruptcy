import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Archive, RotateCcw, Trash2, Ghost, Play, Pause, ExternalLink, Download, Upload } from "lucide-react";
import { AUTO_ARCHIVE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS, getItem, setItem, isExtension } from "./storage.js";
import "./index.css";

function relTime(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return ""; } };

function SidePanel() {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [q, setQ] = useState("");
  const [when, setWhen] = useState("all"); // all | today | week
  const [host, setHost] = useState("");
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2200); };

  const refresh = async () => {
    const [it, st] = await Promise.all([
      getItem(AUTO_ARCHIVE_KEY, []),
      getItem(SETTINGS_KEY, {}),
    ]);
    setItems([...it].sort((a, b) => b.archivedAt - a.archivedAt));
    setSettings({ ...DEFAULT_SETTINGS, ...st });
  };
  useEffect(() => {
    refresh();
    if (!isExtension) return;
    const listener = (changes, area) => {
      if (area === "local" && (changes[AUTO_ARCHIVE_KEY] || changes[SETTINGS_KEY])) refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    const mode = settings.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : settings.theme;
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [settings.theme]);

  const hosts = useMemo(() => {
    const set = new Set();
    items.forEach((i) => { const h = hostOf(i.url); if (h) set.add(h); });
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const now = Date.now(); const day = 86400000;
    return items.filter((i) => {
      if (when === "today" && now - i.archivedAt > day) return false;
      if (when === "week" && now - i.archivedAt > 7 * day) return false;
      if (host && hostOf(i.url) !== host) return false;
      if (!s) return true;
      return (i.title || "").toLowerCase().includes(s) || (i.url || "").toLowerCase().includes(s);
    });
  }, [items, q, when, host]);

  const restoreOne = (item) => {
    if (isExtension) chrome.tabs.create({ url: item.url, active: false });
    removeMany([item.id]);
  };
  const removeMany = async (ids) => {
    const next = items.filter((i) => !ids.includes(i.id));
    await setItem(AUTO_ARCHIVE_KEY, next);
    setItems(next);
  };
  const restoreAll = () => {
    if (!isExtension || filtered.length === 0) return;
    const urls = filtered.map((i) => i.url);
    chrome.windows?.create ? chrome.windows.create({ url: urls }) : urls.forEach((u) => chrome.tabs.create({ url: u, active: false }));
    removeMany(filtered.map((i) => i.id));
  };
  const clearAll = async () => {
    if (!confirm("Delete all archived tabs? This cannot be undone.")) return;
    await setItem(AUTO_ARCHIVE_KEY, []);
    setItems([]);
  };
  const toggleAuto = async () => {
    const next = {
      ...settings,
      autoArchive: { ...settings.autoArchive, enabled: !settings.autoArchive.enabled },
    };
    await setItem(SETTINGS_KEY, next);
    setSettings(next);
  };

  const exportArchive = () => {
    const payload = { app: "TabBankruptcy", kind: "auto_archive", version: 1, exportedAt: new Date().toISOString(), items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tabbankruptcy-archive-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    flash(`Exported ${items.length} archived tabs.`);
  };

  const importArchive = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = Array.isArray(data) ? data : data.items;
      if (!Array.isArray(incoming)) throw new Error("bad shape");
      const cleaned = incoming
        .filter((i) => i && typeof i.url === "string")
        .map((i) => ({
          id: i.id || crypto.randomUUID(),
          url: i.url,
          title: i.title || i.url,
          favIconUrl: i.favIconUrl || "",
          archivedAt: i.archivedAt || Date.now(),
        }));
      const seen = new Set(items.map((i) => i.url));
      const additions = cleaned.filter((i) => !seen.has(i.url));
      const next = [...additions, ...items].sort((a, b) => b.archivedAt - a.archivedAt);
      const cap = settings.autoArchive?.max || 300;
      const capped = next.slice(0, Math.max(cap, next.length));
      await setItem(AUTO_ARCHIVE_KEY, capped);
      setItems(capped);
      flash(`Imported ${additions.length} archived tabs.`);
    } catch { flash("Import failed. Invalid file."); }
  };

  const on = settings.autoArchive?.enabled;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 text-sm">
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center" aria-hidden="true">
            <Archive size={15} className="text-white dark:text-neutral-900" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold tracking-tight">Auto-Archive</h1>
            <p className="text-[10px] text-neutral-500 -mt-0.5">Idle tabs, closed to save RAM.</p>
          </div>
          <button onClick={toggleAuto}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
              on ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                 : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"}`}
            aria-pressed={!!on}>
            {on ? <><Pause size={11} /> On</> : <><Play size={11} /> Off</>}
          </button>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search archived…"
          className="w-full px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs outline-none focus:border-neutral-900 dark:focus:border-white" />

        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter">
          {[["all", "All"], ["today", "Today"], ["week", "This week"]].map(([k, v]) => (
            <button key={k} onClick={() => setWhen(k)} aria-pressed={when === k}
              className={`px-2 py-0.5 rounded-md text-[11px] border transition ${
                when === k ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                           : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}>{v}</button>
          ))}
          {hosts.length > 0 && (
            <select value={host} onChange={(e) => setHost(e.target.value)}
              className="ml-1 px-2 py-0.5 rounded-md text-[11px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <option value="">All sites</option>
              {hosts.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-500">
          <span>{filtered.length} of {items.length} archived</span>
          <div className="flex gap-1">
            <button onClick={exportArchive} disabled={!items.length} title="Export archived tabs"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40">
              <Download size={10} /> Export
            </button>
            <button onClick={() => fileRef.current?.click()} title="Import archived tabs"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <Upload size={10} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden
              onChange={(e) => e.target.files?.[0] && importArchive(e.target.files[0])} />
            <button onClick={restoreAll} disabled={!filtered.length}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40">
              <ExternalLink size={10} /> Open all
            </button>
            <button onClick={clearAll} disabled={!items.length}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-40">
              <Trash2 size={10} /> Clear
            </button>
          </div>
        </div>
        {msg && <p role="status" aria-live="polite" className="text-[11px] text-neutral-500">{msg}</p>}
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">
          <Ghost size={28} className="mx-auto mb-2 text-neutral-400" aria-hidden="true" />
          <p>No archived tabs yet.</p>
          <p className="text-[11px] mt-1">
            {on ? "Idle tabs will land here automatically." : "Toggle Auto-Archive on to start."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-neutral-500 text-[12px]">No archived tabs match your filters.</div>
      ) : (
        <ul className="p-2 space-y-1">
          {filtered.map((i) => (
            <li key={i.id} className="group flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              {i.favIconUrl ? (
                <img src={i.favIconUrl} alt="" className="w-4 h-4 rounded-sm flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
              ) : (
                <div className="w-4 h-4 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate" title={i.title}>{i.title || i.url}</div>
                <div className="text-[10px] text-neutral-500 truncate">{relTime(i.archivedAt)} · {hostOf(i.url)}</div>
              </div>
              <button onClick={() => restoreOne(i)} title="Restore" aria-label="Restore"
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                <RotateCcw size={12} />
              </button>
              <button onClick={() => removeMany([i.id])} title="Discard" aria-label="Discard"
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><SidePanel /></React.StrictMode>);
