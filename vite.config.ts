import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: [
      {
        find: "../build/server/index.js",
        replacement: "virtual:react-router/server-build",
      },
    ],
  },
  plugins: [
    mode !== "production" && cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  experimental: { enableNativePlugin: true },
  // NOTE: daisyuiをapp.cssでロードするとnpm run buildでlightningcssのwarningが出るので、回避策としてesbuildでminifyしている
  build: { cssMinify: "esbuild" },
}));
