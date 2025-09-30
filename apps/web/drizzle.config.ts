import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";

const currentEnv = process.env.ENV ?? "development";
const isProduction = currentEnv === "production";

// 本番実行時は.prod.varsを読み込む
if (isProduction) dotenv.config({ path: ".prod.vars" });

// ローカル環境のD1のSQLiteファイルのパスを取得
function getSqlitePath(): string {
  const wranglerStatePath =
    "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  const files = readdirSync(wranglerStatePath);
  const sqliteFile = files.find((file) => file.endsWith(".sqlite"));

  if (!sqliteFile) throw new Error("Wrangler SQLite Not Found.");

  return join(wranglerStatePath, sqliteFile);
}

export default (isProduction
  ? {
      schema: "./app/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      driver: "d1-http",
      dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
        databaseId: process.env.CLOUDFLARE_D1_DB_ID ?? "",
        token: process.env.CLOUDFLARE_API_TOKEN ?? "",
      },
      strict: true,
      verbose: true,
    }
  : {
      schema: "./app/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      dbCredentials: {
        url: getSqlitePath(),
      },
      strict: true,
      verbose: true,
    }) satisfies Config;
