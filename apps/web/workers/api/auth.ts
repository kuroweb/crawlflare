import { createRoute, type RouteHandler, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../schemas/common";
import { createDb } from "../../db/client";
import { findUserByEmail } from "../models/users";
import { generateCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { LOGIN_COOKIE_NAME, type AuthVariables } from "../middleware/auth";
import * as bcrypt from "bcryptjs";

const LoginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    userId: z.number(),
  }),
});

export const authLoginRoute = createRoute({
  method: "post",
  path: "/auth/login",
  request: {
    body: {
      content: { "application/json": { schema: LoginRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "ログイン成功",
      content: { "application/json": { schema: LoginResponseSchema } },
    },
    401: {
      description: "認証エラー",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "サーバーエラー",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authLoginHandler: RouteHandler<
  typeof authLoginRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  try {
    const body = await c.req.json();
    let input: z.infer<typeof LoginRequestSchema>;
    try {
      input = LoginRequestSchema.parse(body);
    } catch (e) {
      if (e instanceof z.ZodError)
        return c.json({ error: "入力データが無効です" } as const, 401);
      throw e;
    }

    const db = createDb(c.env);
    const user = await findUserByEmail(db, input.email);

    if (!user) {
      return c.json(
        { error: "メールアドレスまたはパスワードが正しくありません" } as const,
        401
      );
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      return c.json(
        { error: "メールアドレスまたはパスワードが正しくありません" } as const,
        401
      );
    }

    const jwtSecret = c.env.LOGIN_JWT_SECRET;
    const JWT_EXP = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24時間
    const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間

    const token = await sign(
      { exp: JWT_EXP, data: { userId: user.id } },
      jwtSecret,
      "HS256"
    );

    const cookie = generateCookie(LOGIN_COOKIE_NAME, token, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: true,
    });

    return c.json(
      {
        success: true,
        message: "ログインに成功しました",
        data: {
          userId: user.id,
        },
      } as const,
      200,
      {
        "Set-Cookie": cookie,
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "サーバーエラーが発生しました" } as const, 500);
  }
};

const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const authLogoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  request: {},
  responses: {
    200: {
      description: "ログアウト成功",
      content: { "application/json": { schema: LogoutResponseSchema } },
    },
  },
});

export const authLogoutHandler: RouteHandler<
  typeof authLogoutRoute,
  { Bindings: Env; Variables: AuthVariables }
> = async (c) => {
  const cookie = generateCookie(LOGIN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: true,
  });

  return c.json(
    {
      success: true,
      message: "ログアウトしました",
    } as const,
    200,
    {
      "Set-Cookie": cookie,
    }
  );
};
