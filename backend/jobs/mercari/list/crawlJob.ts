import { createDb } from "../../../db/client";
import {
  getProductById,
  getMercariCrawlSettingByProductId,
} from "../../../models/products";
import { syncList } from "../../../services/mercari/list/syncer";

export type ListCrawlMessage = { productId: number };

export async function processMercariListCrawlQueue(
  batch: MessageBatch<ListCrawlMessage>,
  env: Env
): Promise<void> {
  console.log(
    `[processMercariListCrawlQueue] Processing ${batch.messages.length} messages`
  );
  const db = createDb(env);

  for (const message of batch.messages) {
    try {
      const { productId } = message.body;
      console.log(
        `[processMercariListCrawlQueue] Processing productId: ${productId}`
      );

      const product = await getProductById(db, productId);
      if (!product) {
        console.error(`Product ${productId} not found`);
        message.ack();
        continue;
      }

      const setting = await getMercariCrawlSettingByProductId(db, productId);
      if (!setting || !setting.enabled) {
        console.error(
          `Mercari crawl setting for product ${productId} not found or disabled`
        );
        message.ack();
        continue;
      }

      await syncList(db, productId, setting, env);

      message.ack();
    } catch (error) {
      console.error(`Error processing list crawl message:`, error);
      if (message.attempts >= 3) {
        console.error(
          `Max retry attempts reached for productId ${message.body.productId}. Skipping.`
        );
        message.ack();
      } else {
        message.retry();
      }
    }
  }
}
