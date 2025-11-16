import { z } from "@hono/zod-openapi";

/**
 * 検索結果のスキーマ（MercariSearchResultに対応）
 */
export const MercariCrawlResultSchema = z
  .object({
    externalId: z.string(),
    name: z.string(),
    price: z.number().int(),
    sellingUrl: z.string().url(),
    imageUrl: z.string().url(),
    sellingStatus: z.union([z.literal(1), z.literal(2)]), // 1: 販売中、2: 売り切れ
    sellerType: z.union([z.literal(1), z.literal(2)]), // 1: 一般ユーザー、2: ショップ
    sellerId: z.string(),
  })
  .openapi("MercariCrawlResult");

/**
 * 商品詳細のスキーマ（MercariDetailResultに対応）
 */
export const MercariItemDetailSchema = z
  .object({
    exists: z.boolean(), // 商品が存在するか
    name: z.string().optional(),
    price: z.number().int().optional(),
    sellingStatus: z.union([z.literal(1), z.literal(2)]).optional(), // 1: 販売中、2: 売り切れ
    soldOutAt: z.string().optional(), // 売り切れ日時（ISO形式）
    imageUrl: z.string().url().optional(),
  })
  .openapi("MercariItemDetail");

/**
 * DB保存用のスキーマ（mercari_crawl_resultsテーブルに対応）
 */
export const CrawlResultSchema = z
  .object({
    id: z.number().int(),
    productId: z.number().int(),
    externalId: z.string(),
    name: z.string(),
    price: z.number().int(),
    sellingUrl: z.string().url(),
    imageUrl: z.string().url(),
    sellingStatus: z.union([z.literal(1), z.literal(2)]), // 1: 販売中、2: 売り切れ
    sellerType: z.union([z.literal(1), z.literal(2)]), // 1: 一般ユーザー、2: ショップ
    sellerId: z.string(),
    soldOutAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("CrawlResult");

/**
 * クロール実行リクエストスキーマ
 */
export const CrawlExecuteRequestSchema = z
  .object({
    productId: z.number().int().optional(),
  })
  .openapi("CrawlExecuteRequest");

/**
 * クロール実行レスポンススキーマ
 */
export const CrawlExecuteResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      productId: z.number().int(),
      crawledCount: z.number().int(),
      deletedCount: z.number().int(),
      existenceSyncCount: z.number().int(),
      soldOutSyncCount: z.number().int(),
    }),
  })
  .openapi("CrawlExecuteResponse");

/**
 * クロール結果取得レスポンススキーマ
 */
export const CrawlResultsResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.array(CrawlResultSchema),
  })
  .openapi("CrawlResultsResponse");

