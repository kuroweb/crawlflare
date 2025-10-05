import {
  useActionData,
  redirect,
  Form,
  useLoaderData,
  type ActionFunctionArgs,
  type AppLoadContext,
  type LoaderFunctionArgs,
} from "react-router";

import { createLoginCookie } from "../lib/login";
import { createDb } from "../../db/client";
import { verifyCredentials } from "models/users";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";

export async function action({
  request,
  context,
}: ActionFunctionArgs<AppLoadContext>) {
  const form = await request.formData();
  const inputEmail = String(form.get("email") || "").trim();
  const inputPassword = String(form.get("password") || "").trim();

  if (!inputEmail || !inputPassword) {
    return { errors: { message: "Missing inputs." } };
  }

  const db = createDb(context.cloudflare.env);

  const ok = await verifyCredentials(db, inputEmail, inputPassword);
  if (!ok) {
    return { errors: { message: "Invalid Email or Password" } };
  }

  const token = await createLoginCookie(
    inputEmail,
    context.cloudflare.env.LOGIN_JWT_SECRET
  );
  return redirect("/", { headers: { "Set-Cookie": token } });
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
