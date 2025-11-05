"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getRooms } from "@/services/rooms";
import { getFloors } from "@/services/reservations";
import { getToken } from "@/lib/session";
import type { Room, Floor } from "@/app/reservas/types";

export function useReservationsData(token?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);

  // Funciones que siempre obtienen el token más reciente
  const loadFloors = useCallback(async () => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) return;
    try {
      const resp = await getFloors(currentToken);
      if (resp.success && resp.data) {
        setFloors(resp.data as any);
      }
    } catch {
      // noop
    }
  }, [token]);

  const loadRooms = useCallback(async () => {
    const currentToken = token || getToken() || undefined;
    if (!currentToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await getRooms(undefined, currentToken);
      if (resp.success && resp.data) {
        const activeRooms = resp.data.filter(r => r.isActive === true);
        setRooms(activeRooms);
      }
    } catch (error) {
      console.error('[useReservationsData] Error al cargar habitaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFloors();
    loadRooms();
  }, [loadFloors, loadRooms]);

  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, Room[]> = {};
    rooms.forEach(room => {
      let num = 0;
      if (typeof room.floor === "object" && room.floor !== null && (room.floor as Floor).numero) {
        num = (room.floor as Floor).numero;
      } else if (typeof room.floor === "string" && room.floor) {
        // Si floor es un string (ObjectId), buscar en el array de floors
        const floorObj = floors.find(f => f._id === room.floor);
        num = floorObj?.numero || 0;
      }
      
      if (num > 0) {
        if (!grouped[num]) grouped[num] = [];
        grouped[num].push(room);
      }
    });
    Object.keys(grouped).forEach(k => {
      grouped[Number(k)].sort((a, b) => Number(a.number) - Number(b.number));
    });
    return grouped;
  }, [rooms, floors]);

  const sortedFloors = useMemo(() => Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b), [roomsByFloor]);

  return { rooms, floors, loading, loadRooms, loadFloors, roomsByFloor, sortedFloors };
}


