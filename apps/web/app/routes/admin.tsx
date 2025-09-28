import { redirect, type LoaderFunctionArgs } from "react-router";
import { verify } from "hono/jwt";
import { LOGIN_COOKIE_NAME } from "~/lib/createLoginCookie";
import { getCookieValue } from "~/lib/getCookieValue";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = getCookieValue(cookieHeader, LOGIN_COOKIE_NAME);
  if (!token) return redirect("/admin/login");

  try {
    await verify(token, context.cloudflare.env.LOGIN_JWT_SECRET);
  } catch (_) {
    return redirect("/admin/login");
  }

  return {};
}

export default function Admin() {
  return (
    <div>
      <h1>Admin Page</h1>
    </div>
  );
}
