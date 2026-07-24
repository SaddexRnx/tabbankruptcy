import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// Copies manifest + icon + background into dist after build
const copyExtensionFiles = () => ({
  name: "copy-extension-files",
  closeBundle() {
    const files = ["manifest.json", "background.js", "icon.png"];
    for (const f of files) {
      try {
        copyFileSync(resolve(__dirname, f), resolve(__dirname, "dist", f));
      } catch (e) {
        // ignore missing optional files
      }
    }
  },
});

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: resolve(__dirname, "index.html") },
    },
  },
});
