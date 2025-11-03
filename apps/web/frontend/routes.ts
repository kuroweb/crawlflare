import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin/login", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("admin/products", "routes/admin.products.tsx"),
] satisfies RouteConfig;
