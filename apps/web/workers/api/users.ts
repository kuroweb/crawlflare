import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import {
  UsersResponseSchema,
  UserFormRequestSchema,
  UserResponseSchema,
} from "../schemas/users";
import { ErrorResponseSchema } from "../schemas/common";
import { createDb } from "../../db/client";
import {
  getAllUsers,
  createUser,
  findUserById,
  updateUser,
  deleteUser,
} from "../models/users";
import type { AuthVariables } from "../middleware/auth";

export const usersGetRoute = createRoute({
  method: "get",
  path: "/users",
  request: {},
  responses: {
    200: {
      description: "List users",
      content: { "application/json": { schema: UsersResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const usersGetHandler: RouteHandler<
  typeof usersGetRoute,
  { Bindings: Env }
> = async (c) => {
  try {
    const db = createDb(c.env);
    const users = await getAllUsers(db);
    return c.json({ success: true, data: users } as const, 200);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const usersPostRoute = createRoute({
  method: "post",
  path: "/users",
  request: {
    body: {
      content: { "application/json": { schema: UserFormRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
export const usersPostHandler: RouteHandler<
  typeof usersPostRoute,
  { Bindings: Env }
> = async (c) => {
  try {
    const body = await c.req.json();
    let input: z.infer<typeof UserFormRequestSchema>;
    try {
      input = UserFormRequestSchema.parse(body);
    } catch (e) {
      if (e instanceof z.ZodError)
        return c.json({ error: "入力データが無効です" } as const, 400);
      throw e;
    }
    const db = createDb(c.env);
    const user = await createUser(db, input);
    return c.json({ success: true, data: user } as const, 200);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const usersPutRoute = createRoute({
  method: "put",
  path: "/users/{id}",
  request: {
    params: z.object({ id: z.string().regex(/^\d+$/) }),
    body: {
      content: { "application/json": { schema: UserFormRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Forbidden",
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
export const usersPutHandler: RouteHandler<
  typeof usersPutRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id))
      return c.json({ error: "無効なIDです" } as const, 400);

    const currentUser = c.get("currentUser");
    if (currentUser.id !== id) {
      return c.json(
        { error: "他のユーザーの情報は更新できません" } as const,
        403
      );
    }

    const body = await c.req.json();
    let input: z.infer<typeof UserFormRequestSchema>;
    try {
      input = UserFormRequestSchema.parse(body);
    } catch (e) {
      if (e instanceof z.ZodError)
        return c.json({ error: "入力データが無効です" } as const, 400);
      throw e;
    }
    const db = createDb(c.env);
    const existing = await findUserById(db, id);
    if (!existing)
      return c.json({ error: "ユーザーが見つかりません" } as const, 404);
    const user = await updateUser(db, id, input);
    return c.json({ success: true, data: user } as const, 200);
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

export const usersDeleteRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  request: { params: z.object({ id: z.string().regex(/^\d+$/) }) },
  responses: {
    200: {
      description: "Deleted",
      content: {
        "application/json": {
          schema: z.object({ success: z.literal(true), message: z.string() }),
        },
      },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    403: {
      description: "Forbidden",
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
export const usersDeleteHandler: RouteHandler<
  typeof usersDeleteRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id))
      return c.json({ error: "無効なIDです" } as const, 400);

    const currentUser = c.get("currentUser");
    if (currentUser.id !== id) {
      return c.json({ error: "他のユーザーは削除できません" } as const, 403);
    }

    const db = createDb(c.env);
    const existing = await findUserById(db, id);
    if (!existing)
      return c.json({ error: "ユーザーが見つかりません" } as const, 404);
    await deleteUser(db, id);
    return c.json(
      { success: true, message: "ユーザーが削除されました" } as const,
      200
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};
