import { int, mysqlEnum, mysqlTable, timestamp, varchar, text, decimal, boolean, index, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 96 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  oemNumber: varchar("oemNumber", { length: 96 }).notNull(),
  brand: varchar("brand", { length: 48 }).notNull(),
  model: varchar("model", { length: 96 }).notNull(),
  generation: varchar("generation", { length: 96 }),
  modelYears: varchar("modelYears", { length: 96 }),
  engine: varchar("engine", { length: 96 }),
  category: varchar("category", { length: 96 }).notNull(),
  position: varchar("position", { length: 48 }),
  supplier: varchar("supplier", { length: 128 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  isOriginal: boolean("isOriginal").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  oemIdx: index("products_oem_idx").on(table.oemNumber),
  modelIdx: index("products_model_idx").on(table.model),
  categoryIdx: index("products_category_idx").on(table.category),
}));

export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  locationName: varchar("locationName", { length: 128 }).notNull().default("الحرفيين - المركز الرئيسي"),
  availableQty: int("availableQty").notNull().default(0),
  reservedQty: int("reservedQty").notNull().default(0),
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
}, (table) => ({
  productLocationIdx: uniqueIndex("inventory_product_location_idx").on(table.productId, table.locationName),
  locationIdx: index("inventory_location_idx").on(table.locationName),
}));

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  productId: int("productId"),
  name: varchar("name", { length: 160 }),
  phone: varchar("phone", { length: 32 }),
  vin: varchar("vin", { length: 64 }),
  query: text("query").notNull(),
  mode: mysqlEnum("mode", ["text", "code", "image", "vehicle"]).default("text").notNull(),
  source: varchar("source", { length: 48 }).default("storefront").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("leads_status_idx").on(table.status),
  createdAtIdx: index("leads_created_at_idx").on(table.createdAt),
}));

export const wpcResearchRecords = mysqlTable("wpc_research_records", {
  id: int("id").autoincrement().primaryKey(),
  researchId: varchar("researchId", { length: 32 }).notNull().unique(),
  queryType: mysqlEnum("queryType", ["OEM", "VIN", "VEHICLE", "OEM_VEHICLE", "BATCH_OEM"]).notNull(),
  originalQuery: text("originalQuery").notNull(),
  normalizedQuery: text("normalizedQuery").notNull(),
  vinRedacted: varchar("vinRedacted", { length: 64 }),
  status: mysqlEnum("status", ["needs_manual_wpc", "confirmed", "login_required", "session_expired", "blocked", "no_results", "ambiguous"]).default("needs_manual_wpc").notNull(),
  confidence: mysqlEnum("confidence", ["UNVERIFIED", "WPC_CONFIRMED", "HIGH", "MEDIUM", "LOW"]).default("UNVERIFIED").notNull(),
  source: varchar("source", { length: 128 }).notNull().default("Hyundai Mobis WPC"),
  sourceUrl: text("sourceUrl"),
  resultJson: text("resultJson").notNull(),
  evidenceJson: text("evidenceJson").notNull().default("[]"),
  notesJson: text("notesJson").notNull().default("[]"),
  createdBy: int("createdBy"),
  retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
}, (table) => ({
  queryTypeIdx: index("wpc_query_type_idx").on(table.queryType),
  statusIdx: index("wpc_status_idx").on(table.status),
  retrievedAtIdx: index("wpc_retrieved_at_idx").on(table.retrievedAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type WpcResearchRecord = typeof wpcResearchRecords.$inferSelect;
export type InsertWpcResearchRecord = typeof wpcResearchRecords.$inferInsert;
