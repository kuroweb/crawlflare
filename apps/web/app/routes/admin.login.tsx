import {
  useActionData,
  redirect,
  Form,
  useLoaderData,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
} from "react-router";

import { isAuthenticated } from "~/lib/isAuthenticated";
import { serverApi } from "~/lib/api";
import Layout from "~/components/layouts/Layout";

export async function action({
  request,
  context,
}: ActionFunctionArgs<AppLoadContext>) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "").trim();

  if (!email || !password) {
    return { errors: { message: "メールアドレスとパスワードを入力してください" } };
  }

  const response = await serverApi(request, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { errors: { message: "メールアドレスまたはパスワードが正しくありません" } };
  }

  const setCookie = response.headers.get("Set-Cookie");
  return redirect("/", {
    headers: setCookie ? { "Set-Cookie": setCookie } : {},
  });
}

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  return { authenticated };
}

export default function AdminLogin() {
  const data = useActionData();
  const { authenticated } = useLoaderData<typeof loader>();

  return (
    <>
      <Layout authenticated={authenticated}>
        <Form method="post">
          <input type="text" name="email" placeholder="Email" />
          <input type="password" name="password" placeholder="Password" />
          <button type="submit">Login</button>
          {data?.errors && <p>Invalid Email or Password</p>}
        </Form>
      </Layout>
    </>
  );
}
