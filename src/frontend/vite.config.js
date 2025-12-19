import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ['**/*.py'],
  plugins: [
    remix({
      ssr: false
    })
  ],
});