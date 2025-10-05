import { Hono } from "hono";
import { createDb } from "../../db/client";
import {
  createProduct,
  createMercariCrawlSetting,
} from "../../models/products";

const productsRouter = new Hono<{ Bindings: Env }>();

productsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    // バリデーション
    if (!body.name) {
      return c.json({ error: "商品名は必須です" }, 400);
    }

    // データベースに保存する処理
    const db = createDb(c.env);

    // 1. 商品を作成
    const product = await createProduct(db, {
      name: body.name,
    });

    console.log("Created product:", product);

    // 2. メルカリ設定がある場合は作成
    if (body.mercariSettings) {
      const mercariSetting = await createMercariCrawlSetting(db, {
        productId: product.id, // 自動インクリメントのIDをそのまま使用
        keyword: body.mercariSettings.keyword,
        categoryId: body.mercariSettings.categoryId,
        minPrice: body.mercariSettings.minPrice,
        maxPrice: body.mercariSettings.maxPrice,
        enabled: body.mercariSettings.enabled,
      });

      console.log("Created mercari setting:", mercariSetting);
    }

    // 成功レスポンス
    return c.json(
      {
        success: true,
        message: "商品が正常に作成されました",
        data: { product, mercariSettings: body.mercariSettings },
      },
      201
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default productsRouter;
