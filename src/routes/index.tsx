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
  Settings as SettingsIcon,
  FileJson,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TabBankruptcy — Declare bankruptcy on your browser tabs" },
      {
        name: "description",
        content:
          "A Chrome extension that saves all your open tabs into a named session, closes them, and lets you restore any time. Free your RAM in one click.",
      },
      { property: "og:title", content: "TabBankruptcy — File for tab relief" },
      {
        property: "og:description",
        content:
          "Save all your open tabs, close them, restore later. One-click tab bankruptcy for Chrome.",
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
    tagline: "A Chrome extension · Manifest V3",
    heroLead: "Hoarding tabs?",
    heroAccent: "Declare bankruptcy.",
    sub: "One click saves every open tab into a named session, closes them all, and frees your RAM. Restore anytime.",
    download: "Download extension (.zip)",
    guide: "Install guide",
    fDeclare: "Declare Bankruptcy",
    fDeclareBody: "Names, saves, and closes every tab in one motion.",
    fHistory: "Session History",
    fHistoryBody: "Every archive is safely stored locally on your machine.",
    fRestore: "Restore Anytime",
    fRestoreBody: "Reopen an entire session with a single click.",
    fShortcuts: "Keyboard shortcuts",
    fShortcutsBody: "Declare, restore, and open the dashboard without touching the mouse.",
    fSearch: "Search & filter",
    fSearchBody: "Find any past session by name, tab title, or URL.",
    fBackup: "Export & import",
    fBackupBody: "Back up your sessions to JSON and move them between browsers.",
    installTitle: "Install it",
    step1: "Download and unzip the file above.",
    step2: "Open ",
    step2b: " in Chrome (also works in Edge, Brave, Arc, Opera).",
    step3a: "Enable ",
    step3b: "Developer mode",
    step3c: " (toggle in the top-right).",
    step4a: "Click ",
    step4b: "Load unpacked",
    step4c: " and select the unzipped folder.",
    step5: "Pin TabBankruptcy from the extensions menu and start filing.",
    footer: "Local-first · No accounts · No tracking · Data stays in your browser.",
  },
  es: {
    tagline: "Extensión de Chrome · Manifest V3",
    heroLead: "¿Acumulas pestañas?",
    heroAccent: "Declara la bancarrota.",
    sub: "Con un clic guarda cada pestaña abierta en una sesión, las cierra todas y libera tu RAM. Restaura cuando quieras.",
    download: "Descargar extensión (.zip)",
    guide: "Guía de instalación",
    fDeclare: "Declarar bancarrota",
    fDeclareBody: "Nombra, guarda y cierra cada pestaña en un solo gesto.",
    fHistory: "Historial de sesiones",
    fHistoryBody: "Cada archivo se guarda localmente en tu equipo.",
    fRestore: "Restaurar en cualquier momento",
    fRestoreBody: "Reabre toda una sesión con un clic.",
    fShortcuts: "Atajos de teclado",
    fShortcutsBody: "Declara, restaura y abre el panel sin usar el ratón.",
    fSearch: "Buscar y filtrar",
    fSearchBody: "Encuentra cualquier sesión por nombre, título o URL.",
    fBackup: "Exportar e importar",
    fBackupBody: "Respalda tus sesiones en JSON y muévelas entre navegadores.",
    installTitle: "Instalación",
    step1: "Descarga y descomprime el archivo.",
    step2: "Abre ", step2b: " en Chrome (también funciona en Edge, Brave, Arc, Opera).",
    step3a: "Activa ", step3b: "Modo de desarrollador", step3c: " (arriba a la derecha).",
    step4a: "Haz clic en ", step4b: "Cargar descomprimida", step4c: " y elige la carpeta.",
    step5: "Fija TabBankruptcy desde el menú de extensiones.",
    footer: "Local · Sin cuentas · Sin seguimiento · Todo se queda en tu navegador.",
  },
  fr: {
    tagline: "Extension Chrome · Manifest V3",
    heroLead: "Trop d'onglets ?",
    heroAccent: "Déclarez faillite.",
    sub: "Un clic enregistre chaque onglet dans une session nommée, les ferme tous et libère votre RAM. Restaurez quand vous voulez.",
    download: "Télécharger (.zip)", guide: "Guide d'installation",
    fDeclare: "Déclarer faillite", fDeclareBody: "Nomme, enregistre et ferme tous les onglets d'un geste.",
    fHistory: "Historique", fHistoryBody: "Chaque archive est stockée localement.",
    fRestore: "Restauration", fRestoreBody: "Rouvrez une session entière en un clic.",
    fShortcuts: "Raccourcis clavier", fShortcutsBody: "Déclarez, restaurez, ouvrez le panneau sans souris.",
    fSearch: "Recherche & filtres", fSearchBody: "Retrouvez une session par nom, titre ou URL.",
    fBackup: "Export & import", fBackupBody: "Sauvegardez vos sessions en JSON.",
    installTitle: "Installation",
    step1: "Téléchargez et décompressez.",
    step2: "Ouvrez ", step2b: " dans Chrome (aussi Edge, Brave, Arc, Opera).",
    step3a: "Activez le ", step3b: "Mode développeur", step3c: " (coin supérieur droit).",
    step4a: "Cliquez sur ", step4b: "Charger l'extension non empaquetée", step4c: " et sélectionnez le dossier.",
    step5: "Épinglez TabBankruptcy depuis le menu.",
    footer: "Local · Sans compte · Sans tracking · Vos données restent chez vous.",
  },
  de: {
    tagline: "Chrome-Erweiterung · Manifest V3",
    heroLead: "Tabs gehortet?",
    heroAccent: "Erklären Sie Bankrott.",
    sub: "Ein Klick speichert alle offenen Tabs in einer Sitzung, schließt sie und gibt RAM frei. Jederzeit wiederherstellen.",
    download: "Erweiterung (.zip) herunterladen", guide: "Installationsanleitung",
    fDeclare: "Bankrott erklären", fDeclareBody: "Benennt, speichert und schließt jeden Tab.",
    fHistory: "Sitzungsverlauf", fHistoryBody: "Jedes Archiv wird lokal gespeichert.",
    fRestore: "Jederzeit wiederherstellen", fRestoreBody: "Ganze Sitzung mit einem Klick öffnen.",
    fShortcuts: "Tastenkürzel", fShortcutsBody: "Bankrott, Wiederherstellung, Panel — ohne Maus.",
    fSearch: "Suche & Filter", fSearchBody: "Finden Sie Sitzungen nach Name, Titel oder URL.",
    fBackup: "Export & Import", fBackupBody: "Sichern Sie Sitzungen als JSON.",
    installTitle: "Installation",
    step1: "Datei herunterladen und entpacken.",
    step2: "Öffnen Sie ", step2b: " in Chrome (auch Edge, Brave, Arc, Opera).",
    step3a: "Aktivieren Sie den ", step3b: "Entwicklermodus", step3c: " (oben rechts).",
    step4a: "Klicken Sie auf ", step4b: "Entpackte Erweiterung laden", step4c: " und wählen Sie den Ordner.",
    step5: "TabBankruptcy im Menü anheften.",
    footer: "Lokal · Keine Konten · Kein Tracking.",
  },
  ar: {
    tagline: "امتداد كروم · Manifest V3",
    heroLead: "تكدس علاماتك؟", heroAccent: "أعلن الإفلاس.",
    sub: "بنقرة واحدة يحفظ كل علامة مفتوحة في جلسة، ويغلقها جميعًا، ويحرر الذاكرة. استعد في أي وقت.",
    download: "تنزيل الامتداد (.zip)", guide: "دليل التثبيت",
    fDeclare: "أعلن الإفلاس", fDeclareBody: "يسمي ويحفظ ويغلق كل العلامات دفعة واحدة.",
    fHistory: "سجل الجلسات", fHistoryBody: "كل أرشيف محفوظ محليًا.",
    fRestore: "استعادة", fRestoreBody: "افتح جلسة كاملة بنقرة.",
    fShortcuts: "اختصارات لوحة المفاتيح", fShortcutsBody: "تحكم كامل بدون فأرة.",
    fSearch: "بحث وفلاتر", fSearchBody: "ابحث بالاسم أو العنوان أو الرابط.",
    fBackup: "تصدير واستيراد", fBackupBody: "انسخ جلساتك بتنسيق JSON.",
    installTitle: "طريقة التثبيت",
    step1: "نزّل الملف وفك ضغطه.",
    step2: "افتح ", step2b: " في كروم (يعمل أيضًا في Edge وBrave).",
    step3a: "فعّل ", step3b: "وضع المطور", step3c: " (أعلى اليمين).",
    step4a: "انقر على ", step4b: "تحميل غير مضغوط", step4c: " واختر المجلد.",
    step5: "ثبّت TabBankruptcy من قائمة الامتدادات.",
    footer: "محلي · بدون حسابات · بدون تتبع.",
  },
  zh: {
    tagline: "Chrome 扩展 · Manifest V3",
    heroLead: "标签太多？", heroAccent: "宣告破产。",
    sub: "一键将所有打开的标签保存到一个命名会话，全部关闭并释放内存。随时恢复。",
    download: "下载扩展 (.zip)", guide: "安装指南",
    fDeclare: "宣告破产", fDeclareBody: "一次命名、保存并关闭全部标签。",
    fHistory: "会话历史", fHistoryBody: "所有存档均本地保存。",
    fRestore: "随时恢复", fRestoreBody: "一键重新打开整个会话。",
    fShortcuts: "快捷键", fShortcutsBody: "无需鼠标即可完成一切操作。",
    fSearch: "搜索与筛选", fSearchBody: "按名称、标题或 URL 查找。",
    fBackup: "导入导出", fBackupBody: "将会话备份为 JSON。",
    installTitle: "安装",
    step1: "下载并解压压缩包。",
    step2: "在 Chrome 中打开 ", step2b: "（Edge、Brave、Arc、Opera 亦可）。",
    step3a: "开启 ", step3b: "开发者模式", step3c: "（右上角）。",
    step4a: "点击 ", step4b: "加载已解压的扩展", step4c: "，选择文件夹。",
    step5: "在扩展菜单中固定 TabBankruptcy。",
    footer: "本地优先 · 无账户 · 无跟踪。",
  },
  pt: {
    tagline: "Extensão do Chrome · Manifest V3",
    heroLead: "Acumulando abas?", heroAccent: "Declare falência.",
    sub: "Um clique salva cada aba em uma sessão, fecha todas e libera sua RAM. Restaure quando quiser.",
    download: "Baixar extensão (.zip)", guide: "Guia de instalação",
    fDeclare: "Declarar falência", fDeclareBody: "Nomeia, salva e fecha todas as abas.",
    fHistory: "Histórico", fHistoryBody: "Tudo salvo localmente.",
    fRestore: "Restaurar", fRestoreBody: "Reabra a sessão com um clique.",
    fShortcuts: "Atalhos", fShortcutsBody: "Controle total sem o mouse.",
    fSearch: "Busca e filtros", fSearchBody: "Encontre sessões por nome, título ou URL.",
    fBackup: "Exportar & importar", fBackupBody: "Backup em JSON entre navegadores.",
    installTitle: "Como instalar",
    step1: "Baixe e descompacte o arquivo.",
    step2: "Abra ", step2b: " no Chrome (também Edge, Brave, Arc, Opera).",
    step3a: "Ative o ", step3b: "Modo de desenvolvedor", step3c: " (canto superior direito).",
    step4a: "Clique em ", step4b: "Carregar sem compactação", step4c: " e selecione a pasta.",
    step5: "Fixe o TabBankruptcy no menu.",
    footer: "Local · Sem contas · Sem rastreio.",
  },
  ja: {
    tagline: "Chrome 拡張機能 · Manifest V3",
    heroLead: "タブが多すぎる？", heroAccent: "破産宣告を。",
    sub: "1クリックで開いているタブをセッションに保存し、すべて閉じてメモリを解放。いつでも復元できます。",
    download: "拡張機能を .zip でダウンロード", guide: "インストール手順",
    fDeclare: "破産宣告", fDeclareBody: "命名・保存・閉鎖を一挙に。",
    fHistory: "セッション履歴", fHistoryBody: "すべてローカルに保存。",
    fRestore: "いつでも復元", fRestoreBody: "ワンクリックでセッション全体を再オープン。",
    fShortcuts: "キーボードショートカット", fShortcutsBody: "マウスなしで全操作。",
    fSearch: "検索とフィルタ", fSearchBody: "名前・タイトル・URL で検索。",
    fBackup: "エクスポート & インポート", fBackupBody: "セッションを JSON でバックアップ。",
    installTitle: "インストール",
    step1: "ファイルをダウンロードして解凍。",
    step2: "Chrome で ", step2b: " を開く (Edge, Brave なども可)。",
    step3a: "右上の ", step3b: "デベロッパーモード", step3c: " をオン。",
    step4a: "「", step4b: "パッケージ化されていない拡張機能を読み込む", step4c: "」をクリックしフォルダを選択。",
    step5: "拡張メニューから TabBankruptcy をピン留め。",
    footer: "ローカル優先・アカウント不要・トラッキングなし。",
  },
};

const tr = (lang: string, k: string) => I18N[lang]?.[k] ?? I18N.en[k] ?? k;

function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);

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

  const download = () => {
    fetch("/tab-bankruptcy.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "tab-bankruptcy.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
              <Landmark size={20} className="text-white dark:text-neutral-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">TabBankruptcy</h1>
              <p className="text-xs text-neutral-500 truncate">{T("tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-medium uppercase"
            >
              {lang}
            </button>
            {langOpen && (
              <div className="absolute right-12 top-11 z-10 w-40 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-1 max-h-72 overflow-auto">
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
              className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Hero */}
        <h2 className="mt-12 text-4xl font-bold tracking-tight sm:text-5xl">
          {T("heroLead")}{" "}
          <span className="underline decoration-neutral-900 dark:decoration-white decoration-[3px] underline-offset-4">
            {T("heroAccent")}
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">{T("sub")}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-5 py-3 font-semibold hover:opacity-90 active:scale-[0.98] transition"
          >
            <Download size={18} />
            {T("download")}
          </button>
          <a
            href="#install"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-3 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            {T("guide")}
          </a>
        </div>

        {/* Features */}
        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          <Feature icon={<Gavel size={18} />} title={T("fDeclare")} body={T("fDeclareBody")} />
          <Feature icon={<Archive size={18} />} title={T("fHistory")} body={T("fHistoryBody")} />
          <Feature icon={<RotateCcw size={18} />} title={T("fRestore")} body={T("fRestoreBody")} />
          <Feature icon={<Keyboard size={18} />} title={T("fShortcuts")} body={T("fShortcutsBody")} />
          <Feature icon={<Search size={18} />} title={T("fSearch")} body={T("fSearchBody")} />
          <Feature icon={<FileJson size={18} />} title={T("fBackup")} body={T("fBackupBody")} />
        </section>

        {/* Install */}
        <section id="install" className="mt-16">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon size={16} /> {T("installTitle")}
          </h3>
          <ol className="mt-4 space-y-3 text-sm">
            <Step n={1}>{T("step1")}</Step>
            <Step n={2}>
              {T("step2")}
              <code className="rounded bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 text-xs">
                chrome://extensions
              </code>
              {T("step2b")}
            </Step>
            <Step n={3}>
              {T("step3a")}<b>{T("step3b")}</b>{T("step3c")}
            </Step>
            <Step n={4}>
              {T("step4a")}<b>{T("step4b")}</b>{T("step4c")}
            </Step>
            <Step n={5}>{T("step5")}</Step>
          </ol>
        </section>

        <footer className="mt-16 border-t border-neutral-200 dark:border-neutral-900 pt-6 text-xs text-neutral-500">
          {T("footer")}
        </footer>
      </div>
    </main>
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
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{body}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
        {n}
      </span>
      <span className="pt-0.5 text-neutral-700 dark:text-neutral-300">{children}</span>
    </li>
  );
}
