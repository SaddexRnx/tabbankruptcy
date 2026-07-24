// TabBankruptcy background service worker (Chromium) / background script (Firefox).
// Handles keyboard shortcuts, scheduled auto-export with tz + time-of-day,
// storage.sync mirror, custom cloud endpoint push/pull.

const STORAGE_KEY = "tb_sessions";
const SETTINGS_KEY = "tb_settings";
const AUTO_EXPORT_ALARM = "tb_auto_export";
const CLOUD_PUSH_ALARM = "tb_cloud_push";
const CURRENT_SESSION_VERSION = 2;

const DEFAULT_SETTINGS = {
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
  autoExportTime: "03:00",
  autoExportTimezone: "",
  dedupOnRestore: true,
  restoreInNewWindow: false,
  syncToStorageSync: false,
  cloudEndpointUrl: "",
  cloudEndpointToken: "",
  cloudAutoPush: false,
};

const get = (key, fallback) =>
  new Promise((resolve) => chrome.storage.local.get([key], (r) => resolve(r[key] ?? fallback)));
const set = (key, value) =>
  new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));
const getSettings = async () => ({ ...DEFAULT_SETTINGS, ...(await get(SETTINGS_KEY, {})) });

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
  if (settings.ignoreExtensionPages && (tab.url.startsWith("chrome-extension://") || tab.url.startsWith("moz-extension://"))) return false;
  if (settings.ignoreChromeInternal && /^(chrome|edge|brave|opera|vivaldi):\/\/|^about:/.test(tab.url)) return false;
  if (settings.ignorePinned && tab.pinned) return false;
  const patterns = (settings.excludePatterns || "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (patterns.some((p) => tab.url.includes(p))) return false;
  return true;
};

const declareBankruptcy = async () => {
  const settings = await getSettings();
  const tabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, (t) => r(t || [])));
  const savable = tabs.filter((t) => shouldIncludeTab(t, settings));
  if (savable.length === 0) return;
  const sessions = await get(STORAGE_KEY, []);
  const session = {
    id: crypto.randomUUID(),
    name: defaultName(settings),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: CURRENT_SESSION_VERSION,
    notes: "",
    tags: [],
    revisions: [],
    tabs: savable.map((t) => ({ url: t.url, title: t.title || t.url, favIconUrl: t.favIconUrl || "" })),
  };
  await set(STORAGE_KEY, [session, ...sessions]);
  chrome.tabs.create({ url: "about:blank" }, (freshTab) => {
    const toClose = tabs
      .filter((t) => t.id !== freshTab.id && !(settings.ignorePinned && t.pinned))
      .map((t) => t.id);
    if (toClose.length) chrome.tabs.remove(toClose);
  });
};

const restoreLast = async () => {
  const sessions = await get(STORAGE_KEY, []);
  if (!sessions.length) return;
  const settings = await getSettings();
  const last = sessions.sort((a, b) => b.createdAt - a.createdAt)[0];
  let openUrls = new Set();
  if (settings.dedupOnRestore) {
    const cur = await new Promise((r) => chrome.tabs.query({}, (t) => r(t || [])));
    openUrls = new Set(cur.map((t) => t.url));
  }
  const urls = last.tabs.map((t) => t.url).filter((u) => !openUrls.has(u));
  if (!urls.length) return;
  if (settings.restoreInNewWindow && chrome.windows?.create) {
    chrome.windows.create({ url: urls });
  } else {
    for (const u of urls) chrome.tabs.create({ url: u, active: false });
  }
};

// ---- Auto export ----
const nextFireMs = (freq, hhmm, tz) => {
  const [H, M] = (hhmm || "03:00").split(":").map(Number);
  const now = new Date();
  if (freq === "hourly") return Date.now() + 60 * 60 * 1000;
  try {
    const zone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(now).reduce((o, p) => (o[p.type] = p.value, o), {});
    const y = +parts.year, mo = +parts.month, d = +parts.day;
    const h = +parts.hour === 24 ? 0 : +parts.hour;
    const mi = +parts.minute, s = +parts.second;
    const asUTC = Date.UTC(y, mo - 1, d, h, mi, s);
    const offset = asUTC - now.getTime();
    let target = Date.UTC(y, mo - 1, d, H, M, 0) - offset;
    const step = freq === "weekly" ? 7 * 86400e3 : 86400e3;
    while (target <= now.getTime() + 1000) target += step;
    return target;
  } catch {
    return Date.now() + 24 * 60 * 60 * 1000;
  }
};

const runAutoExport = async () => {
  const sessions = await get(STORAGE_KEY, []);
  if (!sessions.length) return;
  const payload = { app: "TabBankruptcy", version: 1, exportedAt: new Date().toISOString(), sessions };
  const json = JSON.stringify(payload, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = `data:application/json;base64,${b64}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  try {
    await chrome.downloads.download({
      url, filename: `tabbankruptcy-auto/tabbankruptcy-${stamp}.json`,
      saveAs: false, conflictAction: "uniquify",
    });
  } catch (e) { console.warn("auto export failed", e); }
};

const rescheduleAutoExport = async () => {
  const s = await getSettings();
  await chrome.alarms.clear(AUTO_EXPORT_ALARM);
  if (!["hourly", "daily", "weekly"].includes(s.autoExportFrequency)) return;
  const when = nextFireMs(s.autoExportFrequency, s.autoExportTime, s.autoExportTimezone);
  chrome.alarms.create(AUTO_EXPORT_ALARM, { when });
};

// ---- Cloud sync ----
const mirrorToStorageSync = async () => {
  try {
    const s = await getSettings();
    if (!s.syncToStorageSync || !chrome.storage?.sync) return;
    const sessions = await get(STORAGE_KEY, []);
    const json = JSON.stringify(sessions);
    // chrome.storage.sync quotas: 100KB total, 8KB per item. Chunk in 6KB slices.
    const CHUNK = 6000;
    const chunks = [];
    for (let i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK));
    const payload = { tb_sync_count: chunks.length, tb_sync_updated: Date.now() };
    chunks.forEach((c, i) => (payload[`tb_sync_${i}`] = c));
    // Clear old chunks first (best effort)
    chrome.storage.sync.get(null, (all) => {
      const stale = Object.keys(all).filter((k) => k.startsWith("tb_sync_") && !(k in payload));
      const finish = () => chrome.storage.sync.set(payload, () => void chrome.runtime.lastError);
      if (stale.length) chrome.storage.sync.remove(stale, finish);
      else finish();
    });
  } catch (e) { console.warn("storage.sync mirror failed", e); }
};

const restoreFromStorageSync = () =>
  new Promise((resolve) => {
    if (!chrome.storage?.sync) return resolve(null);
    chrome.storage.sync.get(null, (all) => {
      const n = all.tb_sync_count;
      if (!n) return resolve(null);
      let s = "";
      for (let i = 0; i < n; i++) s += all[`tb_sync_${i}`] || "";
      try { resolve(JSON.parse(s)); } catch { resolve(null); }
    });
  });

const cloudPush = async () => {
  const s = await getSettings();
  if (!s.cloudEndpointUrl) throw new Error("No endpoint configured");
  const sessions = await get(STORAGE_KEY, []);
  const headers = { "Content-Type": "application/json" };
  if (s.cloudEndpointToken) headers.Authorization = `Bearer ${s.cloudEndpointToken}`;
  const res = await fetch(s.cloudEndpointUrl, {
    method: "PUT", headers,
    body: JSON.stringify({ app: "TabBankruptcy", version: 1, updatedAt: Date.now(), sessions }),
  });
  if (!res.ok) throw new Error(`Push failed ${res.status}`);
  return { ok: true, count: sessions.length };
};

const cloudPull = async () => {
  const s = await getSettings();
  if (!s.cloudEndpointUrl) throw new Error("No endpoint configured");
  const headers = {};
  if (s.cloudEndpointToken) headers.Authorization = `Bearer ${s.cloudEndpointToken}`;
  const res = await fetch(s.cloudEndpointUrl, { method: "GET", headers });
  if (!res.ok) throw new Error(`Pull failed ${res.status}`);
  const data = await res.json().catch(() => null);
  const incoming = Array.isArray(data) ? data : data?.sessions;
  if (!Array.isArray(incoming)) throw new Error("Bad payload shape");
  return incoming;
};

// ---- Lifecycle ----
chrome.runtime.onInstalled.addListener(async (details) => {
  rescheduleAutoExport();
  try { chrome.runtime.setUninstallURL?.("https://tabbankruptcy.lovable.app/uninstalled"); } catch {}
  if (details.reason === "install") {
    // Attempt auto-recovery from storage.sync (works when user reinstalls under same browser account)
    const recovered = await restoreFromStorageSync();
    if (Array.isArray(recovered) && recovered.length) {
      const existing = await get(STORAGE_KEY, []);
      if (!existing.length) await set(STORAGE_KEY, recovered);
    }
  }
});
chrome.runtime.onStartup?.addListener?.(() => rescheduleAutoExport());

chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name === AUTO_EXPORT_ALARM) {
    await runAutoExport();
    rescheduleAutoExport();
  } else if (a.name === CLOUD_PUSH_ALARM) {
    cloudPush().catch(() => {});
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[SETTINGS_KEY]) {
    const prev = changes[SETTINGS_KEY].oldValue || {};
    const next = changes[SETTINGS_KEY].newValue || {};
    if (
      prev.autoExportFrequency !== next.autoExportFrequency ||
      prev.autoExportTime !== next.autoExportTime ||
      prev.autoExportTimezone !== next.autoExportTimezone
    ) rescheduleAutoExport();
  }
  if (changes[STORAGE_KEY]) {
    mirrorToStorageSync();
    getSettings().then((s) => { if (s.cloudAutoPush && s.cloudEndpointUrl) cloudPush().catch(() => {}); });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "declare_bankruptcy") {
    const s = await getSettings();
    if (s.confirmBeforeClose && !s.skipConfirmOnShortcut) {
      chrome.action.openPopup?.().catch(() => {});
      return;
    }
    declareBankruptcy();
  } else if (command === "restore_last") {
    restoreLast();
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const handle = async () => {
    if (msg?.type === "DECLARE_BANKRUPTCY") return (await declareBankruptcy(), { ok: true });
    if (msg?.type === "RESTORE_LAST") return (await restoreLast(), { ok: true });
    if (msg?.type === "RUN_AUTO_EXPORT") return (await runAutoExport(), { ok: true });
    if (msg?.type === "CLOUD_PUSH") return await cloudPush();
    if (msg?.type === "CLOUD_PULL") return { sessions: await cloudPull() };
    if (msg?.type === "SYNC_MIRROR") return (await mirrorToStorageSync(), { ok: true });
    if (msg?.type === "SYNC_RESTORE") return { sessions: await restoreFromStorageSync() };
    return null;
  };
  handle().then((r) => sendResponse(r ?? { ok: false })).catch((e) => sendResponse({ ok: false, error: String(e.message || e) }));
  return true;
});
