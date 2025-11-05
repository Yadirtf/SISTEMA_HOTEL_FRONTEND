export type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive: boolean;
  guestPricing?: Record<number, number>;
};

export type Floor = {
  _id: string;
  numero: number;
  descripcion?: string;
  isActive: boolean;
};

export type Room = {
  _id: string;
  number: string;
  roomType: string | RoomType; // Puede ser ObjectId string o el objeto poblado
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "cleaning" | string;
  floor?: string | Floor; // Puede ser ObjectId string o el objeto poblado
  maxOccupancy?: number;
  description?: string;
  isActive: boolean;
};

export type RoomFormData = {
  number: string;
  roomType: string;
  pricePerNight: number;
  floor: string;
  maxOccupancy: number;
  description: string;
  status: "available" | "occupied" | "maintenance" | "cleaning";
};

