import { z } from "@hono/zod-openapi";

export const ProductSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Product");

export const MercariCrawlSettingSchema = z
  .object({
    id: z.number().int(),
    productId: z.number().int(),
    keyword: z.string(),
    categoryId: z.number().int().nullable().optional(),
    minPrice: z.number().int(),
    maxPrice: z.number().int(),
    enabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("MercariCrawlSetting");

export const ProductWithSettingSchema = ProductSchema.extend({
  mercariSettings: MercariCrawlSettingSchema.nullable(),
}).openapi("ProductWithSetting");

export const ProductCreateRequestSchema = z
  .object({
    name: z.string().min(1).max(100),
    mercariSettings: z
      .object({
        keyword: z.string().min(1),
        categoryId: z.number().int().nullable().optional(),
        minPrice: z.number().int().min(0),
        maxPrice: z.number().int().min(0),
        enabled: z.boolean(),
      })
      .optional()
      .refine(
        (data) => {
          if (!data) return true;
          return data.maxPrice >= data.minPrice;
        },
        {
          message: "最高価格は最低価格以上である必要があります",
          path: ["maxPrice"],
        }
      ),
  })
  .openapi("ProductCreateRequest");

export const ProductsResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.array(ProductWithSettingSchema),
  })
  .openapi("ProductsResponse");

export const ProductCreatedResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    data: z.object({
      product: ProductSchema,
      mercariSettings: z
        .object({
          keyword: z.string(),
          categoryId: z.number().int().nullable().optional(),
          minPrice: z.number().int(),
          maxPrice: z.number().int(),
          enabled: z.boolean(),
        })
        .nullable()
        .optional(),
    }),
  })
  .openapi("ProductCreatedResponse");

export const ProductUpdatedResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    data: ProductWithSettingSchema,
  })
  .openapi("ProductUpdatedResponse");

export const ProductDeletedResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi("ProductDeletedResponse");
