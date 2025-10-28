import { generateCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { LOGIN_COOKIE_NAME } from "../../workers/middleware/auth";

export async function createLoginCookie(
  email: string,
  jwtSecret: string
): Promise<string> {
  // 有効期限
  const JWT_EXP = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24時間
  const COOKIE_MAX_AGE = 60 * 60 * 24; // 24時間

  const token = await sign({ exp: JWT_EXP, data: { email } }, jwtSecret, "HS256");

  return generateCookie(LOGIN_COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: import.meta.env.PROD,
  });
}

export function createLogoutCookie(): string {
  return generateCookie(LOGIN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: import.meta.env.PROD,
  });
}
