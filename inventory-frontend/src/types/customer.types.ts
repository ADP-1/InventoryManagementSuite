export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  totalInvoices: number;
  totalSpent: number;
  firstTransactionDate: string | null;
}

export interface CustomerDetailsResponse {
  profile: CustomerResponse;
  stats: CustomerStats;
}

export interface CustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
