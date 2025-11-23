"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack, Text, Icon } from "@chakra-ui/react";
import { FiRefreshCw, FiPlus, FiDollarSign, FiEdit, FiCheckCircle, FiXCircle, FiTrash2, FiX } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/session";
import { RoomTypeFilters } from "@/components/habitaciones/RoomTypeFilters";
import { RoomTypeModal, RoomTypeFormData } from "@/components/habitaciones/RoomTypeModal";
import { PaginationControls } from "@/components/common/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { GuestPricingModal } from "@/components/habitaciones/GuestPricingModal";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive: boolean;
  guestPricing?: Record<number, number>;
  createdAt?: Date;
  updatedAt?: Date;
};

export default function CrearTipoPage() {
  const token = getToken() || undefined;
  const { colors, mode } = useThemeMode();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación


  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedRoomTypeForPricing, setSelectedRoomTypeForPricing] = useState<RoomType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RoomTypeFormData>({
    tipo: "",
    descripcion: "",
  });

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const includeInactive = statusFilter === "inactive" || statusFilter === "all";
      const resp = await apiGet<RoomType[]>(
        `/rooms/types${includeInactive ? "?includeInactive=true" : ""}`,
        token
      );
      if (resp.success && resp.data) {
        console.log("[crear-tipo] Tipos cargados:", resp.data);
        resp.data.forEach((type, index) => {
          console.log(`[crear-tipo] Tipo ${index}: _id="${type._id}" (tipo: ${typeof type._id}), tipo="${type.tipo}"`);
        });
        setRoomTypes(resp.data);
      } else {
        showNotification("error", "Error", resp.message || "Error al cargar tipos");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const resetForm = () => {
    setFormData({
      tipo: "",
      descripcion: "",
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (type: RoomType) => {
    console.log("[crear-tipo] openEditModal - Tipo recibido:", type);
    console.log("[crear-tipo] openEditModal - type._id:", type._id, "tipo:", typeof type._id);
    setFormData({
      tipo: type.tipo,
      descripcion: type.descripcion || "",
    });
    setEditingId(type._id);
    console.log("[crear-tipo] openEditModal - editingId establecido:", type._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const submit = async () => {
    if (!formData.tipo.trim()) {
      showNotification("error", "Error", "El nombre del tipo es requerido");
      return;
    }

    setIsSubmitting(true);

    const body: any = {
      tipo: formData.tipo.trim(),
      descripcion: formData.descripcion?.trim() || undefined,
    };

    // Debug: verificar el ID de edición
    console.log("[crear-tipo] submit - editingId:", editingId, "tipo:", typeof editingId);
    console.log("[crear-tipo] submit - body:", body);
    if (editingId) {
      console.log("[crear-tipo] submit - editingId como string:", String(editingId));
    }

    try {
      if (editingId) {
        const url = `/rooms/types/${editingId}`;
        console.log("PUT URL para editar:", url);
        const resp = await apiPut<RoomType, typeof body>(url, body, token);
        console.log("PUT Response:", resp);

        if (resp.success) {
          showNotification("success", "Tipo actualizado", resp.message || "Operación exitosa");
          closeModal();
          await load();
        } else {
          showNotification("error", "Error", resp.message || "Error al guardar");
        }
      } else {
        const url = `/rooms/types`;
        console.log("POST URL para crear:", url);
        const resp = await apiPost<RoomType, typeof body>(url, body, token);
        console.log("POST Response:", resp);

        if (resp.success) {
          showNotification("success", "Tipo creado", resp.message || "Operación exitosa");
          closeModal();
          await load();
        } else {
          showNotification("error", "Error", resp.message || "Error al guardar");
        }
      }
    } catch (e: any) {
      console.error("Error en submit:", e);
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (type: RoomType) => {
    const isCurrentlyActive = type.isActive === true;
    const action = isCurrentlyActive ? "desactivar" : "activar";
    const actionPast = isCurrentlyActive ? "desactivado" : "activado";

    if (
      !confirm(
        `¿Está seguro de que desea ${action} este tipo de habitación?`
      )
    )
      return;

    try {
      // Si está activo, usar DELETE para desactivar
      if (isCurrentlyActive) {
        const url = `/rooms/types/${type._id}`;
        const resp = await apiDelete<RoomType>(url, token);

        if (resp.success) {
          showNotification("success", `Tipo ${actionPast}`);
          await load();
        } else {
          const errorMessage = resp.message || `Error al ${action}`;
          showNotification("error", "Error", errorMessage);
        }
      } else {
        // Si está desactivado, usar PUT para activar
        const body = { isActive: true };
        const url = `/rooms/types/${type._id}`;
        const resp = await apiPut<RoomType, typeof body>(url, body, token);

        if (resp.success) {
          showNotification("success", `Tipo ${actionPast}`);
          await load();
        } else {
          const errorMessage = resp.message || `Error al ${action}`;
          showNotification("error", "Error", errorMessage);
        }
      }
    } catch (e: any) {
      const errorMessage = e?.response?.message || e?.message || `Error desconocido al ${action}`;
      showNotification("error", "Error", errorMessage);
    }
  };

  const deletePermanent = async (type: RoomType) => {
    if (
      !confirm(
        `⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE el tipo "${type.tipo}"?\n\nEsta acción NO se puede deshacer.\n\nEl sistema verificará que no haya habitaciones usando este tipo antes de eliminarlo.`
      )
    )
      return;

    try {
      const url = `/rooms/types/${type._id}/permanent`;
      const resp = await apiDelete<any>(url, token);

      if (resp.success) {
        showNotification("success", "Tipo eliminado", `El tipo "${type.tipo}" ha sido eliminado permanentemente`);
        await load();
      } else {
        const errorMessage = resp.message || "Error al eliminar el tipo";
        showNotification("error", "Error", errorMessage);
      }
    } catch (e: any) {
      const errorMessage = e?.response?.message || e?.message || "Error desconocido al eliminar";
      showNotification("error", "Error", errorMessage);
    }
  };

  // Filtrar tipos según los filtros aplicados
  const filteredTypes = useMemo(() => {
    return roomTypes.filter((type) => {
      if (statusFilter === "active") return type.isActive === true;
      if (statusFilter === "inactive") return type.isActive !== true;
      return true; // "all"
    });
  }, [roomTypes, statusFilter]);

  // Paginación
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedTypes,
    itemsPerPage,
    totalItems
  } = usePagination(filteredTypes, 13);

  // Componente para el hover de filas en modo claro
  const RowWithHover = ({ children, ...props }: any) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <Box
        as="tr"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered
            ? mode === "light"
              ? colors.gold
              : colors.bg
            : "transparent",
          transition: "background-color 0.2s",
        }}
        {...props}
      >
        {children}
      </Box>
    );
  };

  return (
    <DashboardShell title="Gestión de Tipos de Habitación">
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
          <RoomTypeFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
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
              <Flex align="center" gap={2}>
                <Icon as={FiRefreshCw} />
                <Text>{loading ? "Cargando..." : "Refrescar"}</Text>
              </Flex>
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
              <Flex align="center" gap={2}>
                <Icon as={FiPlus} />
                <Text>Crear Tipo</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {/* Tabla de tipos */}
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
            Listado de Tipos de Habitación
            <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
              ({totalItems} registros)
            </Text>
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
                    Descripción
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
                    textAlign="right"
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
                {paginatedTypes.map((type) => (
                  <RowWithHover key={type._id}>
                    <Box
                      as="td"
                      p={3}
                      color={mode === "light" ? undefined : colors.text}
                      style={{
                        color: mode === "light" ? undefined : colors.text,
                      }}
                    >
                      <Text fontWeight="medium">{type.tipo}</Text>
                    </Box>
                    <Box
                      as="td"
                      p={3}
                      color={mode === "light" ? undefined : colors.text}
                      style={{
                        color: mode === "light" ? undefined : colors.text,
                      }}
                    >
                      <Text fontSize="sm" color={colors.subtext}>
                        {type.descripcion || "-"}
                      </Text>
                    </Box>
                    <Box
                      as="td"
                      p={3}
                      color={mode === "light" ? undefined : colors.text}
                      style={{
                        color: mode === "light" ? undefined : colors.text,
                      }}
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={type.isActive === true ? "#16a34a" : "#dc2626"}
                      >
                        {type.isActive === true ? "Activo" : "Inactivo"}
                      </Text>
                    </Box>
                    <Box
                      as="td"
                      p={3}
                      textAlign="right"
                    >
                      <Flex gap={2} justify="flex-end">
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={colors.border}
                          color={colors.text}
                          onClick={() => {
                            setSelectedRoomTypeForPricing(type);
                            setIsPricingModalOpen(true);
                          }}
                          _hover={{
                            bg: colors.surface,
                            borderColor: colors.gold,
                            color: colors.gold,
                          }}
                          title="Configurar precios por número de huéspedes"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={FiDollarSign} />
                            <Text>Precios</Text>
                          </Flex>
                        </Button>
                        <Button
                          size="sm"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => openEditModal(type)}
                          _hover={{
                            bg: "#b8941f",
                            transform: "scale(1.05)",
                            borderColor: mode === "light" ? "white" : undefined,
                          }}
                          borderColor={mode === "light" ? "transparent" : undefined}
                          style={{
                            borderWidth: mode === "light" ? "1px" : "0",
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={FiEdit} />
                            <Text>Editar</Text>
                          </Flex>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={mode === "light" ? undefined : colors.border}
                          color={mode === "light" ? undefined : colors.subtext}
                          style={{
                            borderColor: mode === "light" ? "white" : colors.border,
                            color: mode === "light" ? "white" : colors.subtext,
                          }}
                          onClick={() => toggleActive(type)}
                          _hover={{
                            borderColor: mode === "light" ? "white" : colors.gold,
                            color: mode === "light" ? "white" : colors.gold,
                            bg: "transparent"
                          }}
                          transition="all 0.2s"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={type.isActive === true ? FiXCircle : FiCheckCircle} />
                            <Text>{type.isActive === true ? "Desactivar" : "Activar"}</Text>
                          </Flex>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#dc2626"
                          color="#dc2626"
                          onClick={() => deletePermanent(type)}
                          _hover={{
                            bg: "#dc2626",
                            color: "white",
                            transform: "scale(1.05)",
                            borderColor: "#dc2626"
                          }}
                          transition="all 0.2s"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={FiTrash2} />
                            <Text>Eliminar</Text>
                          </Flex>
                        </Button>
                      </Flex>
                    </Box>
                  </RowWithHover>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Vista de cards para móvil/tablet */}
          <Box display={{ base: "block", lg: "none" }}>
            {paginatedTypes.length === 0 ? (
              <Text color={colors.subtext} textAlign="center" py={8}>
                No hay tipos de habitación registrados
              </Text>
            ) : (
              <Stack gap={4}>
                {paginatedTypes.map((type) => (
                  <Box
                    key={type._id}
                    p={4}
                    bg={colors.bg}
                    borderWidth="2px"
                    borderColor={colors.border}
                    borderRadius="md"
                    boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
                  >
                    <Flex justify="space-between" align="start" mb={3}>
                      <Box flex="1">
                        <Text fontSize="lg" fontWeight="bold" color={colors.gold} mb={1}>
                          {type.tipo}
                        </Text>
                        <Text fontSize="sm" color={colors.subtext} mb={2}>
                          {type.descripcion || "Sin descripción"}
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={type.isActive === true ? "#16a34a" : "#dc2626"}
                        >
                          {type.isActive === true ? "Activo" : "Inactivo"}
                        </Text>
                      </Box>
                    </Flex>

                    <Flex gap={2} wrap="wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor={colors.border}
                        color={colors.text}
                        onClick={() => {
                          setSelectedRoomTypeForPricing(type);
                          setIsPricingModalOpen(true);
                        }}
                        _hover={{
                          bg: colors.surface,
                          borderColor: colors.gold,
                          color: colors.gold,
                        }}
                        title="Configurar precios por número de huéspedes"
                        flex="1"
                        minW="80px"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiDollarSign} />
                          <Text>Precios</Text>
                        </Flex>
                      </Button>
                      <Button
                        size="sm"
                        bg={colors.gold}
                        color={colors.bg}
                        onClick={() => openEditModal(type)}
                        _hover={{
                          bg: "#b8941f",
                          transform: "scale(1.05)"
                        }}
                        transition="all 0.2s"
                        fontWeight="semibold"
                        flex="1"
                        minW="80px"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiEdit} />
                          <Text>Editar</Text>
                        </Flex>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor={colors.border}
                        color={colors.subtext}
                        onClick={() => toggleActive(type)}
                        _hover={{
                          borderColor: colors.gold,
                          color: colors.gold,
                          bg: "transparent"
                        }}
                        transition="all 0.2s"
                        flex="1"
                        minW="80px"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={type.isActive === true ? FiXCircle : FiCheckCircle} />
                          <Text>{type.isActive === true ? "Desactivar" : "Activar"}</Text>
                        </Flex>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="#dc2626"
                        color="#dc2626"
                        onClick={() => deletePermanent(type)}
                        _hover={{
                          bg: "#dc2626",
                          color: "white",
                          transform: "scale(1.05)"
                        }}
                        transition="all 0.2s"
                        flex="1"
                        minW="80px"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={FiTrash2} />
                          <Text>Eliminar</Text>
                        </Flex>
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Controles de paginación */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </Box>

        {/* Modal */}
        <RoomTypeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          isEditing={!!editingId}
          formData={formData}
          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
          isLoading={isSubmitting}
        />

        {/* Modal de gestión de precios */}
        {selectedRoomTypeForPricing && (
          <GuestPricingModal
            isOpen={isPricingModalOpen}
            onClose={() => {
              setIsPricingModalOpen(false);
              setSelectedRoomTypeForPricing(null);
            }}
            roomTypeId={selectedRoomTypeForPricing._id}
            roomTypeName={selectedRoomTypeForPricing.tipo}
            currentPricing={selectedRoomTypeForPricing.guestPricing}
            onSuccess={() => {
              showNotification("success", "Precios actualizados", "Los precios por número de huéspedes se han actualizado correctamente");
              load(); // Recargar tipos para obtener los precios actualizados
            }}
          />
        )}

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
                <Icon as={FiX} />
              </Button>
            </Flex>
          </Box>
        )}
      </Stack>
    </DashboardShell>
  );
}
