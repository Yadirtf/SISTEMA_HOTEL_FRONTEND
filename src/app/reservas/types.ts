export type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive?: boolean;
  guestPricing?: Record<number, number>; // Mapa: número de huéspedes -> precio por noche
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

export type Guest = {
  _id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  origin?: string;
  profession?: string;
};

export type Reservation = {
  _id: string;
  guest: Guest | string;
  room: {
    _id: string;
    number: string;
    type?: string;
    floor?: number;
    pricePerNight: number;
  } | string;
  documentNumber: string;
  roomNumber: string;
  checkInTime: Date | string;
  checkOutTime?: Date | string;
  roomPrice: number;
  totalPrice: number;
  status: string;
  numberOfGuests: number;
  specialRequests?: string;
  notes?: string;
  paymentMethod?: string;
  isPaid?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type HistoryReservation = {
  _id: string;
  guest: Guest | string;
  roomNumber: string;
  checkInTime: Date | string;
  checkOutTime?: Date | string;
  roomPrice: number; // Precio por noche de la habitación (sin productos fiados)
  totalPrice: number; // Precio total que puede incluir productos fiados (no usar para historial)
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};


