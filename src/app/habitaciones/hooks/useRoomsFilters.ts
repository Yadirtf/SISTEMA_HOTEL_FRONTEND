import { useEffect, useMemo, useState } from "react";
import { Room } from "../types";

type UseRoomsFiltersProps = {
  rooms: Room[];
  statusFilter: string;
};

export function useRoomsFilters({ rooms, statusFilter }: UseRoomsFiltersProps) {
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtrar habitaciones según los filtros seleccionados
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const floorId = typeof room.floor === "object" && room.floor !== null 
        ? room.floor._id 
        : (room.floor || null);
      const matchesFloor = floorFilter === "all" || floorId === floorFilter;
      
      const roomTypeId = typeof room.roomType === "object" && room.roomType !== null 
        ? room.roomType._id 
        : room.roomType;
      const matchesType = typeFilter === "all" || roomTypeId === typeFilter;
      
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && room.isActive === true) ||
        (statusFilter === "inactive" && room.isActive === false);
      
      return matchesFloor && matchesType && matchesStatus;
    });
  }, [rooms, floorFilter, typeFilter, statusFilter]);

  // Determinar si hay filtros activos (excluyendo el filtro de estado por defecto)
  const hasFilters = useMemo(() => {
    return floorFilter !== "all" || typeFilter !== "all" || statusFilter !== "active";
  }, [floorFilter, typeFilter, statusFilter]);

  // Items por página según si hay filtros
  const itemsPerPage = hasFilters ? 5 : 13;

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / itemsPerPage));

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [floorFilter, typeFilter, statusFilter]);

  // Obtener las habitaciones de la página actual
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, currentPage, itemsPerPage]);

  return {
    floorFilter,
    typeFilter,
    currentPage,
    setFloorFilter,
    setTypeFilter,
    setCurrentPage,
    filteredRooms,
    paginatedRooms,
    totalPages,
    itemsPerPage,
    hasFilters,
  };
}

