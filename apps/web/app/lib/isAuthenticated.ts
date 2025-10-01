import { type LoaderFunctionArgs } from "react-router";
import { verify } from "hono/jwt";
import { LOGIN_COOKIE_NAME } from "~/lib/createLoginCookie";
import { getCookieValue } from "~/lib/getCookieValue";

export async function isAuthenticated({
  request,
  context,
}: LoaderFunctionArgs): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie");
  const token = getCookieValue(cookieHeader, LOGIN_COOKIE_NAME);

  if (!token) {
    return false;
  }

  try {
    await verify(token, context.cloudflare.env.LOGIN_JWT_SECRET);
    return true;
  } catch (_) {
    return false;
  }
}
