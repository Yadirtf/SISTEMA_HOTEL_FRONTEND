export interface Category {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id?: string;
  barcode: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  isActive: boolean;
  category?: string | Category;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  productName?: string;
  barcode?: string;
  unitPrice?: number;
  unitPurchasePrice?: number;
  subtotal?: number;
  profit?: number;
}

export interface Sale {
  _id?: string;
  items: Array<{
    product: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    unitPurchasePrice: number;
    subtotal: number;
    profit: number;
  }>;
  total: number;
  totalProfit: number;
  userId: number;
  saleDate: Date;
  notes?: string;
  reservationId?: string;
  paymentStatus: 'paid' | 'pending';
  amountReceived?: number;
  change?: number;
  paymentMethodId?: string;
  paymentTypeId?: string;
  cashChange?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalesReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  itemsSold: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    totalSales: number;
    totalProfit: number;
  }>;
  sales: Sale[];
}

export interface ProductFormData {
  barcode: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock?: number;
  category?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface SaleFormData {
  items: SaleItem[];
  notes?: string;
  reservationId?: string;
  paymentStatus?: 'paid' | 'pending';
  amountReceived?: number;
  paymentMethodId?: string;
  paymentTypeId?: string;
  cashChange?: number; // Cambio en efectivo a dar cuando el método de pago NO es efectivo
}

export type ReportPeriod = 'weekly' | 'biweekly' | 'monthly' | 'custom';

export interface ReturnItem {
  productId: string;
  quantity: number;
}

export interface Return {
  _id?: string;
  saleId: string;
  items: Array<{
    product: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  userId: number;
  returnDate: Date;
  reason?: string;
  notes?: string;
  refundMethodId?: string;
  stockRestored: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReturnFormData {
  saleId: string;
  items: ReturnItem[];
  reason?: string;
  notes?: string;
  refundMethodId?: string;
}

