import {
  useActionData,
  type ActionFunctionArgs,
  redirect,
  Form,
} from "react-router";

import { sign } from "hono/jwt";
import { createAdminTokenCookie } from "../lib/createAdminTokenCookie";

export async function action({ request }: ActionFunctionArgs) {
  const id = "admin";
  const password = "admin";
  const body = await request.formData();
  if (body.get("id") === id && body.get("password") === password) {
    const token = await sign(
      { exp: Math.round(Date.now() / 1000 + 60 * 60), data: { id } },
      import.meta.env.VITE_ADMIN_JWT_SECRET,
      "HS256"
    );

    return redirect("/admin", {
      headers: {
        "Set-Cookie": createAdminTokenCookie(token),
      },
    });
  } else {
    return {
      errors: {},
    };
  }
}

export default function AdminLogin() {
  const data = useActionData();

  return (
    <Form method="post">
      <input type="text" name="id" placeholder="ID" />
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Login</button>
      {data?.errors && <p>Invalid ID or Password</p>}
    </Form>
  );
}
