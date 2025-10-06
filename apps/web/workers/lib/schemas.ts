import { z } from "zod";

// 商品作成APIのリクエストボディのバリデーションスキーマ
export const createProductRequestSchema = z.object({
  name: z
    .string()
    .min(1, "商品名は必須です")
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

// ユーザー作成・更新APIのリクエストボディのバリデーションスキーマ
export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("有効なメールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以下である必要があります"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上である必要があります")
    .max(100, "パスワードは100文字以下である必要があります"),
});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;

export function validateCreateProductRequest(data: unknown) {
  return createProductRequestSchema.safeParse(data);
}

export function validateUserFormData(data: unknown) {
  return userFormSchema.safeParse(data);
}

export type ValidationError = {
  field: string;
  message: string;
};

export function formatValidationErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}
