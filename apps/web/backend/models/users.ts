import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Database } from "../db/client";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export async function findUserByEmail(
  db: Database,
  email: string
): Promise<User | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserById(
  db: Database,
  id: number
): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllUsers(db: Database): Promise<User[]> {
  return await db.select().from(users);
}

export async function createUser(
  db: Database,
  userData: { email: string; password: string }
): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      email: userData.email,
      password: userData.password,
    })
    .returning();
  return user;
}

export async function updateUser(
  db: Database,
  id: number,
  userData: { email: string; password: string }
): Promise<User> {
  const [user] = await db
    .update(users)
    .set({
      email: userData.email,
      password: userData.password,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(db: Database, id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
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
