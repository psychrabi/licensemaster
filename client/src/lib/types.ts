export interface LicenseType {
  type: string;
  price: string;
  count: number;
  sample: {
    id: number;
    type: string;
    price: string;
    isActive: boolean;
    isSold: boolean;
  };
}

export interface DashboardMetrics {
  totalSales: number;
  availableLicenses: number;
  licensesSold: number;
  newCustomers: number;
}

export interface RecentSale {
  id: number;
  amount: string;
  status: string;
  createdAt: string;
  license: {
    type: string;
    licenseKey: string;
  };
  customer: {
    name: string;
    email: string;
  };
}

export interface Activity {
  type: string;
  description: string;
  timestamp: string;
}
