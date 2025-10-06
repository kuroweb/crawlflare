import { Hono } from "hono";
import { createDb } from "../../db/client";
import { getAllUsers } from "../../models/users";

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

export default usersRouter;
