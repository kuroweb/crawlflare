import {
  useActionData,
  redirect,
  Form,
  type ActionFunctionArgs,
  type AppLoadContext,
} from "react-router";

import { createLoginCookie } from "../lib/createLoginCookie";

export async function action({
  request,
  context,
}: ActionFunctionArgs<AppLoadContext>) {
  const form = await request.formData();
  const inputId = String(form.get("id") || "").trim();
  const inputPassword = String(form.get("password") || "").trim();

  if (!inputId || !inputPassword) {
    return { errors: { message: "Missing inputs." } };
  }

  // TODO: ORMを導入
  const db = context.cloudflare.env.DB;

  // TODO: passwordをハッシュ化
  const result = await db
    .prepare("SELECT id FROM users WHERE id = ? AND password = ?")
    .bind(inputId, inputPassword)
    .all<{ id: string }>();

  const matched = Array.isArray(result.results) && result.results.length > 0;
  if (!matched) {
    return { errors: { message: "Invalid ID or Password" } };
  }

  const token = await createLoginCookie(
    inputId,
    context.cloudflare.env.LOGIN_JWT_SECRET
  );
  return redirect("/admin", { headers: { "Set-Cookie": token } });
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
