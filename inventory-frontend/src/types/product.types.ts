export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  active: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId: string;
}

export interface StockAdjustmentRequest {
  quantity: number;
  reason: string;
}
