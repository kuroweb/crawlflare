import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle>;

export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}
