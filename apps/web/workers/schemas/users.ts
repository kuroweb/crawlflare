import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.number().int(),
    email: z.string().email(),
    password: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("User");

export const UsersResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.array(UserSchema),
  })
  .openapi("UsersResponse");

export const UserFormRequestSchema = z
  .object({
    email: z.string().min(1).email().max(255),
    password: z.string().min(6).max(100),
  })
  .openapi("UserFormRequest");

export const UserResponseSchema = z
  .object({
    success: z.literal(true),
    data: UserSchema,
  })
  .openapi("UserResponse");


