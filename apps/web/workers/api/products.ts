import { Hono } from "hono";
import { createDb } from "../../db/client";
import {
  createProduct,
  createMercariCrawlSetting,
} from "../../models/products";
import {
  validateCreateProductRequest,
  formatValidationErrors,
} from "../lib/schemas";

const productsRouter = new Hono<{ Bindings: Env }>();

productsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const validationResult = validateCreateProductRequest(body);
    if (!validationResult.success) {
      const errors = formatValidationErrors(validationResult.error);
      return c.json(
        {
          error: "バリデーションエラー",
          details: errors,
        },
        400
      );
    }

    const validatedData = validationResult.data;
    const db = createDb(c.env);
    const product = await createProduct(db, {
      name: validatedData.name,
    });

    if (validatedData.mercariSettings) {
      const mercariSetting = await createMercariCrawlSetting(db, {
        productId: product.id,
        keyword: validatedData.mercariSettings.keyword,
        categoryId: validatedData.mercariSettings.categoryId ?? undefined,
        minPrice: validatedData.mercariSettings.minPrice,
        maxPrice: validatedData.mercariSettings.maxPrice,
        enabled: validatedData.mercariSettings.enabled,
      });
    }

    return c.json(
      {
        success: true,
        message: "商品が正常に作成されました",
        data: { product, mercariSettings: validatedData.mercariSettings },
      },
      201
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default productsRouter;
