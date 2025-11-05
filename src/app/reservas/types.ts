export type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive?: boolean;
};

export type Floor = {
  _id: string;
  numero: number;
  descripcion?: string;
  isActive?: boolean;
};

export type Room = {
  _id: string;
  number: string;
  roomType: string | RoomType;
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "cleaning" | string;
  floor?: string | Floor;
  maxOccupancy?: number;
  description?: string;
  isActive: boolean;
};


