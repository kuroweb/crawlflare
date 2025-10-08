import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import {
  usersGetRoute,
  usersGetHandler,
  usersPostRoute,
  usersPostHandler,
  usersPutRoute,
  usersPutHandler,
  usersDeleteRoute,
  usersDeleteHandler,
} from "./users";
import {
  productsGetRoute,
  productsGetHandler,
  productsPostRoute,
  productsPostHandler,
  productsPutRoute,
  productsPutHandler,
  productsDeleteRoute,
  productsDeleteHandler,
} from "./products";

const ApiRouter = new OpenAPIHono<{ Bindings: Env }>();

ApiRouter.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "crawlflare API", version: "0.1.0" },
  servers: [{ url: "/api" }],
});

ApiRouter.openapi(usersGetRoute, usersGetHandler);
ApiRouter.openapi(usersPostRoute, usersPostHandler);
ApiRouter.openapi(usersPutRoute, usersPutHandler);
ApiRouter.openapi(usersDeleteRoute, usersDeleteHandler);
ApiRouter.openapi(productsGetRoute, productsGetHandler);
ApiRouter.openapi(productsPostRoute, productsPostHandler);
ApiRouter.openapi(productsPutRoute, productsPutHandler);
ApiRouter.openapi(productsDeleteRoute, productsDeleteHandler);

ApiRouter.get("/docs", swaggerUI({ url: "/api/openapi.json" }));

export default ApiRouter;
