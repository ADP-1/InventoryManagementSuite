export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface InvoiceItemRequest {
  productId: string;
  quantity: number;
}

export interface InvoiceRequest {
  customerId: string;
  items: InvoiceItemRequest[];
  taxPercent: number;
  discount: number;
  notes?: string;
}

export interface InvoiceItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  createdById: string;
  createdByName: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  taxPercent: number;
  discount: number;
  total: number;
  notes?: string;
  items: InvoiceItemResponse[];
  createdAt: string;
  updatedAt: string;
}
