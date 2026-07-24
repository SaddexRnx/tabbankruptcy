import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Settings, Save, Check } from "lucide-react";
import { SETTINGS_KEY, DEFAULT_SETTINGS, getItem, setItem } from "./storage.js";
import { LANGUAGES, t } from "./i18n.js";
import "./index.css";

function Options() {
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const lang = s.language || "en";
  const tt = (k, v) => t(lang, k, v);

  useEffect(() => {
    getItem(SETTINGS_KEY, {}).then((stored) =>
      setS({ ...DEFAULT_SETTINGS, ...stored })
    );
  }, []);

  useEffect(() => {
    const mode =
      s.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : s.theme;
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [s.theme, lang]);

  const update = (patch) => setS((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    await setItem(SETTINGS_KEY, s);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
            <Settings size={18} className="text-white dark:text-neutral-900" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">TabBankruptcy</h1>
            <p className="text-xs text-neutral-500">{tt("settings")}</p>
          </div>
        </header>

        <div className="space-y-8">
          <Section title="Appearance">
            <Field label={tt("language")}>
              <select
                value={s.language}
                onChange={(e) => update({ language: e.target.value })}
                className="input"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Theme">
              <select
                value={s.theme}
                onChange={(e) => update({ theme: e.target.value })}
                className="input"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
          </Section>

          <Section title="Naming rules">
            <Field label="Session name prefix">
              <input
                value={s.namePrefix}
                onChange={(e) => update({ namePrefix: e.target.value })}
                className="input"
                placeholder="Session"
              />
            </Field>
            <Field label="Date format">
              <select
                value={s.dateFormat}
                onChange={(e) => update({ dateFormat: e.target.value })}
                className="input"
              >
                <option value="short">Short — Jul 24, 14:32</option>
                <option value="iso">ISO — 2026-07-24 14:32</option>
                <option value="time">Time only — 14:32</option>
              </select>
            </Field>
            <p className="text-xs text-neutral-500">
              Preview:{" "}
              <span className="font-mono">
                {`${s.namePrefix || "Session"} — sample`}
              </span>
            </p>
          </Section>

          <Section title="Confirmation">
            <Toggle
              label="Ask to name the session before closing tabs"
              checked={s.confirmBeforeClose}
              onChange={(v) => update({ confirmBeforeClose: v })}
            />
            <Toggle
              label="Skip confirmation when using the keyboard shortcut"
              checked={s.skipConfirmOnShortcut}
              onChange={(v) => update({ skipConfirmOnShortcut: v })}
            />
          </Section>

          <Section title="Which tabs count">
            <Toggle
              label="Ignore pinned tabs"
              checked={s.ignorePinned}
              onChange={(v) => update({ ignorePinned: v })}
            />
            <Toggle
              label="Ignore chrome://, edge://, brave://, about: pages"
              checked={s.ignoreChromeInternal}
              onChange={(v) => update({ ignoreChromeInternal: v })}
            />
            <Toggle
              label="Ignore other extension pages"
              checked={s.ignoreExtensionPages}
              onChange={(v) => update({ ignoreExtensionPages: v })}
            />
            <Field label="Exclude URLs containing (one per line)">
              <textarea
                rows={4}
                value={s.excludePatterns}
                onChange={(e) => update({ excludePatterns: e.target.value })}
                className="input font-mono text-xs"
                placeholder={"mail.google.com\nlocalhost"}
              />
            </Field>
          </Section>

          <Section title="Automatic export">
            <Field label="Auto-export session history">
              <select
                value={s.autoExportFrequency}
                onChange={(e) => update({ autoExportFrequency: e.target.value })}
                className="input"
                aria-describedby="autoexport-help"
              >
                <option value="off">Off</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
              </select>
            </Field>
            <p id="autoexport-help" className="text-xs text-neutral-500">
              Downloads a timestamped JSON backup to your default Downloads folder,
              inside <span className="font-mono">tabbankruptcy-auto/</span>.
              The browser must be running when the alarm fires.
            </p>
          </Section>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-sm hover:opacity-90"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Saved" : "Save settings"}
            </button>
            <a
              href="chrome://extensions/shortcuts"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-500 hover:underline"
            >
              Customize keyboard shortcuts →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(229 229 229);
          background: white;
          font-size: 0.875rem;
          outline: none;
          color: inherit;
        }
        .dark .input {
          background: rgb(23 23 23);
          border-color: rgb(38 38 38);
        }
        .input:focus {
          border-color: rgb(23 23 23);
        }
        .dark .input:focus {
          border-color: white;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition ${
          checked ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
            checked ? "translate-x-4 bg-white dark:bg-neutral-900" : "bg-white dark:bg-neutral-500"
          }`}
        />
      </button>
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
