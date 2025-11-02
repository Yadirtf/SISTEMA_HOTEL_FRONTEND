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

type Room = {
  _id: string;
  number: string;
  type: "single" | "double" | "suite" | string;
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
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  
  // Filtros
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RoomFormData>({
    number: "",
    type: "single",
    pricePerNight: 0,
    floor: 1,
    maxOccupancy: 1,
    description: "",
    status: "available",
  });

  // Mapas de traducción
  const typeToEs: Record<string, string> = {
    single: "Individual",
    double: "Doble",
    suite: "Suite",
  };
  const statusToEs: Record<string, string> = {
    available: "Disponible",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
    cleaning: "Limpieza",
  };

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
    const resp = await apiGet<Room[]>(`/rooms`, token);
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
    load();
  }, []);

  // Filtrar habitaciones según los filtros seleccionados
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFloor = floorFilter === "all" || room.floor?.toString() === floorFilter;
      const matchesType = typeFilter === "all" || room.type === typeFilter;
      return matchesFloor && matchesType;
    });
  }, [rooms, floorFilter, typeFilter]);

  // Determinar si hay filtros activos
  const hasFilters = useMemo(() => {
    return floorFilter !== "all" || typeFilter !== "all";
  }, [floorFilter, typeFilter]);

  // Items por página según si hay filtros
  const itemsPerPage = hasFilters ? 5 : 13;

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / itemsPerPage));

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [floorFilter, typeFilter]);

  // Obtener las habitaciones de la página actual
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, currentPage, itemsPerPage]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      number: "",
      type: "single",
      pricePerNight: 0,
      floor: 1,
      maxOccupancy: 1,
      description: "",
      status: "available",
    });
  };

  const handleFormChange = (field: keyof RoomFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingId(room._id);
    setFormData({
      number: room.number || "",
      type: (room.type as "single" | "double" | "suite") || "single",
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
    const body: any = {
      number: formData.number,
      type: formData.type,
      pricePerNight: formData.pricePerNight,
      floor: formData.floor,
      maxOccupancy: formData.maxOccupancy,
      description: formData.description,
      status: formData.status,
      isActive: true,
    };

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

  const deactivate = async (id: string, roomNumber?: string) => {
    if (
      !confirm(
        "¿Está seguro de que desea desactivar esta habitación? (La habitación se ocultará pero no se eliminará)"
      )
    )
      return;

    try {
      const resp = roomNumber
        ? await apiDelete<Room>(`/rooms/number/${roomNumber}`, token)
        : await apiDelete<Room>(`/rooms/${id}`, token);

      if (resp.success) {
        showNotification("success", "Habitación desactivada");
        await load();
      } else {
        showNotification("error", "Error", resp.message || "Error al desactivar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
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
          p={5}
          bg={colors.surface}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        >
          <RoomFilters
            floorFilter={floorFilter}
            typeFilter={typeFilter}
            onFloorChange={setFloorFilter}
            onTypeChange={setTypeFilter}
          />

          <Flex gap={3} align="end">
            <Button
              size="sm"
              onClick={load}
              disabled={loading}
              variant="outline"
              borderColor={colors.border}
              color={colors.subtext}
              bg="transparent"
              _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
              transition="all 0.2s"
            >
              {loading ? "Cargando..." : "Refrescar"}
            </Button>
            <Button
              onClick={openCreateModal}
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              size="md"
              _hover={{ 
                bg: "#b8941f",
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${colors.gold}40`
              }}
              transition="all 0.2s"
              boxShadow={`0 2px 8px ${colors.gold}50`}
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
          p={5}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        >
          <Heading 
            size="md" 
            color={colors.gold} 
            mb={4}
            borderBottom="2px solid"
            borderBottomColor={colors.border}
            pb={3}
          >
            Listado de Habitaciones
            {hasFilters && (
              <Text as="span" color={colors.subtext} fontSize="sm" fontWeight="normal" ml={2}>
                ({filteredRooms.length} de {rooms.length})
              </Text>
            )}
          </Heading>

          <Box overflowX="auto">
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
                            {typeToEs[r.type] || r.type}
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
                                onClick={() => deactivate(r._id, r.number)}
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
                                Desactivar
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
            top="20px"
            right="20px"
            zIndex={1000}
            maxW="400px"
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
        />
      </Stack>
    </DashboardShell>
  );
}
