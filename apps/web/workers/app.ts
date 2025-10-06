import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import type { RequestIdVariables } from "hono/request-id";
import productsRouter from "./api/products";
import usersRouter from "./api/users";
import { jsonLogger } from "./middleware/logger";
import { reactRouterHandler } from "./middleware/react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const app = new Hono<{ Bindings: Env; Variables: RequestIdVariables }>();

app.use(contextStorage());

// Logger Middleware
app.use("*", requestId());
app.use("*", jsonLogger());

// Basic Auth
app.use("*", async (c, next) => {
  const username = c.env.BASIC_AUTH_USER;
  const password = c.env.BASIC_AUTH_PASS;
  return basicAuth({ username, password })(c, next);
});

// API Routes
app.route("/api/products", productsRouter);
app.route("/api/users", usersRouter);

// React Router
app.use("*", reactRouterHandler());

export default app;
