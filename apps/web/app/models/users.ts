import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import type { Database } from "~/db/client";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export async function findUserById(
  db: Database,
  id: string
): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function verifyCredentials(
  db: Database,
  id: string,
  password: string
): Promise<boolean> {
  const rows = await db
    .select({ id: users.id, password: users.password })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  rows.length !== 0;

  if (rows.length === 0) return false;

  // TODO: パスワードはハッシュを保存し、ここで `bcryptjs` などで検証に置き換える
  return rows[0].password === password;
}
