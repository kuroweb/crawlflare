import type { MiddlewareHandler } from "hono";
import { createRequestHandler } from "react-router";

export const reactRouterHandler = (): MiddlewareHandler<{
  Bindings: Env;
}> => {
  return async (c) => {
    // @ts-ignore
    const requestHandler = createRequestHandler(
      // @ts-ignore
      () => import("../build/server/index.js"),
      import.meta.env?.MODE
    );

    return requestHandler(c.req.raw, {
      cloudflare: { env: c.env, ctx: c.executionCtx },
    });
  };
};
