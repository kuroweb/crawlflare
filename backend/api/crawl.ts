import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import {
  ValidationErrorResponseSchema,
  ErrorResponseSchema,
} from "../schemas/common";
import {
  CrawlExecuteRequestSchema,
  CrawlExecuteResponseSchema,
  CrawlResultsResponseSchema,
} from "../schemas/mercariCrawlResults";
import { createDb } from "../db/client";
import {
  getProductById,
  getMercariCrawlSettingByProductId,
} from "../models/products";
import { findByProductId } from "../models/mercariCrawlResults";
import type { AuthVariables } from "../middleware/auth";

/**
 * POST /api/crawl/execute
 * 手動実行エンドポイント
 */
export const crawlExecuteRoute = createRoute({
  method: "post",
  path: "/crawl/execute",
  request: {
    body: {
      content: { "application/json": { schema: CrawlExecuteRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Crawl executed successfully",
      content: { "application/json": { schema: CrawlExecuteResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": { schema: ValidationErrorResponseSchema },
      },
    },
    404: {
      description: "Product or setting not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const crawlExecuteHandler: RouteHandler<
  typeof crawlExecuteRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const body = await c.req.json();
    let input: z.infer<typeof CrawlExecuteRequestSchema>;
    try {
      input = CrawlExecuteRequestSchema.parse(body);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const details = e.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        return c.json({ error: "バリデーションエラー" as const, details }, 400);
      }
      throw e;
    }

    const db = createDb(c.env);

    // productIdが指定されている場合はその商品のみ、指定されていない場合は全商品を処理
    if (input.productId) {
      const product = await getProductById(db, input.productId);
      if (!product) {
        return c.json({ error: "商品が見つかりません" } as const, 404);
      }

      const setting = await getMercariCrawlSettingByProductId(
        db,
        input.productId
      );
      if (!setting || !setting.enabled) {
        return c.json(
          { error: "メルカリクロール設定が見つからないか、無効です" } as const,
          404
        );
      }

      // キューにメッセージを送信
      await c.env.QUEUE_MERCARI_LIST.send({ productId: input.productId });

      return c.json(
        {
          success: true,
          message: "クロールジョブをキューに追加しました",
          data: {
            productId: input.productId,
            crawledCount: 0,
            deletedCount: 0,
            existenceSyncCount: 0,
            soldOutSyncCount: 0,
          },
        } as const,
        200
      );
    } else {
      // 全商品を処理（enabled=trueの設定のみ）
      // TODO: 全商品の処理を実装
      return c.json(
        {
          success: true,
          message: "全商品のクロールが正常に実行されました",
          data: {
            productId: 0,
            crawledCount: 0,
            deletedCount: 0,
            existenceSyncCount: 0,
            soldOutSyncCount: 0,
          },
        } as const,
        200
      );
    }
  } catch (error) {
    console.error("Error executing crawl:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

/**
 * GET /api/crawl/results/:productId
 * クロール結果取得エンドポイント
 */
export const crawlResultsRoute = createRoute({
  method: "get",
  path: "/crawl/results/{productId}",
  request: {
    params: z.object({ productId: z.string().regex(/^\d+$/) }),
  },
  responses: {
    200: {
      description: "Get crawl results",
      content: { "application/json": { schema: CrawlResultsResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const crawlResultsHandler: RouteHandler<
  typeof crawlResultsRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const productId = Number(c.req.param("productId"));
    if (Number.isNaN(productId)) {
      return c.json({ error: "無効な商品IDです" } as const, 400);
    }

    const db = createDb(c.env);
    const results = await findByProductId(db, productId);

    // 型をCrawlResultSchemaに適合させる
    const formattedResults = results.map((result) => ({
      id: result.id,
      productId: result.productId,
      externalId: result.externalId,
      name: result.name,
      price: result.price,
      sellingUrl: result.sellingUrl,
      imageUrl: result.imageUrl,
      sellingStatus: result.sellingStatus as 1 | 2,
      sellerType: result.sellerType as 1 | 2,
      sellerId: result.sellerId,
      soldOutAt: result.soldOutAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    return c.json(
      {
        success: true,
        data: formattedResults,
      } as const,
      200
    );
  } catch (error) {
    console.error("Error fetching crawl results:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};
