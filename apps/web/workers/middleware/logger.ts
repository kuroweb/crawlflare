import type { MiddlewareHandler } from "hono";
import type { RequestIdVariables } from "hono/request-id";

export interface LogEntry {
  time: string;
  requestId: string;
  phase: "start" | "finished";
  method: string;
  path: string;
  status?: number;
  elapsed?: string;
}

export const jsonLogger = (): MiddlewareHandler<{
  Variables: RequestIdVariables;
}> => {
  return async (c, next) => {
    const start = Date.now();
    const base: Omit<LogEntry, "status" | "elapsed"> = {
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
  };
};
