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
  paymentStatus?: 'paid' | 'pending';
  paymentMethodId?: string;
  paymentTypeId?: string;
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

// Tipos para la Vista Relacional (Neo4j)
export enum NodeType {
  CLIENT = 'Client',
  ROOM = 'Room',
  LAUNDRY_SERVICE = 'LaundryService',
}

export enum RelationshipType {
  HAS_SERVICE = 'HAS_SERVICE',
  FOR_ROOM = 'FOR_ROOM',
}

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface CreateGraphNodeFormData {
  type: NodeType;
  id: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  number?: string;
  serviceNumber?: string;
  status?: string;
  totalAmount?: number;
  userId?: number;
}

export interface CreateRelationshipFormData {
  type: RelationshipType;
  fromNodeId: string;
  fromNodeType: NodeType;
  toNodeId: string;
  toNodeType: NodeType;
}

