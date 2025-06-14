import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
  boolean,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "ASTER Pro-2", "ASTER Pro-3", etc.
  licenseKey: text("license_key").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isSold: boolean("is_sold").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  licenseId: integer("license_id").notNull().references(() => licenses.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"), // "active", "deactivated"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("customer"), // "admin", "customer"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Refund requests table
export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// License deactivation requests table
export const deactivationRequests = pgTable("deactivation_requests", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertRefundRequestSchema = createInsertSchema(refundRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeactivationRequestSchema = createInsertSchema(deactivationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;
export type DeactivationRequest = typeof deactivationRequests.$inferSelect;
export type InsertDeactivationRequest = z.infer<typeof insertDeactivationRequestSchema>;
