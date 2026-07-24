import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Download,
  Gavel,
  Landmark,
  Archive,
  RotateCcw,
  Sun,
  Moon,
  Keyboard,
  FileJson,
  Search,
  FolderOpen,
  ToggleRight,
  Puzzle,
  Pin,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Ghost,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabBankruptcy — Declare bankruptcy on your browser tabs" },
      {
        name: "description",
        content:
          "A Chrome & Firefox extension that saves every open tab into a named session, closes them, and lets you restore anytime. Free your RAM in one click.",
      },
      { property: "og:title", content: "TabBankruptcy — File for tab relief" },
      {
        property: "og:description",
        content:
          "Save every open tab, close them, restore later. One-click tab bankruptcy for Chrome and Firefox.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية", rtl: true },
  { code: "zh", label: "中文" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
];

const I18N: Record<string, Record<string, string>> = {
  en: {
    tagline: "Chrome & Firefox extension · Manifest V3",
    heroLead: "Hoarding tabs?",
    heroAccent: "Declare bankruptcy.",
    sub: "One click saves every open tab into a named session, closes them all, and frees your RAM. Restore anytime, no account required.",
    downloadChromium: "Download for Chrome",
    downloadFirefox: "Download for Firefox",
    guide: "How to install",
    footer: "Local-first · No accounts · No tracking · Data stays in your browser.",
  },
  es: {
    tagline: "Extensión de Chrome y Firefox · Manifest V3",
    heroLead: "¿Acumulas pestañas?",
    heroAccent: "Declara la bancarrota.",
    sub: "Con un clic guarda cada pestaña en una sesión, las cierra todas y libera tu RAM. Restaura cuando quieras, sin cuenta.",
    downloadChromium: "Descargar para Chrome",
    downloadFirefox: "Descargar para Firefox",
    guide: "Cómo instalar",
    footer: "Local · Sin cuentas · Sin seguimiento · Todo se queda en tu navegador.",
  },
  fr: {
    tagline: "Extension Chrome & Firefox · Manifest V3",
    heroLead: "Trop d'onglets ?",
    heroAccent: "Déclarez faillite.",
    sub: "Un clic enregistre chaque onglet dans une session, les ferme tous et libère la RAM. Restaurez quand vous voulez.",
    downloadChromium: "Télécharger pour Chrome",
    downloadFirefox: "Télécharger pour Firefox",
    guide: "Guide d'installation",
    footer: "Local · Sans compte · Sans tracking · Vos données restent chez vous.",
  },
  de: {
    tagline: "Chrome- & Firefox-Erweiterung · Manifest V3",
    heroLead: "Tabs gehortet?",
    heroAccent: "Erklären Sie Bankrott.",
    sub: "Ein Klick speichert alle offenen Tabs in einer Sitzung, schließt sie und gibt RAM frei. Jederzeit wiederherstellen.",
    downloadChromium: "Für Chrome herunterladen",
    downloadFirefox: "Für Firefox herunterladen",
    guide: "Installationsanleitung",
    footer: "Lokal · Keine Konten · Kein Tracking.",
  },
  ar: {
    tagline: "امتداد كروم وفَيَرفوكس · Manifest V3",
    heroLead: "تكدس علاماتك؟",
    heroAccent: "أعلن الإفلاس.",
    sub: "بنقرة واحدة يحفظ كل علامة في جلسة، ويغلقها جميعًا، ويحرر الذاكرة. استعد في أي وقت.",
    downloadChromium: "تنزيل لكروم",
    downloadFirefox: "تنزيل لفَيَرفوكس",
    guide: "طريقة التثبيت",
    footer: "محلي · بدون حسابات · بدون تتبع.",
  },
  zh: {
    tagline: "Chrome 与 Firefox 扩展 · Manifest V3",
    heroLead: "标签太多？",
    heroAccent: "宣告破产。",
    sub: "一键将所有标签保存为命名会话，全部关闭并释放内存。随时恢复，无需账户。",
    downloadChromium: "下载 Chrome 版",
    downloadFirefox: "下载 Firefox 版",
    guide: "如何安装",
    footer: "本地优先 · 无账户 · 无跟踪。",
  },
  pt: {
    tagline: "Extensão do Chrome e Firefox · Manifest V3",
    heroLead: "Acumulando abas?",
    heroAccent: "Declare falência.",
    sub: "Um clique salva cada aba em uma sessão, fecha todas e libera sua RAM. Restaure quando quiser.",
    downloadChromium: "Baixar para Chrome",
    downloadFirefox: "Baixar para Firefox",
    guide: "Como instalar",
    footer: "Local · Sem contas · Sem rastreio.",
  },
  ja: {
    tagline: "Chrome & Firefox 拡張機能 · Manifest V3",
    heroLead: "タブが多すぎる？",
    heroAccent: "破産宣告を。",
    sub: "1クリックでタブをセッションに保存し、すべて閉じてメモリを解放。いつでも復元。",
    downloadChromium: "Chrome 版をダウンロード",
    downloadFirefox: "Firefox 版をダウンロード",
    guide: "インストール手順",
    footer: "ローカル優先・アカウント不要・トラッキングなし。",
  },
};

const tr = (lang: string, k: string) => I18N[lang]?.[k] ?? I18N.en[k] ?? k;

type Browser = "chromium" | "firefox";

function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [browser, setBrowser] = useState<Browser>("chromium");

  useEffect(() => {
    const stored = localStorage.getItem("tb_home_theme");
    const preferred =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setTheme(preferred);
    const storedLang = localStorage.getItem("tb_home_lang");
    if (storedLang && I18N[storedLang]) setLang(storedLang);
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("firefox")) setBrowser("firefox");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tb_home_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("tb_home_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const T = (k: string) => tr(lang, k);

  const download = (variant: Browser) => {
    const file =
      variant === "firefox" ? "tab-bankruptcy-firefox.zip" : "tab-bankruptcy-chromium.zip";
    fetch(`/${file}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-neutral-200/70 dark:border-neutral-900/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
              <Landmark size={16} className="text-white dark:text-neutral-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight">TabBankruptcy</h1>
              <p className="text-[10px] text-neutral-500 truncate">{T("tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <a
              href="#install"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 px-2"
            >
              <HelpCircle size={13} /> {T("guide")}
            </a>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[11px] font-medium uppercase"
              aria-label="Change language"
            >
              {lang}
            </button>
            {langOpen && (
              <div className="absolute right-10 top-10 z-30 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1 max-h-72 overflow-auto">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
                      lang === l.code ? "font-semibold" : ""
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-900">
        <FauxTabs />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-3 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles size={11} /> v1.4 · Auto-Archive & Ghost Checker
          </span>
          <h2 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            {T("heroLead")}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">{T("heroAccent")}</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-neutral-900/10 dark:bg-white/15 -z-0" />
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            {T("sub")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => download("chromium")}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-5 py-3 font-semibold hover:opacity-90 active:scale-[0.98] transition shadow-sm"
            >
              <Download size={18} />
              {T("downloadChromium")}
            </button>
            <button
              onClick={() => download("firefox")}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-3 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 active:scale-[0.98] transition"
            >
              <Download size={18} />
              {T("downloadFirefox")}
            </button>
            <a
              href="#install"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <HelpCircle size={16} />
              {T("guide")}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-500">
            <Chip>Chrome</Chip>
            <Chip>Edge</Chip>
            <Chip>Brave</Chip>
            <Chip>Opera</Chip>
            <Chip>Vivaldi</Chip>
            <Chip>Arc</Chip>
            <Chip>Kiwi (Android)</Chip>
            <Chip>Firefox</Chip>
            <Chip>Firefox for Android</Chip>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Feature grid */}
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Gavel size={16} />} title="Declare Bankruptcy" body="Names, saves, and closes every tab in one motion. RAM freed instantly." />
          <Feature icon={<Archive size={16} />} title="Session History" body="Every archive is stored locally on your machine. Search, tag, and add notes." />
          <Feature icon={<RotateCcw size={16} />} title="Restore Anytime" body="Reopen an entire session with a single click — new window or current one." />
          <Feature icon={<Keyboard size={16} />} title="Keyboard Shortcuts" body="Ctrl+Shift+X to declare, Ctrl+Shift+L to restore, Ctrl+Shift+B for dashboard." />
          <Feature icon={<Ghost size={16} />} title="Ghost Tab Checker" body="Scan idle, suspended, or duplicate tabs and nuke them safely — with undo." />
          <Feature icon={<FileJson size={16} />} title="Export & Import" body="Back up sessions and archives to JSON. Move them between browsers." />
          <Feature icon={<Search size={16} />} title="Search & Filters" body="Find any past session by name, tab title, URL, or tag." />
          <Feature icon={<ShieldCheck size={16} />} title="Local-first & Private" body="No accounts, no tracking. Optional sync to your own cloud endpoint." />
          <Feature icon={<Sparkles size={16} />} title="Auto-Archive" body="Idle tabs move to a side panel to save RAM until you need them back." />
        </section>

        {/* Install guide */}
        <section id="install" className="mt-24 scroll-mt-20">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {T("guide")}
              </p>
              <h3 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
                Install in 5 easy steps.
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
                Never installed a browser extension before? No problem. Pick your browser below and follow along — each step has a picture.
              </p>
            </div>

            {/* Browser switch */}
            <div
              className="inline-flex rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 bg-neutral-50 dark:bg-neutral-900"
              role="tablist"
            >
              <button
                role="tab"
                aria-selected={browser === "chromium"}
                onClick={() => setBrowser("chromium")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browser === "chromium"
                    ? "bg-white dark:bg-neutral-950 shadow-sm text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
                }`}
              >
                Chrome, Edge, Brave…
              </button>
              <button
                role="tab"
                aria-selected={browser === "firefox"}
                onClick={() => setBrowser("firefox")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browser === "firefox"
                    ? "bg-white dark:bg-neutral-950 shadow-sm text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
                }`}
              >
                Firefox
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {browser === "chromium" ? <ChromiumSteps onDownload={() => download("chromium")} /> : <FirefoxSteps onDownload={() => download("firefox")} />}
          </div>

          {/* FAQ */}
          <div className="mt-14">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle size={16} /> Common questions
            </h4>
            <div className="mt-4 space-y-2">
              <FAQ q="Is this safe? Why is Developer mode required?">
                Developer mode lets you load extensions that aren't yet on the Chrome Web Store or Firefox Add-ons directory. It doesn't give the extension any extra powers — TabBankruptcy only uses the permissions listed in its manifest (tabs, storage, downloads, alarms). All your data stays on your device unless you enable optional cloud sync.
              </FAQ>
              <FAQ q="What happens to my tabs when I 'Declare Bankruptcy'?">
                Every open tab in your current window (except pinned tabs, if you kept that option on) gets saved into a named session in your history. Then the extension opens a fresh blank tab and closes the rest — your RAM frees up immediately. You can restore the session anytime, in the same window or a new one.
              </FAQ>
              <FAQ q="Where is my data stored? Can I lose it?">
                Everything is saved to your browser's local storage. To back it up, use Export in the popup (or enable scheduled auto-export). You can also mirror to <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">chrome.storage.sync</code> or push to your own HTTPS endpoint in Options.
              </FAQ>
              <FAQ q="How do I update to a new version later?">
                Download the new zip from this page, unzip it, then on <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">chrome://extensions</code> click the refresh icon on the TabBankruptcy card and re-select the new folder. Your saved sessions stay intact.
              </FAQ>
              <FAQ q="Does it work on my phone?">
                Yes on Android: use <b>Kiwi Browser</b> or <b>Firefox for Android</b>, both support Manifest V3 unpacked installs. Not currently supported on iOS.
              </FAQ>
            </div>
          </div>
        </section>

        <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-900 py-8 text-xs text-neutral-500 flex flex-wrap items-center gap-2">
          <ShieldCheck size={13} /> {T("footer")}
        </footer>
      </div>
    </main>
  );
}

/* ---------------- components ---------------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 px-2.5 py-0.5">
      {children}
    </span>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition">
      <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          {icon}
        </span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{body}</p>
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
  visual,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
  visual: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
      <div className="grid md:grid-cols-[1fr_1.1fr]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm font-bold">
              {n}
            </span>
            <h5 className="text-lg font-semibold tracking-tight">{title}</h5>
          </div>
          <div className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 space-y-2">
            {body}
          </div>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-900/70 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 p-5 flex items-center justify-center">
          {visual}
        </div>
      </div>
    </div>
  );
}

function ChromiumSteps({ onDownload }: { onDownload: () => void }) {
  return (
    <>
      <StepCard
        n={1}
        title="Download the Chrome zip"
        body={
          <>
            <p>Click the button to save the extension file to your computer.</p>
            <button
              onClick={onDownload}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 text-xs font-semibold hover:opacity-90"
            >
              <Download size={13} /> tab-bankruptcy-chromium.zip
            </button>
          </>
        }
        visual={<ZipVisual name="tab-bankruptcy-chromium.zip" />}
      />
      <StepCard
        n={2}
        title="Unzip the file"
        body={
          <>
            <p>
              Find the zip in your <b>Downloads</b> folder. Right-click it and pick{" "}
              <b>Extract All…</b> (Windows) or double-click it (Mac). You'll get a folder called{" "}
              <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">tab-bankruptcy-chromium</code>.
            </p>
            <p className="text-xs text-neutral-500">
              Remember where you put this folder — you'll point Chrome at it in step 4.
            </p>
          </>
        }
        visual={<FolderVisual />}
      />
      <StepCard
        n={3}
        title="Open the Extensions page"
        body={
          <>
            <p>
              In Chrome (or Edge, Brave, Arc, Opera, Vivaldi), copy this address into the address
              bar and press Enter:
            </p>
            <CopyBox text="chrome://extensions" />
            <p className="text-xs text-neutral-500">
              On Edge use <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">edge://extensions</code>, on Brave{" "}
              <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">brave://extensions</code>.
            </p>
          </>
        }
        visual={<BrowserBar url="chrome://extensions" />}
      />
      <StepCard
        n={4}
        title="Turn on Developer mode"
        body={
          <>
            <p>
              Look at the <b>top-right corner</b> of that page — flip the{" "}
              <b>Developer mode</b> toggle to on. A new row of buttons appears.
            </p>
            <p className="text-xs text-neutral-500">
              This just lets Chrome load extensions from a folder. You can turn it back off later — TabBankruptcy will keep working.
            </p>
          </>
        }
        visual={<DevToggleVisual />}
      />
      <StepCard
        n={5}
        title="Click ‘Load unpacked’ and pick the folder"
        body={
          <>
            <p>
              Click <b>Load unpacked</b>, then select the{" "}
              <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">tab-bankruptcy-chromium</code> folder from step 2.
              You'll see the TabBankruptcy card appear on the page.
            </p>
            <p className="text-xs text-neutral-500">
              Finally, click the puzzle-piece icon <Puzzle size={11} className="inline align-[-1px]" /> in the toolbar and pin TabBankruptcy so it's always one click away.
            </p>
          </>
        }
        visual={<LoadUnpackedVisual />}
      />
    </>
  );
}

function FirefoxSteps({ onDownload }: { onDownload: () => void }) {
  return (
    <>
      <StepCard
        n={1}
        title="Download the Firefox zip"
        body={
          <>
            <p>Save the Firefox build to your computer.</p>
            <button
              onClick={onDownload}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3.5 py-2 text-xs font-semibold hover:opacity-90"
            >
              <Download size={13} /> tab-bankruptcy-firefox.zip
            </button>
            <p className="text-xs text-neutral-500">
              You do <b>not</b> need to unzip this one — Firefox loads the zip directly.
            </p>
          </>
        }
        visual={<ZipVisual name="tab-bankruptcy-firefox.zip" />}
      />
      <StepCard
        n={2}
        title="Open the debugging page"
        body={
          <>
            <p>Copy this address into Firefox's address bar and press Enter:</p>
            <CopyBox text="about:debugging#/runtime/this-firefox" />
          </>
        }
        visual={<BrowserBar url="about:debugging#/runtime/this-firefox" firefox />}
      />
      <StepCard
        n={3}
        title="Click ‘Load Temporary Add-on…’"
        body={
          <>
            <p>
              On that page you'll see a button labelled <b>Load Temporary Add-on…</b> — click it.
              A file picker opens.
            </p>
          </>
        }
        visual={<LoadTempVisual />}
      />
      <StepCard
        n={4}
        title="Select the downloaded zip"
        body={
          <>
            <p>
              Pick the <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1 text-[11px]">tab-bankruptcy-firefox.zip</code> file from your Downloads folder. TabBankruptcy will appear in the list of temporary extensions.
            </p>
          </>
        }
        visual={<FolderVisual firefox />}
      />
      <StepCard
        n={5}
        title="Pin it to your toolbar"
        body={
          <>
            <p>
              Click the puzzle piece <Puzzle size={11} className="inline align-[-1px]" /> in the top-right of Firefox, find TabBankruptcy, and pin it. You're done.
            </p>
            <p className="text-xs text-neutral-500">
              Heads-up: Firefox removes temporary add-ons when you fully quit the browser. To make it permanent, we recommend using a Firefox Developer or Nightly build, or waiting for the AMO listing.
            </p>
          </>
        }
        visual={<PinVisual />}
      />
    </>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-neutral-200 dark:border-neutral-800 open:bg-neutral-50 dark:open:bg-neutral-900/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium">
        {q}
        <ChevronDown
          size={16}
          className="text-neutral-400 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {children}
      </div>
    </details>
  );
}

/* ---------------- visual mocks ---------------- */

function FauxTabs() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-24 pointer-events-none opacity-[0.55] dark:opacity-30 overflow-hidden"
    >
      <div className="flex gap-1 px-4 pt-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="h-7 flex-1 min-w-[80px] rounded-t-lg border border-b-0 border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
          />
        ))}
      </div>
      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="mt-1 inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <code>{text}</code>
      <span className="text-[10px] uppercase tracking-widest text-neutral-500">
        {copied ? "copied" : "click to copy"}
      </span>
    </button>
  );
}

function ZipVisual({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="h-24 w-20 rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 flex flex-col items-center justify-center shadow-sm">
          <div className="flex flex-col gap-1 items-center">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-1 w-4 bg-neutral-300 dark:bg-neutral-700 rounded-sm" />
            ))}
          </div>
          <span className="mt-2 text-[9px] font-bold text-neutral-400">ZIP</span>
        </div>
        <Download
          size={14}
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 p-1 border-2 border-neutral-50 dark:border-neutral-900"
        />
      </div>
      <code className="text-[10px] text-neutral-500 font-mono">{name}</code>
    </div>
  );
}

function FolderVisual({ firefox = false }: { firefox?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <FolderOpen size={64} className="text-neutral-400 dark:text-neutral-600" strokeWidth={1.3} />
      </div>
      <code className="text-[10px] text-neutral-500 font-mono">
        {firefox ? "Downloads/" : "tab-bankruptcy-chromium/"}
      </code>
    </div>
  );
}

function BrowserBar({ url, firefox = false }: { url: string; firefox?: boolean }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-400">
          {firefox ? "Firefox" : "Chrome"}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <code className="text-[11px] font-mono truncate">{url}</code>
        </div>
      </div>
    </div>
  );
}

function DevToggleVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400">Extensions</span>
        <div className="flex items-center gap-2 text-[11px] font-medium">
          Developer mode
          <span className="relative inline-flex h-4 w-7 rounded-full bg-neutral-900 dark:bg-white">
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white dark:bg-neutral-900" />
          </span>
        </div>
      </div>
      <div className="flex gap-1.5 p-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold">
          Load unpacked
        </span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">
          Pack extension
        </span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">
          Update
        </span>
      </div>
      <div className="p-3 flex items-center gap-1 text-[10px] text-neutral-400">
        <ToggleRight size={12} /> Turn on the toggle in the top-right corner.
      </div>
    </div>
  );
}

function LoadUnpackedVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex gap-1.5 p-2 border-b border-neutral-200 dark:border-neutral-800">
        <span className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-1 text-[10px] font-bold shadow">
          Load unpacked
        </span>
        <span className="rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-[10px] text-neutral-500">
          Pack extension
        </span>
      </div>
      <div className="p-3 space-y-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 flex items-center gap-2">
          <Landmark size={14} className="text-neutral-500" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold">TabBankruptcy</div>
            <div className="text-[9px] text-neutral-500 truncate">Save every open tab into a session…</div>
          </div>
          <span className="text-[9px] font-mono text-neutral-400">1.4.0</span>
        </div>
      </div>
    </div>
  );
}

function LoadTempVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-400">
        Temporary Extensions
      </div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-[11px] text-neutral-500">This Firefox</span>
        <span className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2.5 py-1 text-[10px] font-bold shadow">
          Load Temporary Add-on…
        </span>
      </div>
    </div>
  );
}

function PinVisual() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
        <Puzzle size={14} className="text-neutral-500" />
        <div className="h-6 w-6 rounded-md bg-neutral-900 dark:bg-white flex items-center justify-center">
          <Landmark size={11} className="text-white dark:text-neutral-900" />
        </div>
      </div>
      <div className="p-3">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 flex items-center gap-2">
          <Landmark size={13} className="text-neutral-500" />
          <div className="flex-1 text-[11px] font-semibold">TabBankruptcy</div>
          <Pin size={12} className="text-neutral-900 dark:text-white" />
        </div>
      </div>
    </div>
  );
}
