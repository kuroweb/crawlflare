import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

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

export const mercariCrawlResults = sqliteTable("mercari_crawl_results", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  productId: integer({ mode: "number" }).notNull(),
  externalId: text().notNull(),
  name: text().notNull(),
  price: integer({ mode: "number" }).notNull(),
  sellingUrl: text().notNull(),
  imageUrl: text().notNull(),
  sellingStatus: integer({ mode: "number" }).notNull(),
  sellerType: integer({ mode: "number" }).notNull(),
  sellerId: text().notNull(),
  soldOutAt: text(),
  createdAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text()
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const mercariCrawlResultsProductExternalUniqueIdx = uniqueIndex(
  "product_external_unique_idx"
).on(mercariCrawlResults.productId, mercariCrawlResults.externalId);

export const mercariCrawlResultsProductIdIdx = index("product_id_idx").on(
  mercariCrawlResults.productId
);

export const mercariCrawlResultsExternalIdIdx = index("external_id_idx").on(
  mercariCrawlResults.externalId
);

export const mercariCrawlResultsCreatedAtIdx = index("created_at_idx").on(
  mercariCrawlResults.createdAt
);

export const mercariCrawlResultsUpdatedAtIdx = index("updated_at_idx").on(
  mercariCrawlResults.updatedAt
);
