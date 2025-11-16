import { createDb } from "../../../db/client";
import { syncDetail } from "../../../services/mercari/detail/syncer";

export type DetailCrawlMessage = { mercariCrawlResultId: number };

export async function processMercariDetailCrawlQueue(
  batch: MessageBatch<DetailCrawlMessage>,
  env: Env
): Promise<void> {
  const db = createDb(env);

  for (const message of batch.messages) {
    try {
      const { mercariCrawlResultId } = message.body;

      const result = await syncDetail(db, mercariCrawlResultId, env);

      if (result.success) {
        console.log(
          `Detail crawl completed for ID ${mercariCrawlResultId}: ${result.action}`
        );
        message.ack();
      } else {
        console.error(
          `Detail crawl failed for ID ${mercariCrawlResultId}: ${result.message}`
        );
        if (message.attempts >= 3) {
          console.error(
            `Max retry attempts reached for mercariCrawlResultId ${mercariCrawlResultId}. Skipping.`
          );
          message.ack();
        } else {
          message.retry();
        }
      }
    } catch (error) {
      console.error(`Error processing detail crawl message:`, error);
      if (message.attempts >= 3) {
        console.error(
          `Max retry attempts reached for mercariCrawlResultId ${message.body.mercariCrawlResultId}. Skipping.`
        );
        message.ack();
      } else {
        message.retry();
      }
    }
  }
}
