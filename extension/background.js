// Minimal service worker. Kept for future features (context menu, keyboard shortcuts).
// Popup handles all tab logic directly via chrome.tabs API.
chrome.runtime.onInstalled.addListener(() => {
  console.log("TabBankruptcy installed");
});
