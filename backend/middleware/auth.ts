import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { MiddlewareHandler } from "hono";
import * as usersModel from "../models/users";
import type { User } from "../models/users";
import { createDb } from "../db/client";

export const LOGIN_COOKIE_NAME = "login-token";

export interface AuthVariables {
  currentUser: User;
}

export const authMiddleware = (): MiddlewareHandler<{
  Bindings: Env;
  Variables: AuthVariables;
}> => {
  return async (c, next) => {
    const token = getCookie(c, LOGIN_COOKIE_NAME);

    if (!token) {
      return c.json({ error: "認証が必要です" }, 401);
    }

    try {
      const jwtSecret = c.env.LOGIN_JWT_SECRET;
      const payload = (await verify(token, jwtSecret, "HS256")) as {
        exp: number;
        data: { userId: number };
      };

      if (!payload.data || typeof payload.data.userId !== "number") {
        return c.json({ error: "不正なトークンです" }, 401);
      }

      const userId = payload.data.userId;
      const db = createDb(c.env);
      const user = await usersModel.findUserById(db, userId);

      if (!user) {
        return c.json({ error: "ユーザーが見つかりません" }, 401);
      }

      c.set("currentUser", user);
      await next();
    } catch (error) {
      console.error("JWT verification error:", error);
      return c.json({ error: "認証に失敗しました" }, 401);
    }
  };
};
