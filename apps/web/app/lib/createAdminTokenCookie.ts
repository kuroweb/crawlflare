import { generateCookie } from "hono/cookie";

// /admin用のクッキーを生成
export function createAdminTokenCookie(token: string): string {
  return generateCookie("admin-token", token, {
    maxAge: 60 * 60 * 24, // 24時間
    path: "/admin",
    httpOnly: true,
    sameSite: "Lax",
    secure: import.meta.env.PROD,
  });
}
