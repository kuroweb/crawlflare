import { products } from "~/db/schema";
import type { Database } from "~/db/client";
import type { InferSelectModel } from "drizzle-orm";

export type Product = InferSelectModel<typeof products>;

export async function getAllProducts(db: Database): Promise<Product[]> {
  return await db.select().from(products);
}
