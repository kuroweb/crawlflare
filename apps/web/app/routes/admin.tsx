import { redirect, type LoaderFunctionArgs } from "react-router";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  if (!authenticated) return redirect("/admin/login");

  return {};
}

export default function Admin() {
  return (
    <>
      <Layout>
        <h1>Admin Page</h1>
      </Layout>
    </>
  );
}
