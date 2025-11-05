"use client";

import { useEffect, useMemo, useState } from "react";
import { getRooms } from "@/services/rooms";
import { getFloors } from "@/services/reservations";
import type { Room, Floor } from "@/app/reservas/types";

export function useReservationsData(token?: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFloors = async () => {
    try {
      const resp = await getFloors(token);
      if (resp.success && resp.data) {
        setFloors(resp.data as any);
      }
    } catch {
      // noop
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const resp = await getRooms(token);
      if (resp.success && resp.data) {
        const activeRooms = resp.data.filter(r => r.isActive === true);
        setRooms(activeRooms);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, Room[]> = {};
    rooms.forEach(room => {
      const num = typeof room.floor === "object" && room.floor && (room.floor as Floor).numero
        ? (room.floor as Floor).numero
        : 0;
      if (num > 0) {
        if (!grouped[num]) grouped[num] = [];
        grouped[num].push(room);
      }
    });
    Object.keys(grouped).forEach(k => {
      grouped[Number(k)].sort((a, b) => Number(a.number) - Number(b.number));
    });
    return grouped;
  }, [rooms]);

  const sortedFloors = useMemo(() => Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b), [roomsByFloor]);

  return { rooms, floors, loading, loadRooms, loadFloors, roomsByFloor, sortedFloors };
}


