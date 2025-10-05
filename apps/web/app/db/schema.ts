import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  email: text().notNull(),
  password: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIME)`),
  updatedAt: text().default(sql`(CURRENT_TIME)`),
});

export const products = sqliteTable("products", {
  id: text().primaryKey(),
  name: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIME)`),
  updatedAt: text().default(sql`(CURRENT_TIME)`),
});

export const mercariCrawlSettings = sqliteTable("mercari_crawl_settings", {
  id: text().primaryKey(),
  productId: integer({ mode: "number" }).notNull(),
  keyword: text().notNull(),
  categoryId: integer({ mode: "number" }),
  minPrice: integer({ mode: "number" }).notNull().default(0),
  maxPrice: integer({ mode: "number" }).notNull().default(0),
  enabled: integer({ mode: "boolean" }).notNull().default(false),
  createdAt: text().default(sql`(CURRENT_TIME)`),
  updatedAt: text().default(sql`(CURRENT_TIME)`),
});
