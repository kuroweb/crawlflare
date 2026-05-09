import { mercariCrawlResults } from "../db/schema";
import type { Database } from "../db/client";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { eq, and, isNull, sql, inArray } from "drizzle-orm";
import type { MercariSearchResult } from "../services/mercari/list/crawler";

export type MercariCrawlResult = InferSelectModel<typeof mercariCrawlResults>;
export type MercariCrawlResultInsert = InferInsertModel<
  typeof mercariCrawlResults
>;

export async function upsert(
  db: Database,
  productId: number,
  crawlResults: MercariSearchResult[]
): Promise<void> {
  if (crawlResults.length === 0) {
    return;
  }

  const BATCH_SIZE = 10;

  for (let i = 0; i < crawlResults.length; i += BATCH_SIZE) {
    const batch = crawlResults.slice(i, i + BATCH_SIZE);
    const values: MercariCrawlResultInsert[] = batch.map((result) => ({
      productId,
      externalId: result.externalId,
      name: result.name,
      price: result.price,
      sellingUrl: result.sellingUrl,
      imageUrl: result.imageUrl,
      sellingStatus: result.sellingStatus,
      sellerType: result.sellerType,
      sellerId: result.sellerId,
      soldOutAt: null,
    }));

    await db
      .insert(mercariCrawlResults)
      .values(values)
      .onConflictDoUpdate({
        target: [mercariCrawlResults.productId, mercariCrawlResults.externalId],
        set: {
          name: sql`excluded.name`,
          price: sql`excluded.price`,
          sellingUrl: sql`excluded.sellingUrl`,
          imageUrl: sql`excluded.imageUrl`,
          sellingStatus: sql`excluded.sellingStatus`,
          sellerType: sql`excluded.sellerType`,
          sellerId: sql`excluded.sellerId`,
          updatedAt: sql`(CURRENT_TIMESTAMP)`,
        },
      });
  }
}

export async function findByProductId(
  db: Database,
  productId: number
): Promise<MercariCrawlResult[]> {
  const result = await db
    .select()
    .from(mercariCrawlResults)
    .where(eq(mercariCrawlResults.productId, productId));

  return result;
}

export async function findById(
  db: Database,
  id: number
): Promise<MercariCrawlResult | null> {
  const result = await db
    .select()
    .from(mercariCrawlResults)
    .where(eq(mercariCrawlResults.id, id))
    .limit(1);

  return result[0] || null;
}

export async function findByExternalId(
  db: Database,
  productId: number,
  externalId: string
): Promise<MercariCrawlResult | null> {
  const result = await db
    .select()
    .from(mercariCrawlResults)
    .where(
      and(
        eq(mercariCrawlResults.productId, productId),
        eq(mercariCrawlResults.externalId, externalId)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function deleteById(db: Database, id: number): Promise<boolean> {
  const result = await db
    .delete(mercariCrawlResults)
    .where(eq(mercariCrawlResults.id, id))
    .returning();

  return result.length > 0;
}

export async function deleteByProductId(
  db: Database,
  productId: number
): Promise<number> {
  const result = await db
    .delete(mercariCrawlResults)
    .where(eq(mercariCrawlResults.productId, productId))
    .returning();

  return result.length;
}

function formatSqliteTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function update(
  db: Database,
  id: number,
  data: {
    name?: string;
    price?: number;
    sellingUrl?: string;
    imageUrl?: string;
    sellingStatus?: number;
    sellerType?: number;
    sellerId?: string;
    soldOutAt?: string | null;
  }
): Promise<MercariCrawlResult | null> {
  const updateData: {
    updatedAt: ReturnType<typeof sql>;
    name?: string;
    price?: number;
    sellingUrl?: string;
    imageUrl?: string;
    sellingStatus?: number;
    sellerType?: number;
    sellerId?: string;
    soldOutAt?: string | null;
  } = {
    updatedAt: sql`(CURRENT_TIMESTAMP)`,
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.sellingUrl !== undefined) updateData.sellingUrl = data.sellingUrl;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.sellingStatus !== undefined)
    updateData.sellingStatus = data.sellingStatus;
  if (data.sellerType !== undefined) updateData.sellerType = data.sellerType;
  if (data.sellerId !== undefined) updateData.sellerId = data.sellerId;
  if (data.soldOutAt !== undefined) {
    // ISO形式の文字列をSQLite形式に変換
    updateData.soldOutAt = data.soldOutAt
      ? formatSqliteTimestamp(data.soldOutAt)
      : null;
  }

  const result = await db
    .update(mercariCrawlResults)
    .set(updateData)
    .where(eq(mercariCrawlResults.id, id))
    .returning();

  return result[0] || null;
}

export async function findSellingItemsByProductId(
  db: Database,
  productId: number
): Promise<MercariCrawlResult[]> {
  const result = await db
    .select()
    .from(mercariCrawlResults)
    .where(
      and(
        eq(mercariCrawlResults.productId, productId),
        eq(mercariCrawlResults.sellingStatus, 1)
      )
    );

  return result;
}

export async function findSoldOutItemsWithoutDate(
  db: Database,
  productId: number
): Promise<MercariCrawlResult[]> {
  const result = await db
    .select()
    .from(mercariCrawlResults)
    .where(
      and(
        eq(mercariCrawlResults.productId, productId),
        eq(mercariCrawlResults.sellingStatus, 2),
        isNull(mercariCrawlResults.soldOutAt)
      )
    );

  return result;
}
