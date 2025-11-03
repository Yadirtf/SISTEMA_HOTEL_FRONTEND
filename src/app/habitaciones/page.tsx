"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/session";
import { RoomFilters } from "@/components/habitaciones/RoomFilters";
import { RoomModal, RoomFormData } from "@/components/habitaciones/RoomModal";
import { PaginationControls } from "@/components/habitaciones/PaginationControls";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive: boolean;
};

type Room = {
  _id: string;
  number: string;
  roomType: string | RoomType; // Puede ser ObjectId string o el objeto poblado
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "cleaning" | string;
  floor?: number;
  maxOccupancy?: number;
  description?: string;
  isActive: boolean;
};

export default function HabitacionesPage() {
  const token = getToken() || undefined;
  const { colors, mode } = useThemeMode();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  
  // Filtros
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RoomFormData>({
    number: "",
    roomType: "",
    pricePerNight: 0,
    floor: 1,
    maxOccupancy: 1,
    description: "",
    status: "available",
  });

  // Mapa de traducción de estados
  const statusToEs: Record<string, string> = {
    available: "Disponible",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
    cleaning: "Limpieza",
  };

  // Función helper para obtener el nombre del tipo de habitación
  const getRoomTypeName = (room: Room): string => {
    if (typeof room.roomType === "object" && room.roomType.tipo) {
      return room.roomType.tipo;
    }
    // Si es solo el ID, buscar en roomTypes
    const type = roomTypes.find(t => t._id === room.roomType);
    return type?.tipo || String(room.roomType);
  };

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const loadRoomTypes = async () => {
    try {
      const resp = await apiGet<RoomType[]>("/rooms/types", token);
      console.log("Respuesta de tipos de habitación:", resp); // Debug
      if (resp.success && resp.data) {
        console.log("Tipos cargados:", resp.data); // Debug
        setRoomTypes(resp.data);
      } else {
        console.error("Error al cargar tipos - respuesta no exitosa:", resp.message);
        showNotification("error", "Error", resp.message || "Error al cargar tipos de habitación");
      }
    } catch (error: any) {
      console.error("Error al cargar tipos de habitación:", error);
      showNotification("error", "Error", error?.message || "Error al cargar tipos de habitación");
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      // Si el filtro incluye inactivas (all o inactive), solicitar todas las habitaciones
      const includeInactive = statusFilter === "all" || statusFilter === "inactive";
      const url = includeInactive ? `/rooms?includeInactive=true` : `/rooms`;
      const resp = await apiGet<Room[]>(url, token);
      if (resp.success && resp.data) {
        setRooms(resp.data);
        showNotification("success", "Habitaciones cargadas");
      } else {
        showNotification("error", "Error", resp.message || "Error al cargar habitaciones");
      }
    } catch (error: any) {
      showNotification("error", "Error", error?.message || "Error al cargar habitaciones");
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar habitaciones cuando cambie el filtro de estado
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Filtrar habitaciones según los filtros seleccionados
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFloor = floorFilter === "all" || room.floor?.toString() === floorFilter;
      const roomTypeId = typeof room.roomType === "object" ? room.roomType._id : room.roomType;
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

  const resetForm = () => {
    setEditingId(null);
    const defaultRoomType = roomTypes.find((type) => type.isActive)?._id || "";
    setFormData({
      number: "",
      roomType: defaultRoomType,
      pricePerNight: 0,
      floor: 1,
      maxOccupancy: 1,
      description: "",
      status: "available",
    });
  };

  // Actualizar el formulario cuando se carguen los tipos
  useEffect(() => {
    if (roomTypes.length > 0) {
      const defaultRoomType = roomTypes.find((type) => type.isActive)?._id || "";
      setFormData((prev) => {
        // Solo actualizar si no hay un valor ya seleccionado o si el valor actual no existe
        if (!prev.roomType || !roomTypes.find(t => t._id === prev.roomType && t.isActive)) {
          return { ...prev, roomType: defaultRoomType };
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTypes]);

  const handleFormChange = (field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = async () => {
    // Asegurar que los tipos estén cargados antes de abrir el modal
    if (roomTypes.length === 0) {
      await loadRoomTypes();
    }
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = async (room: Room) => {
    // Asegurar que los tipos estén cargados antes de abrir el modal
    if (roomTypes.length === 0) {
      await loadRoomTypes();
    }
    setEditingId(room._id);
    const roomTypeId = typeof room.roomType === "object" ? room.roomType._id : room.roomType;
    setFormData({
      number: room.number || "",
      roomType: roomTypeId || "",
      pricePerNight: room.pricePerNight || 0,
      floor: room.floor || 1,
      maxOccupancy: room.maxOccupancy || 1,
      description: room.description || "",
      status: (room.status as "available" | "occupied" | "maintenance" | "cleaning") || "available",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const submit = async () => {
    setIsSubmitting(true);
    
    // Validar que se haya seleccionado un tipo
    if (!formData.roomType || formData.roomType === "") {
      showNotification("error", "Error", "Por favor seleccione un tipo de habitación");
      setIsSubmitting(false);
      return;
    }

    console.log("Datos a enviar:", { ...formData, roomType: formData.roomType }); // Debug
    
    const body: any = {
      number: formData.number,
      roomType: formData.roomType,
      pricePerNight: formData.pricePerNight,
      floor: formData.floor,
      maxOccupancy: formData.maxOccupancy,
      description: formData.description,
      status: formData.status,
      isActive: true,
    };

    console.log("Body completo:", body); // Debug

    try {
      const resp = editingId
        ? await apiPut<Room, typeof body>(`/rooms/number/${formData.number}`, body, token)
        : await apiPost<Room, typeof body>(`/rooms`, body, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Habitación actualizada" : "Habitación registrada",
          resp.message || "Operación exitosa"
        );
        closeModal();
        await load();
      } else {
        showNotification("error", "Error", resp.message || "Error al guardar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (room: Room) => {
    const isCurrentlyActive = room.isActive === true;
    const action = isCurrentlyActive ? "desactivar" : "activar";
    const actionPast = isCurrentlyActive ? "desactivada" : "activada";
    
    if (
      !confirm(
        `¿Está seguro de que desea ${action} esta habitación?`
      )
    )
      return;

    try {
      // Si está activa, usar DELETE para desactivar (comportamiento original)
      if (isCurrentlyActive) {
        const resp = room.number
          ? await apiDelete<Room>(`/rooms/number/${room.number}`, token)
          : await apiDelete<Room>(`/rooms/${room._id}`, token);

        if (resp.success) {
          showNotification("success", `Habitación ${actionPast}`);
          await load();
        } else {
          showNotification("error", "Error", resp.message || `Error al ${action}`);
        }
      } else {
        // Si está desactivada, usar PUT para activar
        const body = { isActive: true };
        const resp = room.number
          ? await apiPut<Room, typeof body>(`/rooms/number/${room.number}`, body, token)
          : await apiPut<Room, typeof body>(`/rooms/${room._id}`, body, token);

        if (resp.success) {
          showNotification("success", `Habitación ${actionPast}`);
          await load();
        } else {
          showNotification("error", "Error", resp.message || `Error al ${action}`);
        }
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || `Error desconocido al ${action}`);
    }
  };

  const deletePermanent = async (id: string, roomNumber?: string) => {
    if (
      !confirm(
        "⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE esta habitación? Esta acción NO se puede deshacer."
      )
    )
      return;

    try {
      const resp = roomNumber
        ? await apiDelete<any>(`/rooms/number/${roomNumber}/permanent`, token)
        : await apiDelete<any>(`/rooms/${id}/permanent`, token);

      if (resp.success) {
        showNotification("success", "Habitación eliminada");
        await load();
      } else {
        showNotification("error", "Error", resp.message || "Error al eliminar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  };


  return (
    <DashboardShell title="Habitaciones">
      <Stack gap={6}>
        {/* Barra superior con filtros y botón */}
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "end" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          p={{ base: 3, md: 5 }}
          bg={colors.surface}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        >
          <RoomFilters
            floorFilter={floorFilter}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            onFloorChange={setFloorFilter}
            onTypeChange={setTypeFilter}
            onStatusChange={setStatusFilter}
            roomTypes={roomTypes}
          />

          <Flex 
            gap={3} 
            align="end" 
            direction={{ base: "column", md: "row" }}
            w={{ base: "100%", md: "auto" }}
          >
            <Button
              size={{ base: "md", md: "sm" }}
              onClick={load}
              disabled={loading}
              variant="outline"
              borderColor={colors.border}
              color={colors.subtext}
              bg="transparent"
              _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
              transition="all 0.2s"
              w={{ base: "100%", md: "auto" }}
            >
              {loading ? "Cargando..." : "Refrescar"}
            </Button>
            <Button
              onClick={openCreateModal}
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              size={{ base: "md", md: "md" }}
              _hover={{ 
                bg: "#b8941f",
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${colors.gold}40`
              }}
              transition="all 0.2s"
              boxShadow={`0 2px 8px ${colors.gold}50`}
              w={{ base: "100%", md: "auto" }}
            >
              Registrar Habitación
            </Button>
          </Flex>
        </Flex>

        {/* Tabla de habitaciones */}
        <Box
          bg={colors.surface}
          borderColor={colors.border}
          borderWidth="2px"
          borderRadius="lg"
          p={{ base: 3, md: 5 }}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        >
          <Heading 
            size={{ base: "sm", md: "md" }}
            color={colors.gold} 
            mb={4}
            borderBottom="2px solid"
            borderBottomColor={colors.border}
            pb={3}
            fontSize={{ base: "lg", md: "xl" }}
          >
            Listado de Habitaciones
            {hasFilters && (
              <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
                ({filteredRooms.length} de {rooms.length})
              </Text>
            )}
          </Heading>

          {/* Vista de tabla para desktop */}
          <Box 
            overflowX="auto" 
            display={{ base: "none", lg: "block" }}
          >
            <Box
              as="table"
              w="100%"
              style={{ borderCollapse: "collapse" }}
            >
              <Box as="thead">
                <Box as="tr" borderBottom="2px" borderColor={colors.border}>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Número
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Tipo
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Precio/Noche
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Estado
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Piso
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Capacidad
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={3}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Acciones
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {paginatedRooms.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={7}
                        style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "#A0AEC0",
                      }}
                    >
                      {rooms.length === 0
                        ? "No hay habitaciones registradas"
                        : "No hay habitaciones que coincidan con los filtros"}
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((r) => {
                    const RowWithHover = () => {
                      const [isHovered, setIsHovered] = useState(false);
                      const hoverBg = mode === "light" ? colors.gold : "#1a1a1a";
                      const textColor = isHovered && mode === "light" ? "white" : colors.text;
                      const subtextColor = isHovered && mode === "light" ? "white" : colors.subtext;
                      const priceColor = isHovered && mode === "light" ? "white" : colors.gold;

                      return (
                        <Box
                          as="tr"
                          borderBottom="1px"
                          borderColor={colors.border}
                          bg={isHovered ? hoverBg : "transparent"}
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                          transition="all 0.2s"
                        >
                          <Box as="td" p={3} color={textColor} fontWeight="medium">
                            {r.number}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {getRoomTypeName(r)}
                          </Box>
                      <Box as="td" p={3} color={priceColor} fontWeight="semibold">
                        ${r.pricePerNight.toFixed(2)}
                      </Box>
                      <Box as="td" p={3} color={subtextColor}>
                        {statusToEs[r.status] || r.status}
                      </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {r.floor ?? "-"}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {r.maxOccupancy ?? "-"}
                          </Box>
                          <Box as="td" p={3}>
                            <Flex gap={2} wrap="wrap">
                              <Button
                                size="xs"
                                bg={colors.gold}
                                color={colors.bg}
                                onClick={() => openEditModal(r)}
                                _hover={{ 
                                  bg: "#b8941f",
                                  transform: "scale(1.05)"
                                }}
                                transition="all 0.2s"
                                fontWeight="semibold"
                                borderWidth={isHovered && mode === "light" ? "1px" : "0px"}
                                borderColor={isHovered && mode === "light" ? "white" : "transparent"}
                                borderStyle="solid"
                              >
                                Editar
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor={colors.border}
                                color={isHovered && mode === "light" ? "white" : colors.subtext}
                                onClick={() => toggleActive(r)}
                                _hover={{
                                  borderColor: mode === "light" ? "white" : colors.gold,
                                  color: mode === "light" ? "white" : colors.gold,
                                  bg: "transparent"
                                }}
                                transition="all 0.2s"
                                style={{
                                  borderColor: isHovered && mode === "light" ? "white" : colors.border,
                                  color: isHovered && mode === "light" ? "white" : colors.subtext,
                                }}
                              >
                                {r.isActive === true ? "Desactivar" : "Activar"}
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor="#dc2626"
                                color="#dc2626"
                                onClick={() => deletePermanent(r._id, r.number)}
                                _hover={{ 
                                  bg: "#dc2626",
                                  color: "white",
                                  transform: "scale(1.05)"
                                }}
                                transition="all 0.2s"
                              >
                                Eliminar
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      );
                    };

                    return <RowWithHover key={r._id} />;
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Vista de cards para móvil/tablet */}
          <Box display={{ base: "block", lg: "none" }}>
            {paginatedRooms.length === 0 && !loading ? (
              <Box
                textAlign="center"
                p={8}
                color={colors.subtext}
                fontSize="sm"
              >
                {rooms.length === 0
                  ? "No hay habitaciones registradas"
                  : "No hay habitaciones que coincidan con los filtros"}
              </Box>
            ) : (
              <Stack gap={4}>
                {paginatedRooms.map((r) => {
                  return (
                    <Box
                      key={r._id}
                      p={4}
                      bg={colors.bg}
                      borderWidth="1px"
                      borderColor={colors.border}
                      borderRadius="md"
                      boxShadow="sm"
                    >
                      <Flex justify="space-between" align="start" mb={3} wrap="wrap" gap={2}>
                        <Box>
                          <Text fontSize="lg" fontWeight="bold" color={colors.gold} mb={1}>
                            Habitación {r.number}
                          </Text>
                          <Text fontSize="sm" color={colors.subtext}>
                            {getRoomTypeName(r)}
                          </Text>
                        </Box>
                        <Box textAlign="right">
                          <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
                            ${r.pricePerNight.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext}>
                            por noche
                          </Text>
                        </Box>
                      </Flex>

                      <Flex gap={4} mb={4} wrap="wrap">
                        <Box>
                          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                            Estado
                          </Text>
                          <Text fontSize="sm" color={colors.text} fontWeight="medium">
                            {statusToEs[r.status] || r.status}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                            Piso
                          </Text>
                          <Text fontSize="sm" color={colors.text} fontWeight="medium">
                            {r.floor ?? "-"}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                            Capacidad
                          </Text>
                          <Text fontSize="sm" color={colors.text} fontWeight="medium">
                            {r.maxOccupancy ?? "-"} personas
                          </Text>
                        </Box>
                      </Flex>

                      <Flex gap={2} wrap="wrap">
                        <Button
                          size="sm"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => openEditModal(r)}
                          _hover={{ 
                            bg: "#b8941f",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                          flex="1"
                          minW="80px"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={colors.border}
                          color={colors.subtext}
                          onClick={() => toggleActive(r)}
                          _hover={{
                            borderColor: colors.gold,
                            color: colors.gold,
                            bg: "transparent"
                          }}
                          transition="all 0.2s"
                          flex="1"
                          minW="80px"
                        >
                          {r.isActive === true ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#dc2626"
                          color="#dc2626"
                          onClick={() => deletePermanent(r._id, r.number)}
                          _hover={{ 
                            bg: "#dc2626",
                            color: "white",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          flex="1"
                          minW="80px"
                        >
                          Eliminar
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Controles de paginación */}
          {filteredRooms.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRooms.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </Box>

          {/* Notificaciones */}
        {notification && (
          <Box
            position="fixed"
            top={{ base: "10px", md: "20px" }}
            right={{ base: "10px", md: "20px" }}
            left={{ base: "10px", md: "auto" }}
            zIndex={1000}
            maxW={{ base: "calc(100% - 20px)", md: "400px" }}
            w={{ base: "auto", md: "400px" }}
            p={4}
            borderRadius="md"
            bg={notification.type === "success" ? "#16a34a" : notification.type === "error" ? "#dc2626" : colors.gold}
            color="white"
            boxShadow={`0 4px 12px ${notification.type === "success" ? "#16a34a40" : notification.type === "error" ? "#dc262640" : `${colors.gold}40`}`}
            borderLeft="4px solid"
            borderLeftColor={notification.type === "success" ? "#22c55e" : notification.type === "error" ? "#ef4444" : "#b8941f"}
          >
            <Flex justify="space-between" align="start" gap={3}>
              <Box flex="1">
                <Text fontWeight="bold" fontSize="md" mb={notification.description ? 1 : 0}>
                  {notification.title}
                </Text>
                {notification.description && (
                  <Text fontSize="sm" opacity={0.9}>
                    {notification.description}
                  </Text>
                )}
              </Box>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setNotification(null)}
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                p={1}
                minW="auto"
                h="auto"
              >
                ×
              </Button>
            </Flex>
          </Box>
        )}

        {/* Modal de registro/edición */}
        <RoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          isEditing={!!editingId}
          formData={formData}
          onFormChange={handleFormChange}
          isLoading={isSubmitting}
          roomTypes={roomTypes}
        />
      </Stack>
    </DashboardShell>
  );
}
