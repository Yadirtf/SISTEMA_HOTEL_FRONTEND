"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken, getSessionUser } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { ReservationModal, ReservationFormData } from "@/components/reservas/ReservationModal";
import { RoomDetailsModal } from "@/components/reservas/RoomDetailsModal";
import { ReservationDetailsModal } from "@/components/reservas/ReservationDetailsModal";

type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive?: boolean;
};

type Floor = {
  _id: string;
  numero: number;
  descripcion?: string;
  isActive?: boolean;
};

type Room = {
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

export default function ReservasPage() {
  const token = getToken() || undefined;
  const { colors, mode } = useThemeMode();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isRoomDetailsModalOpen, setIsRoomDetailsModalOpen] = useState(false);
  const [isReservationDetailsModalOpen, setIsReservationDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  // Función helper para obtener el nombre del tipo de habitación
  const getRoomTypeName = (room: Room): string => {
    if (typeof room.roomType === "object" && room.roomType !== null) {
      return room.roomType.tipo;
    }
    return "Tipo desconocido";
  };

  // Función helper para obtener el número del piso
  const getFloorNumber = (room: Room): number => {
    if (room.floor === null || room.floor === undefined) {
      return 0;
    }
    if (typeof room.floor === "object" && room.floor !== null && room.floor.numero) {
      return room.floor.numero;
    }
    if (typeof room.floor === "string") {
      const floor = floors.find(f => f._id === room.floor);
      return floor?.numero || 0;
    }
    return 0;
  };

  // Mapa de traducción de estados
  const statusToEs: Record<string, string> = {
    available: "Disponible",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
    cleaning: "Limpieza",
  };

  // Mapa de colores para estados
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "available":
        return "#22c55e"; // Verde
      case "occupied":
        return "#ef4444"; // Rojo
      case "maintenance":
        return "#f59e0b"; // Amarillo
      case "cleaning":
        return "#3b82f6"; // Azul
      default:
        return colors.subtext;
    }
  };

  const loadFloors = async () => {
    try {
      const resp = await apiGet<Floor[]>("/floors", token);
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
      const resp = await apiGet<Room[]>("/rooms", token);
      if (resp.success && resp.data) {
        // Filtrar solo habitaciones activas
        const activeRooms = resp.data.filter(room => room.isActive === true);
        setRooms(activeRooms);
      }
    } catch (error: any) {
      console.error("Error al cargar habitaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const handleOpenReservationModal = (room: Room) => {
    // Solo permitir abrir el modal si la habitación está disponible
    if (room.status !== "available") {
      showNotification("error", "Error", "Esta habitación no está disponible para ocupar");
      return;
    }
    setSelectedRoom(room);
    setIsReservationModalOpen(true);
  };

  const handleOpenRoomDetailsModal = (room: Room) => {
    setSelectedRoom(room);
    setIsRoomDetailsModalOpen(true);
  };

  const handleOpenReservationDetailsModal = async (room: Room) => {
    setSelectedRoom(room);
    setIsLoadingReservation(true);
    setIsReservationDetailsModalOpen(true);
    
    try {
      const resp = await apiGet(`/reservations/room/${room.number}`, token);
      if (resp.success && resp.data) {
        setSelectedReservation(resp.data);
      } else {
        showNotification("info", "Sin reserva activa", "Esta habitación no tiene una reserva activa actualmente");
        setSelectedReservation(null);
      }
    } catch (error: any) {
      console.error("Error al cargar reserva:", error);
      showNotification("error", "Error", "No se pudo cargar la información de la reserva");
      setSelectedReservation(null);
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const handleCloseModals = () => {
    setIsReservationModalOpen(false);
    setIsRoomDetailsModalOpen(false);
    setIsReservationDetailsModalOpen(false);
    setSelectedRoom(null);
    setSelectedReservation(null);
  };

  const handleSubmitReservation = async (formData: ReservationFormData) => {
    if (!selectedRoom) return;

    setIsSubmitting(true);
    try {
      const user = getSessionUser();
      if (!user) {
        showNotification("error", "Error", "No se encontró la sesión del usuario");
        return;
      }

      // Preparar los datos según el DTO del backend
      const reservationData = {
        documentNumber: formData.documentNumber.trim().toUpperCase(),
        guestFirstName: formData.guestFirstName.trim(),
        guestLastName: formData.guestLastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        roomNumber: selectedRoom.number,
        checkInTime: formData.checkInTime ? new Date(formData.checkInTime).toISOString() : new Date().toISOString(),
        checkOutTime: formData.checkOutTime ? new Date(formData.checkOutTime).toISOString() : undefined,
        snackConsumption: formData.snackConsumption ? parseFloat(formData.snackConsumption) : 0,
        numberOfGuests: formData.numberOfGuests ? parseInt(formData.numberOfGuests) : 1,
        specialRequests: formData.specialRequests.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        paymentMethod: formData.paymentMethod || "pending",
        email: formData.email.trim() || undefined,
        origin: formData.origin.trim() || undefined,
        profession: formData.profession.trim() || undefined,
      };

      const resp = await apiPost("/reservations", reservationData, token);

      if (resp.success) {
        showNotification("success", "Reserva creada", "La habitación ha sido ocupada exitosamente");
        handleCloseModals();
        // Recargar habitaciones para actualizar el estado (ahora debería estar "occupied")
        await loadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al crear la reserva");
      }
    } catch (error: any) {
      console.error("Error al crear reserva:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al crear la reserva";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRoomStatus = async (room: Room, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const user = getSessionUser();
      if (!user) {
        showNotification("error", "Error", "No se encontró la sesión del usuario");
        return;
      }

      const resp = await apiPut(
        `/rooms/${room.number}/status`,
        { status: newStatus },
        token
      );

      if (resp.success) {
        const statusMessages: Record<string, string> = {
          occupied: "Habitación ocupada",
          cleaning: "Habitación liberada, ahora está en limpieza",
          available: "Limpieza finalizada, habitación disponible",
        };
        showNotification("success", "Estado actualizado", statusMessages[newStatus] || "Estado actualizado correctamente");
        // Recargar habitaciones para actualizar el estado
        await loadRooms();
      } else {
        showNotification("error", "Error", resp.message || "Error al actualizar el estado de la habitación");
      }
    } catch (error: any) {
      console.error("Error al actualizar estado:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al actualizar el estado";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para obtener el texto y acción del botón según el estado
  const getButtonConfig = (room: Room) => {
    switch (room.status) {
      case "available":
        return {
          text: "Ocupar",
          action: () => handleOpenReservationModal(room),
          enabled: true,
          color: colors.gold,
        };
      case "occupied":
        return {
          text: "Liberar",
          action: () => handleChangeRoomStatus(room, "cleaning"),
          enabled: true,
          color: "#f59e0b", // Amarillo
        };
      case "cleaning":
        return {
          text: "F. limpieza",
          action: () => handleChangeRoomStatus(room, "available"),
          enabled: true,
          color: "#22c55e", // Verde
        };
      default:
        return {
          text: "Ocupar",
          action: () => {},
          enabled: false,
          color: colors.subtext,
        };
    }
  };

  useEffect(() => {
    loadFloors();
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Agrupar habitaciones por piso
  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, Room[]> = {};
    
    rooms.forEach(room => {
      const floorNum = getFloorNumber(room);
      if (floorNum > 0) {
        if (!grouped[floorNum]) {
          grouped[floorNum] = [];
        }
        grouped[floorNum].push(room);
      }
    });

    // Ordenar habitaciones dentro de cada piso por número
    Object.keys(grouped).forEach(floorNum => {
      grouped[Number(floorNum)].sort((a, b) => 
        Number(a.number) - Number(b.number)
      );
    });

    return grouped;
  }, [rooms, floors]);

  // Obtener pisos ordenados
  const sortedFloors = useMemo(() => {
    return Object.keys(roomsByFloor)
      .map(Number)
      .sort((a, b) => a - b);
  }, [roomsByFloor]);

  if (loading) {
    return (
      <DashboardShell title="Reservas">
        <Flex justify="center" align="center" minH="400px">
          <Text color={colors.text}>Cargando habitaciones...</Text>
        </Flex>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Reservas">
      <Stack gap={6}>
        {/* Encabezado */}
        <Box
          bg={colors.surface}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        >
          <Heading 
            size={{ base: "md", md: "lg" }}
            color={colors.gold}
            mb={2}
            fontSize={{ base: "xl", md: "2xl" }}
          >
            Habitaciones del Hotel
          </Heading>
          <Text color={colors.subtext} fontSize={{ base: "sm", md: "md" }}>
            Selecciona una habitación para realizar una reserva
          </Text>
        </Box>

        {/* Habitaciones agrupadas por piso */}
        {sortedFloors.length === 0 ? (
          <Box
            bg={colors.surface}
            p={8}
            borderRadius="lg"
            borderWidth="2px"
            borderColor={colors.border}
            textAlign="center"
          >
            <Text color={colors.subtext} fontSize="lg">
              No hay habitaciones disponibles
            </Text>
          </Box>
        ) : (
          <Stack gap={8}>
            {sortedFloors.map((floorNum) => (
              <Box key={floorNum}>
                {/* Encabezado del piso */}
                <Flex
                  align="center"
                  gap={3}
                  mb={4}
                  pb={3}
                  borderBottom="2px solid"
                  borderColor={colors.border}
                >
                  <Box
                    bg={colors.gold}
                    color={colors.bg}
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    boxShadow={`0 2px 8px ${colors.gold}50`}
                  >
                    Piso {floorNum}
                  </Box>
                  <Text color={colors.subtext} fontSize={{ base: "sm", md: "md" }}>
                    {roomsByFloor[floorNum].length} habitación{roomsByFloor[floorNum].length !== 1 ? "es" : ""}
                  </Text>
                </Flex>

                {/* Tarjetas de habitaciones del piso */}
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)"
                  }}
                  gap={4}
                >
                  {roomsByFloor[floorNum].map((room) => {
                    const statusColor = getStatusColor(room.status);
                    const floorNumber = getFloorNumber(room);
                    const roomTypeName = getRoomTypeName(room);

                    return (
                      <Box
                        key={room._id}
                        bg={colors.surface}
                        p={{ base: 4, md: 5 }}
                        borderRadius="lg"
                        borderWidth="2px"
                        borderColor={colors.border}
                        boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
                        transition="all 0.3s"
                        _hover={{
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${colors.gold}40, 0 0 0 2px ${colors.gold}`,
                          borderColor: colors.gold,
                        }}
                        cursor="pointer"
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Borde superior decorativo */}
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          height="4px"
                          bg={statusColor}
                        />

                        {/* Badge de estado */}
                        <Flex justify="space-between" align="start" mb={3}>
                          <Box
                            bg={statusColor}
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="0.5px"
                          >
                            {statusToEs[room.status] || room.status}
                          </Box>
                          <Flex align="center" gap={2}>
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              color={colors.subtext}
                              fontWeight="medium"
                            >
                              #{room.number}
                            </Text>
                            <Button
                              variant="ghost"
                              size="xs"
                              p={1}
                              minW="auto"
                              h="auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRoomDetailsModal(room);
                              }}
                              color={colors.subtext}
                              _hover={{ 
                                color: colors.gold,
                                bg: colors.bg,
                                transform: "scale(1.1)"
                              }}
                              transition="all 0.2s"
                              title="Ver detalles de la habitación"
                            >
                              👁️
                            </Button>
                          </Flex>
                        </Flex>

                        {/* Información principal */}
                        <Stack gap={3}>
                          {/* Tipo de habitación */}
                          <Box>
                            <Text
                              fontSize="xs"
                              color={colors.subtext}
                              mb={1}
                              textTransform="uppercase"
                              letterSpacing="0.5px"
                              fontWeight="semibold"
                            >
                              Tipo
                            </Text>
                            <Text
                              fontSize={{ base: "md", md: "lg" }}
                              color={colors.gold}
                              fontWeight="bold"
                            >
                              {roomTypeName}
                            </Text>
                          </Box>

                          {/* Precio */}
                          <Box>
                            <Text
                              fontSize="xs"
                              color={colors.subtext}
                              mb={1}
                              textTransform="uppercase"
                              letterSpacing="0.5px"
                              fontWeight="semibold"
                            >
                              Precio/Noche
                            </Text>
                            <Text
                              fontSize={{ base: "lg", md: "xl" }}
                              color={colors.text}
                              fontWeight="bold"
                            >
                              ${room.pricePerNight.toFixed(2)}
                            </Text>
                          </Box>

                          {/* Capacidad */}
                          {room.maxOccupancy && (
                            <Box>
                              <Text
                                fontSize="xs"
                                color={colors.subtext}
                                mb={1}
                                textTransform="uppercase"
                                letterSpacing="0.5px"
                                fontWeight="semibold"
                              >
                                Capacidad
                              </Text>
                              <Flex align="center" gap={2}>
                                <Text
                                  fontSize={{ base: "md", md: "lg" }}
                                  color={colors.text}
                                  fontWeight="semibold"
                                >
                                  {room.maxOccupancy}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={colors.subtext}
                                >
                                  persona{room.maxOccupancy > 1 ? "s" : ""}
                                </Text>
                              </Flex>
                            </Box>
                          )}
                        </Stack>

                        {/* Botones de acción */}
                        <Box
                          mt={4}
                          pt={3}
                          borderTop="1px solid"
                          borderColor={colors.border}
                        >
                          <Flex gap={2} justify="space-between">
                            {/* Solo mostrar el botón de detalles de reserva si hay una reserva activa */}
                            {room.status !== "available" && (
                              <Button
                                size="sm"
                                variant="outline"
                                borderColor={colors.border}
                                color={colors.text}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReservationDetailsModal(room);
                                }}
                                _hover={{ 
                                  bg: colors.bg, 
                                  borderColor: colors.gold, 
                                  color: colors.gold 
                                }}
                                transition="all 0.2s"
                                flex="1"
                                disabled={isLoadingReservation}
                              >
                                Detalles
                              </Button>
                            )}
                            {(() => {
                              const buttonConfig = getButtonConfig(room);
                              return (
                                <Button
                                  size="sm"
                                  bg={buttonConfig.color}
                                  color={colors.bg}
                                  fontWeight="bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    buttonConfig.action();
                                  }}
                                  _hover={{ 
                                    bg: buttonConfig.color === colors.gold ? "#b8941f" : buttonConfig.color === "#f59e0b" ? "#d97706" : "#16a34a", 
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 4px 12px ${buttonConfig.color}40`
                                  }}
                                  disabled={!buttonConfig.enabled || isSubmitting}
                                  transition="all 0.2s"
                                  flex={room.status === "available" ? "1" : "1"}
                                  boxShadow={`0 2px 8px ${buttonConfig.color}50`}
                                  opacity={buttonConfig.enabled ? 1 : 0.5}
                                  cursor={buttonConfig.enabled ? "pointer" : "not-allowed"}
                                >
                                  {buttonConfig.text}
                                </Button>
                              );
                            })()}
                          </Flex>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Stack>
        )}

        {/* Modales */}
        {selectedRoom && (
          <>
            <ReservationModal
              isOpen={isReservationModalOpen}
              onClose={handleCloseModals}
              onSubmit={handleSubmitReservation}
              roomNumber={selectedRoom.number}
              roomPrice={selectedRoom.pricePerNight}
              isLoading={isSubmitting}
            />
            <RoomDetailsModal
              isOpen={isRoomDetailsModalOpen}
              onClose={handleCloseModals}
              room={selectedRoom}
              getRoomTypeName={getRoomTypeName}
              getFloorNumber={getFloorNumber}
            />
            <ReservationDetailsModal
              isOpen={isReservationDetailsModalOpen}
              onClose={handleCloseModals}
              reservation={selectedReservation}
              isLoading={isLoadingReservation}
            />
          </>
        )}

        {/* Notificaciones */}
        {notification && (
          <Box
            position="fixed"
            top={{ base: "10px", md: "20px" }}
            right={{ base: "10px", md: "20px" }}
            left={{ base: "10px", md: "auto" }}
            zIndex={2000}
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
      </Stack>
    </DashboardShell>
  );
}
