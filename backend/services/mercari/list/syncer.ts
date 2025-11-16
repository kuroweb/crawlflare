import type { Database } from "../../../db/client";
import type { MercariSearchResult } from "./crawler";
import {
  upsert as upsertCrawlResults,
  findByProductId,
  findSellingItemsByProductId,
  findSoldOutItemsWithoutDate,
} from "../../../models/mercariCrawlResults";
import { eq } from "drizzle-orm";
import { mercariCrawlResults } from "../../../db/schema";
import { crawlList } from "./crawler";
import type { MercariCrawlSetting } from "../../../models/products";

export async function syncList(
  db: Database,
  productId: number,
  setting: MercariCrawlSetting,
  env: Env
): Promise<void> {
  const existingResults = await findByProductId(db, productId);
  const isFirstRun = existingResults.length === 0;
  const searchResults = await crawlList(setting, isFirstRun, env);

  await upsert(db, productId, searchResults);
  await inspect(db, productId, searchResults);

  const existenceIds = await syncForExistence(db, productId, searchResults);
  const soldOutIds = await syncForSoldOutAt(db, productId);

  const detailMessages = [
    ...existenceIds.map((id) => ({ body: { mercariCrawlResultId: id } })),
    ...soldOutIds.map((id) => ({ body: { mercariCrawlResultId: id } })),
  ];

  if (detailMessages.length > 0) {
    await env.QUEUE_MERCARI_DETAIL.sendBatch(detailMessages);
  }
}

export async function upsert(
  db: Database,
  productId: number,
  crawlResults: MercariSearchResult[]
): Promise<void> {
  return await upsertCrawlResults(db, productId, crawlResults);
}

export async function inspect(
  db: Database,
  productId: number,
  searchResults: MercariSearchResult[]
): Promise<number> {
  const searchResultExternalIds = new Set(
    searchResults.map((result) => result.externalId)
  );

  const allResults = await findByProductId(db, productId);

  const toDelete = allResults.filter(
    (result) => !searchResultExternalIds.has(result.externalId)
  );

  if (toDelete.length === 0) {
    return 0;
  }

  const idsToDelete = toDelete.map((r) => r.id);

  let deletedCount = 0;
  for (const id of idsToDelete) {
    const deleted = await db
      .delete(mercariCrawlResults)
      .where(eq(mercariCrawlResults.id, id))
      .returning();
    if (deleted.length > 0) {
      deletedCount++;
    }
  }

  return deletedCount;
}

export async function syncForExistence(
  db: Database,
  productId: number,
  searchResults: MercariSearchResult[]
): Promise<number[]> {
  const searchResultExternalIds = new Set(
    searchResults.map((result) => result.externalId)
  );

  const sellingItems = await findSellingItemsByProductId(db, productId);

  const itemsToCheck = sellingItems.filter(
    (item) => !searchResultExternalIds.has(item.externalId)
  );

  return itemsToCheck.map((item) => item.id);
}

export async function syncForSoldOutAt(
  db: Database,
  productId: number
): Promise<number[]> {
  const soldOutItems = await findSoldOutItemsWithoutDate(db, productId);

  return soldOutItems.map((item) => item.id);
}
