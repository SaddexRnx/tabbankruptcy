import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = process.env.BROWSER_TARGET || "chromium";

const copyExtensionFiles = () => ({
  name: "copy-extension-files",
  closeBundle() {
    const outDir = process.env.OUT_DIR || "dist";
    const manifestSrc = target === "firefox" ? "manifest.firefox.json" : "manifest.json";
    try { copyFileSync(resolve(__dirname, manifestSrc), resolve(__dirname, outDir, "manifest.json")); } catch {}
    for (const f of ["background.js", "icon.png"]) {
      const p = resolve(__dirname, f);
      if (existsSync(p)) {
        try { copyFileSync(p, resolve(__dirname, outDir, f)); } catch {}
      }
    }
  },
});

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  base: "./",
  build: {
    outDir: process.env.OUT_DIR || "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        options: resolve(__dirname, "options.html"),
        sidepanel: resolve(__dirname, "sidepanel.html"),
      },
    },
  },
});
