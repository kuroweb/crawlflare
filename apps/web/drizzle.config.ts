import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

const currentEnv = process.env.ENV ?? "development";
dotenv.config({
  path: currentEnv === "production" ? ".prod.vars" : ".dev.vars",
});

export default {
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
} satisfies Config;
