import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

export const ValidationErrorDetailSchema = z
  .object({
    field: z.string(),
    message: z.string(),
  })
  .openapi("ValidationErrorDetail");

export const ValidationErrorResponseSchema = z
  .object({
    error: z.literal("バリデーションエラー"),
    details: z.array(ValidationErrorDetailSchema),
  })
  .openapi("ValidationErrorResponse");
