# TabBankruptcy

A Chrome and Firefox extension that saves all your open tabs as a named session, closes them, and lets you restore them later. No account, no server, no tracking.

The landing page is built with TanStack Start and lives in `src/`.

[Install for Chromium](public/tab-bankruptcy-chromium.zip) · [Install for Firefox](public/tab-bankruptcy-firefox.zip) · [Live site](https://tabbankruptcy.lovable.app)

## Why I made it

I kept dozens of tabs open "for later" and never actually read them. Closing them all felt like losing something. This extension saves everything first, then gives you a clean slate. When you need a tab back, you restore the whole session or just the ones you want.

Everything stays in your browser. The only thing that leaves your machine is an optional Google Drive backup, and that uses your own OAuth client ID so the extension never sees your credentials.

## What it does

- Save and close all tabs in one click, then restore them fully or partially later
- Search, tag, and filter sessions, add notes, and restore or delete in bulk
- Keep up to 20 previous versions of a session
- Undo a declare, restore, or delete for 12 seconds
- Move idle tabs to the side panel to free up memory
- Find and close duplicate, suspended, or idle tabs
- Set per-domain rules to always pin or never archive certain sites
- Schedule exports and scans, with notifications
- Optional Google Drive backup using your own OAuth client
- Optional PIN lock using PBKDF2-SHA256
- A log of everything the extension did
- Keyboard shortcuts: `Ctrl+Shift+B` to declare, `Ctrl+Shift+X` to restore, `Ctrl+Shift+L` for the dashboard
- Eight languages: English, Spanish, French, German, Arabic, Chinese, Portuguese, Japanese

## Install

Download the zip for your browser and unzip it.

For **Chrome, Edge, or Brave**, open `chrome://extensions`, turn on Developer mode, click "Load unpacked", and select the unzipped folder.

For **Firefox**, open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and pick `manifest.json`. Note that temporary add-ons disappear when Firefox restarts.

To build from source:

```sh
cd extension
bun install
bun run build:chromium   # or build:firefox
```

The output lands in `extension/dist/` or `extension/dist-firefox/`.

## Run the landing page

```sh
bun install
bun run dev
```

## Layout

```
extension/   Manifest V3 extension (React, Vite, Tailwind)
src/         Landing page (TanStack Start)
public/      Packaged extension zips and static assets
```

## Privacy

Everything runs locally. There is no analytics and no external server. Google Drive sync is opt-in and uses your own OAuth client ID.

## License

MIT

## Contact

Questions or feedback: [@Saddex_x](https://t.me/Saddex_x) on Telegram.
