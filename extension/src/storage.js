export const STORAGE_KEY = "tb_sessions";
export const SETTINGS_KEY = "tb_settings";

export const DEFAULT_SETTINGS = {
  namePrefix: "Session",
  dateFormat: "short",
  confirmBeforeClose: true,
  skipConfirmOnShortcut: false,
  ignorePinned: true,
  ignoreChromeInternal: true,
  ignoreExtensionPages: true,
  excludePatterns: "",
  theme: "system",
  language: "en",
  autoExportFrequency: "off",
};

export const isExtension =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

export const getItem = (key, fallback) =>
  new Promise((resolve) => {
    if (!isExtension) {
      try {
        const v = localStorage.getItem(key);
        resolve(v ? JSON.parse(v) : fallback);
      } catch {
        resolve(fallback);
      }
      return;
    }
    chrome.storage.local.get([key], (res) => resolve(res[key] ?? fallback));
  });

export const setItem = (key, value) =>
  new Promise((resolve) => {
    if (!isExtension) {
      localStorage.setItem(key, JSON.stringify(value));
      return resolve();
    }
    chrome.storage.local.set({ [key]: value }, resolve);
  });

export const queryTabs = () =>
  new Promise((resolve) => {
    if (!isExtension) return resolve([]);
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs || []));
  });

export const buildName = (settings) => {
  const d = new Date();
  const prefix = settings.namePrefix?.trim() || "Session";
  if (settings.dateFormat === "iso")
    return `${prefix} — ${d.toISOString().slice(0, 16).replace("T", " ")}`;
  if (settings.dateFormat === "time")
    return `${prefix} — ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const month = d.toLocaleString("en-US", { month: "short" });
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${prefix} — ${month} ${d.getDate()}, ${hh}:${mm}`;
};

export const shouldIncludeTab = (tab, settings) => {
  if (!tab.url) return false;
  if (settings.ignoreExtensionPages && tab.url.startsWith("chrome-extension://")) return false;
  if (
    settings.ignoreChromeInternal &&
    (tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("brave://") ||
      tab.url.startsWith("about:"))
  )
    return false;
  if (settings.ignorePinned && tab.pinned) return false;
  const patterns = (settings.excludePatterns || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (patterns.some((p) => tab.url.includes(p))) return false;
  return true;
};
