import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { contextStorage } from "hono/context-storage";
import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const app = new Hono<{ Bindings: Env }>();
app.use(contextStorage());

// Basic認証
app.use(async (c, next) => {
  const username = c.env.BASIC_AUTH_USER;
  const password = c.env.BASIC_AUTH_PASS;
  return basicAuth({ username, password })(c, next);
});

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
