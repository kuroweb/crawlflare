import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import type { Database } from "~/db/client";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export async function findUserByEmail(
  db: Database,
  email: string
): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function getAllUsers(db: Database): Promise<User[]> {
  return await db.select().from(users);
}

export async function verifyCredentials(
  db: Database,
  email: string,
  password: string
): Promise<boolean> {
  const rows = await db
    .select({ email: users.email, password: users.password })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  rows.length !== 0;

  if (rows.length === 0) return false;

  // TODO: パスワードはハッシュを保存し、ここで `bcryptjs` などで検証に置き換える
  return rows[0].password === password;
}
