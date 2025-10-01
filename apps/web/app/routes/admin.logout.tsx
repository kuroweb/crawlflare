import { redirect, type ActionFunctionArgs } from "react-router";
import { createLogoutCookie } from "~/lib/logout";

export async function action({ request }: ActionFunctionArgs) {
  const cookie = createLogoutCookie();
  return redirect("/admin/login", {
    headers: { "Set-Cookie": cookie },
  });
}

export default function Logout() {
  return null;
}
