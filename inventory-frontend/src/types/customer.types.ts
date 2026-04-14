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

export interface CustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
