import { 
  licenses, 
  customers, 
  sales, 
  users,
  refundRequests,
  deactivationRequests,
  type License, 
  type Customer, 
  type Sale, 
  type User,
  type UpsertUser,
  type RefundRequest,
  type DeactivationRequest,
  type InsertLicense, 
  type InsertCustomer, 
  type InsertSale,
  type InsertRefundRequest,
  type InsertDeactivationRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // License management
  getLicenses(): Promise<License[]>;
  getLicensesByType(type: string): Promise<License[]>;
  getAvailableLicenses(): Promise<License[]>;
  addLicenses(licenses: InsertLicense[]): Promise<License[]>;
  updateLicense(id: number, updates: Partial<InsertLicense>): Promise<License | undefined>;
  deleteLicense(id: number): Promise<boolean>;
  
  // Customer management
  getCustomers(): Promise<Customer[]>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Sales management
  getSales(): Promise<Sale[]>;
  getSalesByCustomer(userId: string): Promise<(Sale & { license: License; customer: Customer })[]>;
  getRecentSales(limit?: number): Promise<(Sale & { license: License; customer: Customer })[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Dashboard metrics
  getTotalSales(): Promise<number>;
  getAvailableLicenseCount(): Promise<number>;
  getSoldLicenseCount(): Promise<number>;
  getNewCustomerCount(days?: number): Promise<number>;
  getRecentActivity(limit?: number): Promise<any[]>;
  
  // Request management
  createRefundRequest(request: InsertRefundRequest): Promise<RefundRequest>;
  createDeactivationRequest(request: InsertDeactivationRequest): Promise<DeactivationRequest>;
  getRefundRequests(): Promise<RefundRequest[]>;
  getDeactivationRequests(): Promise<DeactivationRequest[]>;
  updateRefundRequestStatus(id: number, status: string, adminNotes?: string): Promise<void>;
  updateDeactivationRequestStatus(id: number, status: string, adminNotes?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getLicenses(): Promise<License[]> {
    return await db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async getLicensesByType(type: string): Promise<License[]> {
    return await db.select().from(licenses).where(eq(licenses.type, type));
  }

  async getAvailableLicenses(): Promise<License[]> {
    return await db.select().from(licenses).where(
      and(eq(licenses.isActive, true), eq(licenses.isSold, false))
    );
  }

  async addLicenses(licensesToAdd: InsertLicense[]): Promise<License[]> {
    return await db.insert(licenses).values(licensesToAdd).returning();
  }

  async updateLicense(id: number, updates: Partial<InsertLicense>): Promise<License | undefined> {
    const [updated] = await db
      .update(licenses)
      .set(updates)
      .where(eq(licenses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLicense(id: number): Promise<boolean> {
    const result = await db.delete(licenses).where(eq(licenses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getRecentSales(limit: number = 10): Promise<(Sale & { license: License; customer: Customer })[]> {
    const result = await db
      .select()
      .from(sales)
      .innerJoin(licenses, eq(sales.licenseId, licenses.id))
      .innerJoin(customers, eq(sales.customerId, customers.id))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.sales,
      license: row.licenses,
      customer: row.customers
    }));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    
    // Mark license as sold
    await db
      .update(licenses)
      .set({ isSold: true })
      .where(eq(licenses.id, sale.licenseId));
    
    return created;
  }

  async getTotalSales(): Promise<number> {
    const result = await db
      .select({ total: sum(sales.amount) })
      .from(sales)
      .where(eq(sales.status, "active"));
    
    return Number(result[0]?.total || 0);
  }

  async getAvailableLicenseCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(licenses)
      .where(and(eq(licenses.isActive, true), eq(licenses.isSold, false)));
    
    return result[0]?.count || 0;
  }

  async getSoldLicenseCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(licenses)
      .where(eq(licenses.isSold, true));
    
    return result[0]?.count || 0;
  }

  async getNewCustomerCount(days: number = 30): Promise<number> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    const result = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.createdAt, dateThreshold));
    
    return result[0]?.count || 0;
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const recentSales = await db
      .select({
        description: licenses.type,
        customerName: customers.name,
        timestamp: sales.createdAt
      })
      .from(sales)
      .innerJoin(licenses, eq(sales.licenseId, licenses.id))
      .innerJoin(customers, eq(sales.customerId, customers.id))
      .orderBy(desc(sales.createdAt))
      .limit(limit);

    return recentSales.map(activity => ({
      type: 'sale',
      description: `${activity.description} sold to ${activity.customerName}`,
      timestamp: activity.timestamp
    }));
  }

  async getSalesByCustomer(userId: string): Promise<(Sale & { license: License; customer: Customer })[]> {
    return await db
      .select({
        id: sales.id,
        licenseId: sales.licenseId,
        customerId: sales.customerId,
        amount: sales.amount,
        status: sales.status,
        createdAt: sales.createdAt,
        license: licenses,
        customer: customers,
      })
      .from(sales)
      .innerJoin(licenses, eq(sales.licenseId, licenses.id))
      .innerJoin(customers, eq(sales.customerId, customers.id))
      .innerJoin(users, eq(customers.email, users.email))
      .where(eq(users.id, userId))
      .orderBy(desc(sales.createdAt));
  }

  async createRefundRequest(request: InsertRefundRequest): Promise<RefundRequest> {
    const [created] = await db.insert(refundRequests).values(request).returning();
    return created;
  }

  async createDeactivationRequest(request: InsertDeactivationRequest): Promise<DeactivationRequest> {
    const [created] = await db.insert(deactivationRequests).values(request).returning();
    return created;
  }

  async getRefundRequests(): Promise<RefundRequest[]> {
    return await db.select().from(refundRequests).orderBy(desc(refundRequests.createdAt));
  }

  async getDeactivationRequests(): Promise<DeactivationRequest[]> {
    return await db.select().from(deactivationRequests).orderBy(desc(deactivationRequests.createdAt));
  }

  async updateRefundRequestStatus(id: number, status: string, adminNotes?: string): Promise<void> {
    await db
      .update(refundRequests)
      .set({ 
        status, 
        adminNotes,
        updatedAt: new Date() 
      })
      .where(eq(refundRequests.id, id));
  }

  async updateDeactivationRequestStatus(id: number, status: string, adminNotes?: string): Promise<void> {
    await db
      .update(deactivationRequests)
      .set({ 
        status, 
        adminNotes,
        updatedAt: new Date() 
      })
      .where(eq(deactivationRequests.id, id));

    // If approved, update the sale status
    if (status === "approved") {
      const [request] = await db
        .select()
        .from(deactivationRequests)
        .where(eq(deactivationRequests.id, id));
      
      if (request) {
        await db
          .update(sales)
          .set({ status: "deactivated" })
          .where(eq(sales.id, request.saleId));
      }
    }
  }
}

export const storage = new DatabaseStorage();
