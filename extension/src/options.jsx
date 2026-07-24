import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { Settings, Save, Check, CloudUpload, CloudDownload } from "lucide-react";
import { SETTINGS_KEY, STORAGE_KEY, DEFAULT_SETTINGS, getItem, setItem, isExtension } from "./storage.js";
import { LANGUAGES, t } from "./i18n.js";
import "./index.css";

const COMMON_TZ = [
  "UTC", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Istanbul",
  "Africa/Cairo", "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Bangkok",
  "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney",
];

function Options() {
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const lang = s.language || "en";
  const tt = (k, v) => t(lang, k, v);

  useEffect(() => { getItem(SETTINGS_KEY, {}).then((stored) => setS({ ...DEFAULT_SETTINGS, ...stored })); }, []);
  useEffect(() => {
    const mode = s.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : s.theme;
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [s.theme, lang]);

  const update = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const save = async () => {
    await setItem(SETTINGS_KEY, s);
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };
  const send = (msg) => new Promise((resolve) => {
    if (!isExtension) return resolve({ ok: false });
    try { chrome.runtime.sendMessage(msg, (r) => resolve(r || { ok: false })); }
    catch { resolve({ ok: false }); }
  });

  const cloudPush = async () => {
    setBusy("push");
    const r = await send({ type: "CLOUD_PUSH" });
    setBusy(null);
    flash(r?.ok ? `Pushed ${r.count ?? ""} sessions.` : r?.error || "Push failed.");
  };
  const cloudPull = async () => {
    setBusy("pull");
    const r = await send({ type: "CLOUD_PULL" });
    setBusy(null);
    if (!r?.sessions) { flash(r?.error || "Pull failed."); return; }
    // Merge into local (overwrite)
    const current = await getItem(STORAGE_KEY, []);
    const byId = new Map(current.map((x) => [x.id, x]));
    for (const inc of r.sessions) byId.set(inc.id, { ...byId.get(inc.id), ...inc });
    await setItem(STORAGE_KEY, [...byId.values()].sort((a, b) => b.createdAt - a.createdAt));
    flash(`Pulled ${r.sessions.length} sessions.`);
  };
  const syncMirror = async () => {
    setBusy("mirror");
    const r = await send({ type: "SYNC_MIRROR" });
    setBusy(null);
    flash(r?.ok ? "Mirrored to browser sync." : r?.error || "Mirror failed.");
  };
  const syncRestore = async () => {
    setBusy("restore");
    const r = await send({ type: "SYNC_RESTORE" });
    setBusy(null);
    if (!r?.sessions?.length) { flash("Nothing found in browser sync."); return; }
    await setItem(STORAGE_KEY, r.sessions);
    flash(`Restored ${r.sessions.length} sessions from browser sync.`);
  };

  const detectedTZ = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
            <Settings size={18} className="text-white dark:text-neutral-900" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">TabBankruptcy</h1>
            <p className="text-xs text-neutral-500">{tt("settings")}</p>
          </div>
        </header>

        <div className="space-y-8">
          <Section title="Appearance">
            <Field label={tt("language")}>
              <select value={s.language} onChange={(e) => update({ language: e.target.value })} className="input">
                {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.label}</option>))}
              </select>
            </Field>
            <Field label="Theme">
              <select value={s.theme} onChange={(e) => update({ theme: e.target.value })} className="input">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
          </Section>

          <Section title="Naming rules">
            <Field label="Session name prefix">
              <input value={s.namePrefix} onChange={(e) => update({ namePrefix: e.target.value })} className="input" placeholder="Session" />
            </Field>
            <Field label="Date format">
              <select value={s.dateFormat} onChange={(e) => update({ dateFormat: e.target.value })} className="input">
                <option value="short">Short — Jul 24, 14:32</option>
                <option value="iso">ISO — 2026-07-24 14:32</option>
                <option value="time">Time only — 14:32</option>
              </select>
            </Field>
            <p className="text-xs text-neutral-500">Preview: <span className="font-mono">{`${s.namePrefix || "Session"} — sample`}</span></p>
          </Section>

          <Section title="Confirmation">
            <Toggle label="Ask to name the session before closing tabs" checked={s.confirmBeforeClose} onChange={(v) => update({ confirmBeforeClose: v })} />
            <Toggle label="Skip confirmation when using the keyboard shortcut" checked={s.skipConfirmOnShortcut} onChange={(v) => update({ skipConfirmOnShortcut: v })} />
          </Section>

          <Section title="Restore behavior">
            <Toggle label="Skip duplicate URLs already open when restoring" checked={s.dedupOnRestore} onChange={(v) => update({ dedupOnRestore: v })} />
            <Toggle label="Restore sessions into a new browser window by default" checked={s.restoreInNewWindow} onChange={(v) => update({ restoreInNewWindow: v })} />
          </Section>

          <Section title="Auto-Archive (side panel)">
            <Toggle
              label="Auto-close idle tabs and stash them in the side panel"
              checked={!!s.autoArchive?.enabled}
              onChange={(v) => update({ autoArchive: { ...s.autoArchive, enabled: v } })}
            />
            <Field label="Idle time before archiving (minutes)">
              <input type="number" min={5} max={720} value={s.autoArchive?.idleMinutes ?? 30}
                onChange={(e) => update({ autoArchive: { ...s.autoArchive, idleMinutes: Math.max(5, Math.min(720, Number(e.target.value) || 30)) } })}
                className="input" />
            </Field>
            <Toggle label="Never archive pinned tabs" checked={s.autoArchive?.keepPinned ?? true}
              onChange={(v) => update({ autoArchive: { ...s.autoArchive, keepPinned: v } })} />
            <Toggle label="Never archive tabs playing audio" checked={s.autoArchive?.keepAudible ?? true}
              onChange={(v) => update({ autoArchive: { ...s.autoArchive, keepAudible: v } })} />
            <Field label="Max archived tabs stored">
              <input type="number" min={20} max={2000} value={s.autoArchive?.max ?? 300}
                onChange={(e) => update({ autoArchive: { ...s.autoArchive, max: Math.max(20, Math.min(2000, Number(e.target.value) || 300)) } })}
                className="input" />
            </Field>
            <Field label="Never auto-archive these domains (one per line, matches subdomains)">
              <textarea rows={3} value={s.autoArchiveExcludeDomains}
                onChange={(e) => update({ autoArchiveExcludeDomains: e.target.value })}
                className="input font-mono text-xs" placeholder={"gmail.com\nnotion.so"} />
            </Field>
            <Field label="Always keep pinned (auto-pin these domains so they're never archived)">
              <textarea rows={3} value={s.autoArchiveKeepDomains}
                onChange={(e) => update({ autoArchiveKeepDomains: e.target.value })}
                className="input font-mono text-xs" placeholder={"calendar.google.com\ngithub.com"} />
            </Field>
            <p className="text-xs text-neutral-500">
              Archived tabs live in the extension's side panel — Chrome/Edge/Brave show it via the side-panel icon; Firefox exposes it under View → Sidebar → TabBankruptcy.
            </p>

          </Section>

          <Section title="Ghost Tab Checker">
            <Field label="Consider a tab a ghost after (minutes)">
              <input type="number" min={5} max={1440} value={s.ghostIdleMinutes ?? 60}
                onChange={(e) => update({ ghostIdleMinutes: Math.max(5, Math.min(1440, Number(e.target.value) || 60)) })}
                className="input" />
            </Field>
            <Toggle label="Skip the confirmation dialog when nuking ghosts" checked={!!s.skipGhostConfirm}
              onChange={(v) => update({ skipGhostConfirm: v })} />
            <p className="text-xs text-neutral-500">
              Ghost tabs are detected via tab metadata (idle time, browser-suspended state, duplicate URLs). Real CPU/RAM sampling requires Chrome's Dev-channel <code>processes</code> API and isn't used here.
            </p>
          </Section>

          <Section title="Which tabs count">
            <Toggle label="Ignore pinned tabs" checked={s.ignorePinned} onChange={(v) => update({ ignorePinned: v })} />
            <Toggle label="Ignore chrome://, edge://, brave://, about: pages" checked={s.ignoreChromeInternal} onChange={(v) => update({ ignoreChromeInternal: v })} />
            <Toggle label="Ignore other extension pages" checked={s.ignoreExtensionPages} onChange={(v) => update({ ignoreExtensionPages: v })} />
            <Field label="Exclude URLs containing (one per line)">
              <textarea rows={4} value={s.excludePatterns} onChange={(e) => update({ excludePatterns: e.target.value })}
                className="input font-mono text-xs" placeholder={"mail.google.com\nlocalhost"} />
            </Field>
          </Section>

          <Section title="Automatic export">
            <Field label="Auto-export session history">
              <select value={s.autoExportFrequency} onChange={(e) => update({ autoExportFrequency: e.target.value })} className="input">
                <option value="off">Off</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Every day at…</option>
                <option value="weekly">Every week at…</option>
              </select>
            </Field>
            {(s.autoExportFrequency === "daily" || s.autoExportFrequency === "weekly") && (
              <>
                <Field label="Time of day">
                  <input type="time" value={s.autoExportTime} onChange={(e) => update({ autoExportTime: e.target.value })} className="input" />
                </Field>
                <Field label="Timezone">
                  <select value={s.autoExportTimezone} onChange={(e) => update({ autoExportTimezone: e.target.value })} className="input">
                    <option value="">Browser default ({detectedTZ})</option>
                    {COMMON_TZ.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </Field>
              </>
            )}
            <p className="text-xs text-neutral-500">
              Backups land in <span className="font-mono">Downloads/tabbankruptcy-auto/</span>.
              The browser must be running when the alarm fires.
            </p>
          </Section>

          <Section title="Cloud sync & reinstall recovery">
            <Toggle
              label="Mirror sessions to browser sync storage (auto-restore after reinstall on the same browser account)"
              checked={s.syncToStorageSync}
              onChange={(v) => update({ syncToStorageSync: v })}
            />
            <div className="flex gap-2">
              <button type="button" onClick={syncMirror} disabled={busy === "mirror"}
                className="btn-sec"><CloudUpload size={13} aria-hidden="true" /> Push to browser sync</button>
              <button type="button" onClick={syncRestore} disabled={busy === "restore"}
                className="btn-sec"><CloudDownload size={13} aria-hidden="true" /> Restore from browser sync</button>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <Field label="Your cloud endpoint URL (HTTPS — accepts PUT and GET of JSON)">
                <input type="url" placeholder="https://your-server.example.com/tabbankruptcy"
                  value={s.cloudEndpointUrl} onChange={(e) => update({ cloudEndpointUrl: e.target.value })} className="input" />
              </Field>
              <Field label="Bearer token (optional)">
                <input type="password" value={s.cloudEndpointToken} onChange={(e) => update({ cloudEndpointToken: e.target.value })} className="input" />
              </Field>
              <Toggle label="Auto-push to cloud when sessions change" checked={s.cloudAutoPush} onChange={(v) => update({ cloudAutoPush: v })} />
              <div className="flex gap-2">
                <button type="button" onClick={cloudPush} disabled={busy === "push" || !s.cloudEndpointUrl} className="btn-sec">
                  <CloudUpload size={13} aria-hidden="true" /> Push now
                </button>
                <button type="button" onClick={cloudPull} disabled={busy === "pull" || !s.cloudEndpointUrl} className="btn-sec">
                  <CloudDownload size={13} aria-hidden="true" /> Pull now
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Your endpoint stores one JSON body per user — bring your own storage (a static file, S3, Cloudflare Worker,
                or a small server). Nothing is sent to third parties.
              </p>
            </div>
          </Section>

          <div className="flex items-center gap-3">
            <button onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white">
              {saved ? <Check size={14} aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
              {saved ? "Saved" : "Save settings"}
            </button>
            <a href="chrome://extensions/shortcuts" target="_blank" rel="noreferrer"
              className="text-xs text-neutral-500 hover:underline">Customize keyboard shortcuts →</a>
            {msg && <span className="text-xs text-neutral-500" role="status" aria-live="polite">{msg}</span>}
          </div>
        </div>
      </div>

      <style>{`
        .input { width:100%; padding:.5rem .75rem; border-radius:.5rem; border:1px solid rgb(229 229 229);
          background:white; font-size:.875rem; outline:none; color:inherit; }
        .dark .input { background: rgb(23 23 23); border-color: rgb(38 38 38); }
        .input:focus, .input:focus-visible { border-color: rgb(23 23 23); outline: 2px solid rgb(23 23 23); outline-offset: 1px; }
        .dark .input:focus, .dark .input:focus-visible { border-color: white; outline-color: white; }
        .btn-sec { display:inline-flex; align-items:center; gap:.35rem; padding:.35rem .6rem; border-radius:.5rem;
          border:1px solid rgb(229 229 229); font-size:.75rem; background: transparent; cursor: pointer; }
        .dark .btn-sec { border-color: rgb(38 38 38); }
        .btn-sec:hover:not(:disabled) { background: rgb(245 245 245); } .dark .btn-sec:hover:not(:disabled) { background: rgb(23 23 23); }
        .btn-sec:disabled { opacity:.5; cursor:not-allowed; }
        .btn-sec:focus-visible { outline: 2px solid rgb(23 23 23); outline-offset: 1px; }
        .dark .btn-sec:focus-visible { outline-color: white; }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">{children}</div>
    </section>
  );
}
function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
          checked ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
        }`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
          checked ? "translate-x-4 bg-white dark:bg-neutral-900" : "bg-white dark:bg-neutral-500"
        }`} />
      </button>
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Options /></React.StrictMode>
);
