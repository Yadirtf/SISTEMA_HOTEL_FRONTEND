export interface LaundryCategory {
  _id: string;
  name: string;
  pricePerUnit: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaundryCategoryFormData {
  name: string;
  pricePerUnit: number;
  isActive?: boolean;
}

export interface LaundryGarment {
  _id: string;
  name: string;
  categoryId: string | LaundryCategory;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaundryGarmentFormData {
  name: string;
  categoryId: string;
  isActive?: boolean;
}

export interface LaundryServiceItem {
  garmentId: string | LaundryGarment;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LaundryService {
  _id: string;
  serviceNumber: string;
  clientId: string | {
    _id: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
  };
  roomId: string | {
    _id: string;
    number: string;
  };
  userId: number;
  items: LaundryServiceItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  notes?: string;
  paymentMethodId?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaundryServiceFormData {
  roomId: string;
  items: Array<{
    garmentId: string;
    quantity: number;
  }>;
  notes?: string;
  paymentStatus?: 'paid' | 'pending';
  paymentMethodId?: string;
  paymentTypeId?: string;
}

export interface CompleteLaundryServiceFormData {
  paymentMethodId: string;
}

