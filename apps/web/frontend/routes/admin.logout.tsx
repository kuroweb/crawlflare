import { redirect, type ActionFunctionArgs } from "react-router";
import { serverApi } from "~/lib/api";

export async function action({ request }: ActionFunctionArgs) {
  const response = await serverApi(request, "/api/auth/logout", {
    method: "POST",
  });

  const setCookie = response.headers.get("Set-Cookie");
  return redirect("/", {
    headers: setCookie ? { "Set-Cookie": setCookie } : {},
  });
}

export default function Logout() {
  return null;
}
