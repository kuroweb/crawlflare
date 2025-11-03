import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import {
  ProductsResponseSchema,
  ProductCreateRequestSchema,
  ProductCreatedResponseSchema,
  ProductUpdatedResponseSchema,
  ProductDeletedResponseSchema,
} from "../schemas/products";
import {
  ValidationErrorResponseSchema,
  ErrorResponseSchema,
} from "../schemas/common";
import { createDb } from "../db/client";
import {
  getAllProducts,
  createProduct,
  createMercariCrawlSetting,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../models/products";
import type { AuthVariables } from "../middleware/auth";

export const productsGetRoute = createRoute({
  method: "get",
  path: "/products",
  request: {},
  responses: {
    200: {
      description: "List products",
      content: { "application/json": { schema: ProductsResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const productsGetHandler: RouteHandler<
  typeof productsGetRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const db = createDb(c.env);
    const products = await getAllProducts(db);
    return c.json({ success: true, data: products } as const, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const productsPostRoute = createRoute({
  method: "post",
  path: "/products",
  request: {
    body: {
      content: { "application/json": { schema: ProductCreateRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: ProductCreatedResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": { schema: ValidationErrorResponseSchema },
      },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const productsPostHandler: RouteHandler<
  typeof productsPostRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const body = await c.req.json();
    let input: z.infer<typeof ProductCreateRequestSchema>;
    try {
      input = ProductCreateRequestSchema.parse(body);
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
    const product = await createProduct(db, { name: input.name });
    if (input.mercariSettings) {
      await createMercariCrawlSetting(db, {
        productId: product.id,
        keyword: input.mercariSettings.keyword,
        categoryId: input.mercariSettings.categoryId ?? undefined,
        minPrice: input.mercariSettings.minPrice,
        maxPrice: input.mercariSettings.maxPrice,
        enabled: input.mercariSettings.enabled,
      });
    }
    return c.json(
      {
        success: true,
        message: "商品が正常に作成されました",
        data: { product, mercariSettings: input.mercariSettings },
      } as const,
      201
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const productsPutRoute = createRoute({
  method: "put",
  path: "/products/{id}",
  request: {
    params: z.object({ id: z.string().regex(/^\d+$/) }),
    body: {
      content: { "application/json": { schema: ProductCreateRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: ProductUpdatedResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": { schema: ValidationErrorResponseSchema },
      },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const productsPutHandler: RouteHandler<
  typeof productsPutRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) {
      const details = [{ field: "id", message: "無効な商品IDです" }];
      return c.json({ error: "バリデーションエラー" as const, details }, 400);
    }
    const body = await c.req.json();
    let input: z.infer<typeof ProductCreateRequestSchema>;
    try {
      input = ProductCreateRequestSchema.parse(body);
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
    const existing = await getProductById(db, id);
    if (!existing)
      return c.json({ error: "商品が見つかりません" } as const, 404);
    const updated = await updateProduct(db, id, {
      name: input.name,
      mercariSettings: input.mercariSettings
        ? {
            ...input.mercariSettings,
            categoryId: input.mercariSettings.categoryId ?? undefined,
          }
        : undefined,
    });
    return c.json(
      {
        success: true,
        message: "商品が正常に更新されました",
        data: updated,
      } as const,
      200
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const productsDeleteRoute = createRoute({
  method: "delete",
  path: "/products/{id}",
  request: { params: z.object({ id: z.string().regex(/^\d+$/) }) },
  responses: {
    200: {
      description: "Deleted",
      content: { "application/json": { schema: ProductDeletedResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const productsDeleteHandler: RouteHandler<
  typeof productsDeleteRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id))
      return c.json({ error: "無効な商品IDです" } as const, 400);
    const db = createDb(c.env);
    const existing = await getProductById(db, id);
    if (!existing)
      return c.json({ error: "商品が見つかりません" } as const, 404);
    const ok = await deleteProduct(db, id);
    if (!ok) return c.json({ error: "商品の削除に失敗しました" } as const, 500);
    return c.json(
      { success: true, message: "商品が正常に削除されました" } as const,
      200
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};
