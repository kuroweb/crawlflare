import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull(),
  password: text().notNull(),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const products = sqliteTable("products", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const mercariCrawlSettings = sqliteTable("mercari_crawl_settings", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  productId: integer({ mode: "number" }).notNull(),
  keyword: text().notNull(),
  categoryId: integer({ mode: "number" }),
  minPrice: integer({ mode: "number" }).notNull().default(0),
  maxPrice: integer({ mode: "number" }).notNull().default(0),
  enabled: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
