import { z } from "zod";

// 商品作成フォームのバリデーションスキーマ
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "商品名は2文字以上である必要があります")
    .max(100, "商品名は100文字以下である必要があります"),
  mercariSettings: z
    .object({
      keyword: z.string().min(1, "検索キーワードは必須です"),
      categoryId: z
        .union([
          z
            .number()
            .int("カテゴリIDは整数である必要があります")
            .min(0, "カテゴリIDは0以上である必要があります"),
          z.nan().transform(() => null),
        ])
        .nullable()
        .optional(),
      minPrice: z
        .number()
        .int("最低価格は整数である必要があります")
        .min(0, "価格は0円以上である必要があります"),
      maxPrice: z
        .number()
        .int("最高価格は整数である必要があります")
        .min(0, "価格は0円以上である必要があります"),
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
});

// 型推論
export type ProductFormData = z.infer<typeof productFormSchema>;
