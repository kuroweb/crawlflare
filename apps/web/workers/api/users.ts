import { Hono } from "hono";
import { createDb } from "../../db/client";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  findUserById,
} from "../../models/users";
import { userFormSchema } from "../lib/schemas";

const usersRouter = new Hono<{ Bindings: Env }>();

// GET: /api/users
usersRouter.get("/", async (c) => {
  try {
    const db = createDb(c.env);
    const users = await getAllUsers(db);

    return c.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// POST: /api/users
usersRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = userFormSchema.parse(body);

    const db = createDb(c.env);
    const user = await createUser(db, validatedData);

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ error: "入力データが無効です" }, 400);
    }
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// PUT: /api/users/:id
usersRouter.put("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "無効なIDです" }, 400);
    }

    const body = await c.req.json();
    const validatedData = userFormSchema.parse(body);

    const db = createDb(c.env);

    // ユーザーが存在するかチェック
    const existingUser = await findUserById(db, id);
    if (!existingUser) {
      return c.json({ error: "ユーザーが見つかりません" }, 404);
    }

    const user = await updateUser(db, id, validatedData);

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ error: "入力データが無効です" }, 400);
    }
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

// DELETE: /api/users/:id
usersRouter.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ error: "無効なIDです" }, 400);
    }

    const db = createDb(c.env);

    // ユーザーが存在するかチェック
    const existingUser = await findUserById(db, id);
    if (!existingUser) {
      return c.json({ error: "ユーザーが見つかりません" }, 404);
    }

    await deleteUser(db, id);

    return c.json({
      success: true,
      message: "ユーザーが削除されました",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
});

export default usersRouter;
