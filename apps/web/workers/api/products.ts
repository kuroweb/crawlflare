import { Hono } from "hono";
import { createDb } from "../../db/client";
import {
  createProduct,
  createMercariCrawlSetting,
  getAllProducts,
  updateProduct,
  updateMercariCrawlSetting,
  getProductById,
  getMercariCrawlSettingByProductId,
} from "../../models/products";
import {
  validateCreateProductRequest,
  formatValidationErrors,
} from "../lib/schemas";

const productsRouter = new Hono<{ Bindings: Env }>();

// GET: /api/products
productsRouter.get("/", async (c) => {
  try {
    const db = createDb(c.env);
    const products = await getAllProducts(db);

    return c.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// POST: /api/products
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

// PUT: /api/products/:id
productsRouter.put("/:id", async (c) => {
  try {
    const productId = parseInt(c.req.param("id"));
    if (isNaN(productId)) {
      return c.json({ error: "無効な商品IDです" }, 400);
    }

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

    // 商品が存在するかチェック
    const existingProduct = await getProductById(db, productId);
    if (!existingProduct) {
      return c.json({ error: "商品が見つかりません" }, 404);
    }

    // 商品を更新
    const updatedProduct = await updateProduct(db, productId, {
      name: validatedData.name,
    });

    // メルカリ設定を更新または作成
    if (validatedData.mercariSettings) {
      const existingMercariSetting = await getMercariCrawlSettingByProductId(
        db,
        productId
      );

      if (existingMercariSetting) {
        // 既存の設定を更新
        await updateMercariCrawlSetting(db, productId, {
          keyword: validatedData.mercariSettings.keyword,
          categoryId: validatedData.mercariSettings.categoryId ?? undefined,
          minPrice: validatedData.mercariSettings.minPrice,
          maxPrice: validatedData.mercariSettings.maxPrice,
          enabled: validatedData.mercariSettings.enabled,
        });
      } else {
        // 新しい設定を作成
        await createMercariCrawlSetting(db, {
          productId: productId,
          keyword: validatedData.mercariSettings.keyword,
          categoryId: validatedData.mercariSettings.categoryId ?? undefined,
          minPrice: validatedData.mercariSettings.minPrice,
          maxPrice: validatedData.mercariSettings.maxPrice,
          enabled: validatedData.mercariSettings.enabled,
        });
      }
    }

    return c.json(
      {
        success: true,
        message: "商品が正常に更新されました",
        data: {
          product: updatedProduct,
          mercariSettings: validatedData.mercariSettings,
        },
      },
      200
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// GET: /api/products/:id/mercari_settings
productsRouter.get("/:id/mercari_settings", async (c) => {
  try {
    const productId = parseInt(c.req.param("id"));
    if (isNaN(productId)) {
      return c.json({ error: "無効な商品IDです" }, 400);
    }

    const db = createDb(c.env);
    const mercariSetting = await getMercariCrawlSettingByProductId(
      db,
      productId
    );

    return c.json({
      success: true,
      data: mercariSetting,
    });
  } catch (error) {
    console.error("Error fetching mercari settings:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default productsRouter;
