import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import {
  InsertLead,
  InsertUser,
  inventory,
  leads,
  products,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type CatalogFilters = {
  query?: string;
  model?: string;
  category?: string;
  limit?: number;
};

export async function listCatalogProducts(filters: CatalogFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const query = filters.query?.trim();
  const conditions = [eq(products.active, true)];
  if (filters.model) conditions.push(eq(products.model, filters.model));
  if (filters.category) conditions.push(eq(products.category, filters.category));
  if (query) {
    const search = `%${query}%`;
    conditions.push(or(like(products.title, search), like(products.oemNumber, search), like(products.model, search))!);
  }

  const rows = await db
    .select({
      product: products,
      availableQty: sql<number>`coalesce(sum(${inventory.availableQty} - ${inventory.reservedQty}), 0)`,
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .where(and(...conditions))
    .groupBy(products.id)
    .orderBy(desc(products.updatedAt))
    .limit(Math.min(filters.limit ?? 24, 50));

  return rows.map(({ product, availableQty }) => ({
    ...product,
    price: Number(product.price),
    availableQty: Number(availableQty ?? 0),
    stockLabel: Number(availableQty ?? 0) > 0 ? `متوفر · ${Number(availableQty)} قطعة` : "غير متوفر",
  }));
}

export async function createLead(input: InsertLead) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }
  const result = await db.insert(leads).values(input);
  return { id: result[0].insertId };
}

export async function listRecentLeads(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(Math.min(limit, 100));
}
