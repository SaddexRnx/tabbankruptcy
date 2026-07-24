<div align="center">

<img src="public/favicon.png" alt="TabBankruptcy" width="96" height="96" />

# TabBankruptcy

**Declare bankruptcy on your tabs. Restore your sanity.**

A privacy-first Chrome & Firefox extension (Manifest V3) that helps you tame tab hoarding with one click — plus a beautiful landing page built with TanStack Start.

[![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](public/tab-bankruptcy-chromium.zip)
[![Firefox](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefoxbrowser&logoColor=white)](public/tab-bankruptcy-firefox.zip)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-EF4444?logo=react&logoColor=white)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

[Install Chromium](public/tab-bankruptcy-chromium.zip) · [Install Firefox](public/tab-bankruptcy-firefox.zip) · [Live site](https://tabbankruptcy.lovable.app)

</div>

---

## What it does

TabBankruptcy saves every open tab as a named session, then closes them all so you get a clean slate. Come back later and restore any session — fully, partially, or into a new window. No accounts. No tracking. Your data stays local (with optional Google Drive backup you control).

## Features

- **One-click bankruptcy** — save & close all tabs into a session
- **Session history** — search, filter, tag, add notes, bulk restore/delete
- **Versioning** — up to 20 recoverable revisions per session
- **Undo window** — 12 seconds to revert declare/restore/nuke actions
- **Auto-Archive** — idle tabs move to the side panel to free RAM
- **Ghost Tab Checker** — find and nuke suspended/duplicate/idle tabs
- **Per-domain rules** — always-pin or never-archive specific sites
- **Scheduled exports & scans** — timezone-aware, with notifications
- **Google Drive backup** — optional, uses your own OAuth Client ID, stored in `appDataFolder`
- **PIN lock** — optional PBKDF2-SHA256 salted PIN
- **Activity log** — full history of what the extension did
- **Keyboard shortcuts** — `Ctrl+Shift+B` declare · `Ctrl+Shift+X` restore · `Ctrl+Shift+L` dashboard
- **8 languages** — EN, ES, FR, DE, AR, ZH, PT, JA (extension + website)
- **Modern UI** — minimalist monochrome, light & dark mode

## Install

### From the packaged builds
1. Download `public/tab-bankruptcy-chromium.zip` (or `-firefox.zip`) and unzip it.
2. **Chromium:** open `chrome://extensions`, enable *Developer mode*, click *Load unpacked*, select the folder.
3. **Firefox:** open `about:debugging#/runtime/this-firefox`, click *Load Temporary Add-on*, pick `manifest.json`.

### Build from source
```sh
cd extension
bun install
bun run build:chromium   # or build:firefox
```
Output lands in `extension/dist/` or `extension/dist-firefox/`.

## Landing page

The marketing site lives in `src/routes/` and runs on TanStack Start + Tailwind CSS v4.

```sh
bun install
bun run dev
```

## Project layout

```
extension/     Manifest V3 extension (React + Vite + Tailwind)
src/           Landing page (TanStack Start)
public/        Packaged extension zips & static assets
```

## Tech

TanStack Start · React 19 · TypeScript · Tailwind CSS v4 · Vite 7 · Manifest V3 · chrome.storage · chrome.alarms · chrome.sidePanel · chrome.identity

## Privacy

Everything runs locally in your browser. No analytics, no external servers. Google Drive sync is opt-in and uses **your own** OAuth Client ID — the extension never sees your credentials.

## License

MIT
