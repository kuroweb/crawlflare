import {
  useActionData,
  redirect,
  Form,
  type ActionFunctionArgs,
} from "react-router";

import { createLoginCookie } from "../lib/createLoginCookie";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();

  // TODO: データベース上のユーザー情報と照合させる
  const id = "admin";
  const password = "admin";
  if (body.get("id") === id && body.get("password") === password) {
    const token = await createLoginCookie(id);

    return redirect("/admin", {
      headers: { "Set-Cookie": token },
    });
  } else {
    return { errors: {} };
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
