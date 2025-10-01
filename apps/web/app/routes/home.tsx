import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Layout from "../components/layouts/Layout";
import { isAuthenticated } from "~/lib/isAuthenticated";
import { redirect, type LoaderFunctionArgs } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  if (!authenticated) return redirect("/admin/login");

  return { message: args.context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Layout>
        <Welcome message={loaderData.message} />
      </Layout>
    </>
  );
}
