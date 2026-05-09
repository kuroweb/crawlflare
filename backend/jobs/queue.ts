import {
  processMercariListCrawlQueue,
  type ListCrawlMessage,
} from "./mercari/list/crawlJob";
import {
  processMercariDetailCrawlQueue,
  type DetailCrawlMessage,
} from "./mercari/detail/crawlJob";

const QUEUE_NAMES = {
  LIST_CRAWL: "mercari-list-crawl-queue",
  DETAIL_CRAWL: "mercari-detail-crawl-queue",
} as const;

export async function handleQueueEvent(
  batch: MessageBatch<ListCrawlMessage | DetailCrawlMessage>,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  const queueName = batch.queue;
  console.log(
    `[QUEUE] Processing queue: ${queueName}, messages: ${batch.messages.length}`
  );

  if (queueName === QUEUE_NAMES.LIST_CRAWL) {
    await processMercariListCrawlQueue(
      batch as MessageBatch<ListCrawlMessage>,
      env
    );
    return;
  }

  if (queueName === QUEUE_NAMES.DETAIL_CRAWL) {
    await processMercariDetailCrawlQueue(
      batch as MessageBatch<DetailCrawlMessage>,
      env
    );
    return;
  }

  console.error(`Unknown queue: ${queueName}`);
}
