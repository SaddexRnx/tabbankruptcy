export const STORAGE_KEY = "tb_sessions";
export const SETTINGS_KEY = "tb_settings";
export const AUTO_ARCHIVE_KEY = "tb_auto_archive";

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
  // Auto export
  autoExportFrequency: "off",
  autoExportTime: "03:00",
  autoExportTimezone: "",
  // Restore behavior
  dedupOnRestore: true,
  restoreInNewWindow: false,
  // Cloud sync
  syncToStorageSync: false,
  cloudEndpointUrl: "",
  cloudEndpointToken: "",
  cloudAutoPush: false,
  // Auto-archive (idle tab → side panel)
  autoArchive: {
    enabled: false,
    idleMinutes: 30,     // tab must be idle at least this long
    keepPinned: true,    // never touch pinned tabs
    keepAudible: true,   // never touch audible/playing tabs
    max: 300,            // cap archive size
  },
  // Ghost checker
  skipGhostConfirm: false,
  ghostIdleMinutes: 60,
};

export const isExtension =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

export const getItem = (key, fallback) =>
  new Promise((resolve) => {
    if (!isExtension) {
      try {
        const v = localStorage.getItem(key);
        resolve(v ? JSON.parse(v) : fallback);
      } catch { resolve(fallback); }
      return;
    }
    chrome.storage.local.get([key], (res) => resolve(res[key] ?? fallback));
  });

export const setItem = (key, value) =>
  new Promise((resolve) => {
    if (!isExtension) { localStorage.setItem(key, JSON.stringify(value)); return resolve(); }
    chrome.storage.local.set({ [key]: value }, resolve);
  });

export const queryTabs = () =>
  new Promise((resolve) => {
    if (!isExtension) return resolve([]);
    chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs || []));
  });

export const queryAllTabs = () =>
  new Promise((resolve) => {
    if (!isExtension) return resolve([]);
    chrome.tabs.query({}, (tabs) => resolve(tabs || []));
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
  if (settings.ignoreExtensionPages && tab.url.startsWith("moz-extension://")) return false;
  if (
    settings.ignoreChromeInternal &&
    (tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("brave://") ||
      tab.url.startsWith("opera://") ||
      tab.url.startsWith("vivaldi://") ||
      tab.url.startsWith("about:"))
  )
    return false;
  if (settings.ignorePinned && tab.pinned) return false;
  const patterns = (settings.excludePatterns || "")
    .split("\n").map((s) => s.trim()).filter(Boolean);
  if (patterns.some((p) => tab.url.includes(p))) return false;
  return true;
};

// Session versioning
export const CURRENT_SESSION_VERSION = 2;

export const upgradeSession = (s) => ({
  id: s.id || crypto.randomUUID(),
  name: s.name || "Untitled",
  createdAt: s.createdAt || Date.now(),
  updatedAt: s.updatedAt || s.createdAt || Date.now(),
  notes: s.notes || "",
  tags: Array.isArray(s.tags) ? s.tags : [],
  tabs: (s.tabs || []).map((t) => ({
    url: t.url,
    title: t.title || t.url,
    favIconUrl: t.favIconUrl || "",
  })),
  version: s.version || CURRENT_SESSION_VERSION,
  revisions: Array.isArray(s.revisions) ? s.revisions : [],
});

export const snapshotRevision = (s, reason = "edit") => ({
  revisedAt: Date.now(),
  reason,
  name: s.name,
  notes: s.notes || "",
  tags: [...(s.tags || [])],
  tabs: s.tabs.map((t) => ({ ...t })),
});

export const pushRevision = (session, reason) => {
  const revs = [snapshotRevision(session, reason), ...(session.revisions || [])];
  return { ...session, revisions: revs.slice(0, 20), updatedAt: Date.now() };
};
