import { products, mercariCrawlSettings } from "../db/schema";
import type { Database } from "../db/client";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

export type Product = InferSelectModel<typeof products>;
export type MercariCrawlSetting = InferSelectModel<typeof mercariCrawlSettings>;

export async function getAllProducts(
  db: Database
): Promise<(Product & { mercariSettings: MercariCrawlSetting | null })[]> {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      mercariSettings: {
        id: mercariCrawlSettings.id,
        productId: mercariCrawlSettings.productId,
        keyword: mercariCrawlSettings.keyword,
        categoryId: mercariCrawlSettings.categoryId,
        minPrice: mercariCrawlSettings.minPrice,
        maxPrice: mercariCrawlSettings.maxPrice,
        enabled: mercariCrawlSettings.enabled,
        createdAt: mercariCrawlSettings.createdAt,
        updatedAt: mercariCrawlSettings.updatedAt,
      },
    })
    .from(products)
    .leftJoin(
      mercariCrawlSettings,
      eq(products.id, mercariCrawlSettings.productId)
    );

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    mercariSettings: row.mercariSettings?.id ? row.mercariSettings : null,
  }));
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
    mercariSettings?: {
      keyword: string;
      categoryId?: number;
      minPrice: number;
      maxPrice: number;
      enabled: boolean;
    };
  }
): Promise<Product & { mercariSettings: MercariCrawlSetting | null }> {
  const result = await db
    .update(products)
    .set({
      name: data.name,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id))
    .returning();

  const updatedProduct = result[0];

  let mercariSettings: MercariCrawlSetting | null = null;
  if (data.mercariSettings) {
    const existingSetting = await getMercariCrawlSettingByProductId(db, id);

    if (existingSetting) {
      mercariSettings = await updateMercariCrawlSetting(
        db,
        id,
        data.mercariSettings
      );
    } else {
      mercariSettings = await createMercariCrawlSetting(db, {
        productId: id,
        ...data.mercariSettings,
      });
    }
  }

  return {
    ...updatedProduct,
    mercariSettings,
  };
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
