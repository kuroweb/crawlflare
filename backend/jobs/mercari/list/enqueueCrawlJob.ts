import { createDb } from "../../../db/client";
import {
  getAllProducts,
  type Product,
  type MercariCrawlSetting,
} from "../../../models/products";

export async function enqueueListCrawlJob(env: Env): Promise<void> {
  try {
    const db = createDb(env);
    const enabledSettings = await getEnabledCrawlSettings(db);

    console.log(
      `Found ${enabledSettings.length} enabled crawl settings to process`
    );

    for (const product of enabledSettings) {
      await env.QUEUE_MERCARI_LIST.send({ productId: product.id });
      console.log(`Enqueued product ${product.id} to list crawl queue`);
    }
  } catch (error) {
    console.error("Error in enqueueListCrawlJob:", error);
    throw error;
  }
}

export async function getEnabledCrawlSettings(
  db: ReturnType<typeof createDb>
): Promise<(Product & { mercariSettings: MercariCrawlSetting })[]> {
  const products = await getAllProducts(db);
  return products
    .filter((p) => p.mercariSettings && p.mercariSettings.enabled === true)
    .map((p) => ({
      ...p,
      mercariSettings: p.mercariSettings!,
    }));
}
