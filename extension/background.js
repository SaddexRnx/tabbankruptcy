// TabBankruptcy background service worker
// Handles keyboard shortcuts so users can declare/restore without opening the popup.

const STORAGE_KEY = "tb_sessions";
const SETTINGS_KEY = "tb_settings";

const DEFAULT_SETTINGS = {
  namePrefix: "Session",
  dateFormat: "short", // "short" | "iso" | "time"
  confirmBeforeClose: true,
  skipConfirmOnShortcut: false,
  ignorePinned: true,
  ignoreChromeInternal: true,
  ignoreExtensionPages: true,
  excludePatterns: "", // newline-separated substrings
  theme: "system", // "light" | "dark" | "system"
  language: "en",
};

const get = (key, fallback) =>
  new Promise((resolve) =>
    chrome.storage.local.get([key], (res) => resolve(res[key] ?? fallback))
  );

const set = (key, value) =>
  new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));

const getSettings = async () => ({
  ...DEFAULT_SETTINGS,
  ...(await get(SETTINGS_KEY, {})),
});

const defaultName = (settings) => {
  const d = new Date();
  const prefix = settings.namePrefix?.trim() || "Session";
  if (settings.dateFormat === "iso") return `${prefix} — ${d.toISOString().slice(0, 16).replace("T", " ")}`;
  if (settings.dateFormat === "time")
    return `${prefix} — ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const month = d.toLocaleString("en-US", { month: "short" });
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${prefix} — ${month} ${d.getDate()}, ${hh}:${mm}`;
};

const shouldIncludeTab = (tab, settings) => {
  if (!tab.url) return false;
  if (settings.ignoreExtensionPages && tab.url.startsWith("chrome-extension://")) return false;
  if (settings.ignoreChromeInternal &&
    (tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("brave://") ||
      tab.url.startsWith("about:")))
    return false;
  if (settings.ignorePinned && tab.pinned) return false;
  const patterns = (settings.excludePatterns || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (patterns.some((p) => tab.url.includes(p))) return false;
  return true;
};

const declareBankruptcy = async () => {
  const settings = await getSettings();
  const tabs = await new Promise((r) =>
    chrome.tabs.query({ currentWindow: true }, (t) => r(t || []))
  );
  const savable = tabs.filter((t) => shouldIncludeTab(t, settings));
  if (savable.length === 0) return;

  const sessions = await get(STORAGE_KEY, []);
  const session = {
    id: crypto.randomUUID(),
    name: defaultName(settings),
    createdAt: Date.now(),
    tabs: savable.map((t) => ({
      url: t.url,
      title: t.title || t.url,
      favIconUrl: t.favIconUrl || "",
    })),
  };
  await set(STORAGE_KEY, [session, ...sessions]);

  chrome.tabs.create({ url: "chrome://newtab" }, (freshTab) => {
    const toClose = tabs
      .filter((t) => t.id !== freshTab.id && !(settings.ignorePinned && t.pinned))
      .map((t) => t.id);
    if (toClose.length) chrome.tabs.remove(toClose);
  });
};

const restoreLast = async () => {
  const sessions = await get(STORAGE_KEY, []);
  if (!sessions.length) return;
  const last = sessions.sort((a, b) => b.createdAt - a.createdAt)[0];
  for (const t of last.tabs) chrome.tabs.create({ url: t.url, active: false });
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("TabBankruptcy installed");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "declare_bankruptcy") {
    const settings = await getSettings();
    if (settings.confirmBeforeClose && !settings.skipConfirmOnShortcut) {
      chrome.action.openPopup?.().catch(() => {});
      return;
    }
    declareBankruptcy();
  } else if (command === "restore_last") {
    restoreLast();
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "DECLARE_BANKRUPTCY") {
    declareBankruptcy().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "RESTORE_LAST") {
    restoreLast().then(() => sendResponse({ ok: true }));
    return true;
  }
});
