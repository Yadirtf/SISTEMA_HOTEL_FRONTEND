import { useEffect, useState } from "react";
import { getRooms } from "@/services/rooms";
import { getRoomTypes } from "@/services/room-types";
import { getFloors } from "@/services/floors";
import { Room, RoomType, Floor } from "../types";

export function useRoomsData(token: string | undefined, statusFilter: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRoomTypes = async () => {
    try {
      const resp = await getRoomTypes(false, token);
      if (resp.success && resp.data) {
        setRoomTypes(resp.data);
      }
    } catch (error: any) {
        console.error("Error al cargar tipos de habitación:", error);
    }
  };

  const loadFloors = async () => {
    try {
      const resp = await getFloors(token);
      if (resp.success && resp.data) {
        setFloors(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar pisos:", error);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const includeInactive = statusFilter === "all" || statusFilter === "inactive";
      const resp = await getRooms(includeInactive, token);
      if (resp.success && resp.data) {
        setRooms(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar habitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
    loadFloors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getRoomTypeName = (room: Room): string => {
    if (typeof room.roomType === "object" && room.roomType !== null && "tipo" in room.roomType) {
      return room.roomType.tipo;
    }
    const type = roomTypes.find(t => t._id === room.roomType);
    return type?.tipo || String(room.roomType);
  };

  const getFloorNumber = (room: Room): number => {
    if (room.floor === null || room.floor === undefined) {
      return 0;
    }
    if (typeof room.floor === "object" && room.floor !== null && "numero" in room.floor) {
      return room.floor.numero;
    }
    if (typeof room.floor === "string") {
      const floor = floors.find(f => f._id === room.floor);
      return floor?.numero || 0;
    }
    return 0;
  };

  return {
    rooms,
    roomTypes,
    floors,
    loading,
    loadRooms,
    loadRoomTypes,
    loadFloors,
    getRoomTypeName,
    getFloorNumber,
  };
}

