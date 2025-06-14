import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLicenseSchema, insertCustomerSchema, insertSaleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // License routes
  app.get("/api/licenses", async (req, res) => {
    try {
      const licenses = await storage.getLicenses();
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch licenses" });
    }
  });

  app.get("/api/licenses/available", async (req, res) => {
    try {
      const licenses = await storage.getAvailableLicenses();
      
      // Group by type and count
      const licenseGroups = licenses.reduce((acc, license) => {
        if (!acc[license.type]) {
          acc[license.type] = {
            type: license.type,
            price: license.price,
            count: 0,
            sample: license
          };
        }
        acc[license.type].count++;
        return acc;
      }, {} as Record<string, any>);

      res.json(Object.values(licenseGroups));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available licenses" });
    }
  });

  app.post("/api/licenses", async (req, res) => {
    try {
      const addLicenseRequestSchema = z.object({
        type: z.string(),
        licenseKeys: z.array(z.string()),
        price: z.string().transform(val => val)
      });

      const { type, licenseKeys, price } = addLicenseRequestSchema.parse(req.body);
      
      const licensesToAdd = licenseKeys.map(key => ({
        type,
        licenseKey: key,
        price,
        isActive: true,
        isSold: false
      }));

      const validatedLicenses = licensesToAdd.map(license => 
        insertLicenseSchema.parse(license)
      );

      const addedLicenses = await storage.addLicenses(validatedLicenses);
      res.json(addedLicenses);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid license data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add licenses" });
      }
    }
  });

  app.delete("/api/licenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLicense(id);
      
      if (success) {
        res.json({ message: "License deleted successfully" });
      } else {
        res.status(404).json({ message: "License not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete license" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.json(existingCustomer);
      }

      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sales = await storage.getRecentSales(limit);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const purchaseSchema = z.object({
        licenseType: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string()
      });

      const { licenseType, customerEmail, customerName } = purchaseSchema.parse(req.body);

      // Get or create customer
      let customer = await storage.getCustomerByEmail(customerEmail);
      if (!customer) {
        customer = await storage.createCustomer({
          email: customerEmail,
          name: customerName
        });
      }

      // Find available license of the requested type
      const availableLicenses = await storage.getAvailableLicenses();
      const license = availableLicenses.find(l => l.type === licenseType);
      
      if (!license) {
        return res.status(400).json({ message: "License type not available" });
      }

      // Create sale
      const sale = await storage.createSale({
        licenseId: license.id,
        customerId: customer.id,
        amount: license.price,
        status: "active"
      });

      res.json({ sale, license, customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process purchase" });
      }
    }
  });

  // Dashboard metrics routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const [totalSales, availableLicenses, licensesSold, newCustomers] = await Promise.all([
        storage.getTotalSales(),
        storage.getAvailableLicenseCount(),
        storage.getSoldLicenseCount(),
        storage.getNewCustomerCount(30)
      ]);

      res.json({
        totalSales,
        availableLicenses,
        licensesSold,
        newCustomers
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
