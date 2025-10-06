import { products, mercariCrawlSettings } from "../db/schema";
import type { Database } from "../db/client";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

export type Product = InferSelectModel<typeof products>;
export type MercariCrawlSetting = InferSelectModel<typeof mercariCrawlSettings>;

export async function getAllProducts(db: Database): Promise<Product[]> {
  return await db.select().from(products);
}

export async function createProduct(
  db: Database,
  data: {
    name: string;
  }
): Promise<Product> {
  const result = await db
    .insert(products)
    .values({
      name: data.name,
    })
    .returning();

  return result[0];
}

export async function createMercariCrawlSetting(
  db: Database,
  data: {
    productId: number;
    keyword: string;
    categoryId?: number;
    minPrice: number;
    maxPrice: number;
    enabled: boolean;
  }
): Promise<MercariCrawlSetting> {
  const result = await db
    .insert(mercariCrawlSettings)
    .values({
      productId: data.productId,
      keyword: data.keyword,
      categoryId: data.categoryId,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      enabled: data.enabled,
    })
    .returning();

  return result[0];
}

export async function updateProduct(
  db: Database,
  id: number,
  data: {
    name: string;
  }
): Promise<Product> {
  const result = await db
    .update(products)
    .set({
      name: data.name,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id))
    .returning();

  return result[0];
}

export async function updateMercariCrawlSetting(
  db: Database,
  productId: number,
  data: {
    keyword: string;
    categoryId?: number;
    minPrice: number;
    maxPrice: number;
    enabled: boolean;
  }
): Promise<MercariCrawlSetting> {
  const result = await db
    .update(mercariCrawlSettings)
    .set({
      keyword: data.keyword,
      categoryId: data.categoryId,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      enabled: data.enabled,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(mercariCrawlSettings.productId, productId))
    .returning();

  return result[0];
}

export async function getProductById(
  db: Database,
  id: number
): Promise<Product | null> {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getMercariCrawlSettingByProductId(
  db: Database,
  productId: number
): Promise<MercariCrawlSetting | null> {
  const result = await db
    .select()
    .from(mercariCrawlSettings)
    .where(eq(mercariCrawlSettings.productId, productId))
    .limit(1);

  return result[0] || null;
}
