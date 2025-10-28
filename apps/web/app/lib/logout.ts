import { generateCookie } from "hono/cookie";
import { LOGIN_COOKIE_NAME } from "../../workers/middleware/auth";

export function createLogoutCookie(): string {
  return generateCookie(LOGIN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: import.meta.env.PROD,
  });
}
