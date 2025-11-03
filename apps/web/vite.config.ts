import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import serverAdapter, { defaultOptions } from "@hono/vite-dev-server";
import type { cloudflareAdapter } from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getPlatformProxy, unstable_getVarsForDev } from "wrangler";

// Entry file
const entry = "./workers/app.ts";

// Prevent tampering with Hono's Cloudflare parameters executed by default
const adapter: typeof cloudflareAdapter = async (options) => {
  const proxy = await getPlatformProxy(options?.proxy);
  return {
    env: proxy.env,
    executionContext: proxy.ctx,
    onServerClose: () => proxy.dispose(),
  };
};

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "../build/server/index.js",
        replacement: "virtual:react-router/server-build",
      },
    ],
  },
  ssr: {
    resolve: {
      externalConditions: ["worker"],
    },
  },
  // 開発環境ではbuild/clientから静的アセットを配信
  publicDir: "build/client",
  plugins: [
    serverAdapter({
      adapter,
      entry,
      exclude: [
        ...defaultOptions.exclude,
      ],
      // HMR adjustment
      handleHotUpdate: ({ server, modules }) => {
        const isServer = modules.some((mod) => {
          return mod._ssrModule?.id && !mod._clientModule;
        });
        if (isServer) {
          server.hot.send({ type: "full-reload" });
          return [];
        }
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  experimental: { enableNativePlugin: true },
  // NOTE: daisyuiをapp.cssでロードするとnpm run buildでlightningcssのwarningが出るので、回避策としてesbuildでminifyしている
  build: { cssMinify: "esbuild" },
});
