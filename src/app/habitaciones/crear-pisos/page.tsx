"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack, Text, Icon } from "@chakra-ui/react";
import { FiRefreshCw, FiPlus, FiEdit, FiCheckCircle, FiXCircle, FiTrash2, FiX } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/session";
import { FloorFilters } from "@/components/habitaciones/FloorFilters";
import { FloorModal, FloorFormData } from "@/components/habitaciones/FloorModal";
import { PaginationControls } from "@/components/habitaciones/PaginationControls";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type Floor = {
  _id: string;
  numero: number;
  descripcion?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export default function CrearPisosPage() {
  const token = getToken() || undefined;
  const { colors, mode } = useThemeMode();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FloorFormData>({
    numero: 0,
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
      const resp = await apiGet<Floor[]>(
        `/floors${includeInactive ? "?includeInactive=true" : ""}`,
        token
      );
      if (resp.success && resp.data) {
        console.log("[crear-pisos] Pisos cargados:", resp.data);
        setFloors(resp.data);
      } else {
        showNotification("error", "Error", resp.message || "Error al cargar pisos");
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
      numero: 0,
      descripcion: "",
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (floor: Floor) => {
    console.log("[crear-pisos] openEditModal - Piso recibido:", floor);
    setFormData({
      numero: floor.numero,
      descripcion: floor.descripcion || "",
    });
    setEditingId(floor._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const submit = async () => {
    if (!formData.numero || formData.numero <= 0) {
      showNotification("error", "Error", "Por favor ingrese un número de piso válido");
      return;
    }

    setIsSubmitting(true);
    
    const body: any = {
      numero: formData.numero,
      descripcion: formData.descripcion || undefined,
    };

    try {
      const resp = editingId
        ? await apiPut<Floor, typeof body>(`/floors/${editingId}`, body, token)
        : await apiPost<Floor, typeof body>(`/floors`, body, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Piso actualizado" : "Piso registrado",
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

  const toggleActive = async (floor: Floor) => {
    const isCurrentlyActive = floor.isActive === true;
    const action = isCurrentlyActive ? "desactivar" : "activar";
    const actionPast = isCurrentlyActive ? "desactivado" : "activado";
    
    if (
      !confirm(
        `¿Está seguro de que desea ${action} este piso?`
      )
    )
      return;

    try {
      let resp;
      if (isCurrentlyActive) {
        resp = await apiDelete<any>(`/floors/${floor._id}`, token);
      } else {
        resp = await apiPut<any>(`/floors/${floor._id}`, { isActive: true }, token);
      }

      if (resp.success) {
        showNotification("success", `Piso ${actionPast}`, resp.message || `Piso ${actionPast} exitosamente`);
        await load();
      } else {
        showNotification("error", "Error", resp.message || `Error al ${action}`);
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || `Error desconocido al ${action}`);
    }
  };

  const deletePermanent = async (floor: Floor) => {
    if (
      !confirm(
        "⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE este piso? Esta acción NO se puede deshacer y se validará que el piso no esté en uso por ninguna habitación."
      )
    )
      return;

    try {
      const resp = await apiDelete<any>(`/floors/${floor._id}/permanent`, token);

      if (resp.success) {
        showNotification("success", "Piso eliminado");
        await load();
      } else {
        showNotification("error", "Error", resp.message || "Error al eliminar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  };

  // Filtrar pisos según el filtro de estado
  const filteredFloors = useMemo(() => {
    return floors.filter((floor) => {
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && floor.isActive === true) ||
        (statusFilter === "inactive" && floor.isActive === false);
      return matchesStatus;
    });
  }, [floors, statusFilter]);

  // Determinar si hay filtros activos
  const hasFilters = useMemo(() => {
    return statusFilter !== "all";
  }, [statusFilter]);

  // Items por página según si hay filtros
  const itemsPerPage = hasFilters ? 5 : 13;

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredFloors.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Obtener los pisos de la página actual
  const paginatedFloors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFloors.slice(startIndex, endIndex);
  }, [filteredFloors, currentPage, itemsPerPage]);

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
    <DashboardShell title="Gestión de Pisos">
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
          <FloorFilters
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
                <Text>Registrar Piso</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {/* Tabla de pisos */}
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
            Listado de Pisos
            {hasFilters && (
              <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
                ({filteredFloors.length} de {floors.length})
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
                {paginatedFloors.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "#A0AEC0",
                      }}
                    >
                      {floors.length === 0
                        ? "No hay pisos registrados"
                        : "No hay pisos que coincidan con los filtros"}
                    </td>
                  </tr>
                ) : (
                  paginatedFloors.map((f) => {
                    const RowWithHover = () => {
                      const [isHovered, setIsHovered] = useState(false);
                      const hoverBg = mode === "light" ? colors.gold : "#1a1a1a";
                      const textColor = isHovered && mode === "light" ? "white" : colors.text;
                      const subtextColor = isHovered && mode === "light" ? "white" : colors.subtext;

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
                            {f.numero}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {f.descripcion || "-"}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {f.isActive ? "Activo" : "Inactivo"}
                          </Box>
                          <Box as="td" p={3}>
                            <Flex gap={2} wrap="wrap">
                              <Button
                                size="xs"
                                bg={colors.gold}
                                color={colors.bg}
                                onClick={() => openEditModal(f)}
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
                                <Flex align="center" gap={1}>
                                  <Icon as={FiEdit} />
                                  <Text>Editar</Text>
                                </Flex>
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                color={f.isActive ? "#dc2626" : "#22c55e"}
                                onClick={() => toggleActive(f)}
                                _hover={{ 
                                  bg: f.isActive ? "#dc2626" : "#22c55e",
                                  color: "white",
                                  transform: "scale(1.05)",
                                  borderColor: f.isActive ? "#dc2626" : "#22c55e"
                                }}
                                transition="all 0.2s"
                                borderWidth={isHovered && mode === "light" ? "1px" : "1px"}
                                borderColor={isHovered && mode === "light" ? "white" : (f.isActive ? "#dc2626" : "#22c55e")}
                              >
                                <Flex align="center" gap={1}>
                                  <Icon as={f.isActive ? FiXCircle : FiCheckCircle} />
                                  <Text>{f.isActive ? "Desactivar" : "Activar"}</Text>
                                </Flex>
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                color="#dc2626"
                                onClick={() => deletePermanent(f)}
                                _hover={{ 
                                  bg: "#dc2626",
                                  color: "white",
                                  transform: "scale(1.05)",
                                  borderColor: "#dc2626"
                                }}
                                transition="all 0.2s"
                                borderWidth={isHovered && mode === "light" ? "1px" : "1px"}
                                borderColor={isHovered && mode === "light" ? "white" : "#dc2626"}
                              >
                                <Flex align="center" gap={1}>
                                  <Icon as={FiTrash2} />
                                  <Text>Eliminar</Text>
                                </Flex>
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      );
                    };
                    return <RowWithHover key={f._id} />;
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Vista de tarjetas para móvil/tablet */}
          <Box display={{ base: "block", lg: "none" }}>
            {paginatedFloors.length === 0 && !loading ? (
              <Text textAlign="center" py={8} color={colors.subtext}>
                {floors.length === 0
                  ? "No hay pisos registrados"
                  : "No hay pisos que coincidan con los filtros"}
              </Text>
            ) : (
              <Stack gap={4}>
                {paginatedFloors.map((f) => (
                  <Box
                    key={f._id}
                    p={4}
                    bg={colors.bg}
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={colors.border}
                  >
                    <Flex justify="space-between" align="start" mb={3} flexWrap="wrap" gap={2}>
                      <Box flex="1">
                        <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                          Número de Piso
                        </Text>
                        <Text fontSize="lg" color={colors.gold} fontWeight="bold">
                          {f.numero}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                          Estado
                        </Text>
                        <Text 
                          fontSize="sm" 
                          color={f.isActive ? "#22c55e" : "#dc2626"} 
                          fontWeight="medium"
                        >
                          {f.isActive ? "Activo" : "Inactivo"}
                        </Text>
                      </Box>
                    </Flex>

                    {f.descripcion && (
                      <Box mb={3}>
                        <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                          Descripción
                        </Text>
                        <Text fontSize="sm" color={colors.text}>
                          {f.descripcion}
                        </Text>
                      </Box>
                    )}

                    <Flex gap={2} wrap="wrap">
                      <Button
                        size="sm"
                        bg={colors.gold}
                        color={colors.bg}
                        onClick={() => openEditModal(f)}
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
                        borderColor={f.isActive ? "#dc2626" : "#22c55e"}
                        color={f.isActive ? "#dc2626" : "#22c55e"}
                        onClick={() => toggleActive(f)}
                        _hover={{ 
                          bg: f.isActive ? "#dc2626" : "#22c55e",
                          color: "white",
                          transform: "scale(1.05)"
                        }}
                        transition="all 0.2s"
                        flex="1"
                        minW="80px"
                      >
                        <Flex align="center" gap={1}>
                          <Icon as={f.isActive ? FiXCircle : FiCheckCircle} />
                          <Text>{f.isActive ? "Desactivar" : "Activar"}</Text>
                        </Flex>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="#dc2626"
                        color="#dc2626"
                        onClick={() => deletePermanent(f)}
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

          {/* Paginación */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredFloors.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </Box>

        {/* Notificación */}
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
                <Icon as={FiX} />
              </Button>
            </Flex>
          </Box>
        )}

        {/* Modal de registro/edición */}
        <FloorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          isEditing={!!editingId}
          formData={formData}
          onFormChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
          isLoading={isSubmitting}
        />
      </Stack>
    </DashboardShell>
  );
}

