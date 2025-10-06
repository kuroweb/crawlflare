import { Hono } from "hono";
import { createDb } from "../../db/client";
import {
  createProduct,
  createMercariCrawlSetting,
  getAllProducts,
  updateProduct,
  getProductById,
  deleteProduct,
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
      await createMercariCrawlSetting(db, {
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

    const existingProduct = await getProductById(db, productId);
    if (!existingProduct) {
      return c.json({ error: "商品が見つかりません" }, 404);
    }

    const updatedData = await updateProduct(db, productId, {
      name: validatedData.name,
      mercariSettings: validatedData.mercariSettings
        ? {
            ...validatedData.mercariSettings,
            categoryId: validatedData.mercariSettings.categoryId ?? undefined,
          }
        : undefined,
    });

    return c.json(
      {
        success: true,
        message: "商品が正常に更新されました",
        data: updatedData,
      },
      200
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// DELETE: /api/products/:id
productsRouter.delete("/:id", async (c) => {
  try {
    const productId = parseInt(c.req.param("id"));
    if (isNaN(productId)) {
      return c.json({ error: "無効な商品IDです" }, 400);
    }

    const db = createDb(c.env);

    const existingProduct = await getProductById(db, productId);
    if (!existingProduct) {
      return c.json({ error: "商品が見つかりません" }, 404);
    }

    const deleted = await deleteProduct(db, productId);
    if (!deleted) {
      return c.json({ error: "商品の削除に失敗しました" }, 500);
    }

    return c.json(
      {
        success: true,
        message: "商品が正常に削除されました",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default productsRouter;
