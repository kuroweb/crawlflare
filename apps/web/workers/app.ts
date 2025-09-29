import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { contextStorage } from "hono/context-storage";
import { createRequestHandler } from "react-router";
import { requestId } from "hono/request-id";
import type { RequestIdVariables } from "hono/request-id";

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

// JSON Logger
app.use("*", requestId());
app.use(async (c, next) => {
  const start = Date.now();
  const base = {
    time: new Date(start).toISOString(),
    requestId: c.get("requestId"),
    phase: "start",
    method: c.req.method,
    path: c.req.path,
  };

  console.log(
    JSON.stringify({
      ...base,
      status: null,
      elapsed: null,
    })
  );

  await next();

  const end = Date.now();
  console.log(
    JSON.stringify({
      ...base,
      time: new Date(end).toISOString(),
      phase: "finished",
      status: c.res.status,
      elapsed: `${end - start}ms`,
    })
  );
});

// Basic Auth
app.use(async (c, next) => {
  const username = c.env.BASIC_AUTH_USER;
  const password = c.env.BASIC_AUTH_PASS;
  return basicAuth({ username, password })(c, next);
});

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
