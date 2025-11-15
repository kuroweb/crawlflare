import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import type { RequestIdVariables } from "hono/request-id";
import ApiRouter from "./api";
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
app.route("/api", ApiRouter);

// React Router
app.use(async (c) => {
  // @ts-ignore
  const requestHandler = createRequestHandler(
    // @ts-ignore
    () => import("../build/server/index.js"),
    import.meta.env?.MODE
  );
  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
