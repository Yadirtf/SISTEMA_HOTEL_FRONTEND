"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack, Text, Icon } from "@chakra-ui/react";
import { FiRefreshCw, FiPlus, FiEdit, FiCheckCircle, FiXCircle, FiUserCheck, FiX } from "react-icons/fi";
import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { UserFilters } from "@/components/admin/UserFilters";
import { UserModal, UserFormData } from "@/components/admin/UserModal";

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  rol: "Administrador" | "Recepcionista" | string;
  estado: "Activo" | "Inactivo" | string;
  createDate: string;
  persona: null | { nombre: string; apellido: string; telefono: string };
};

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { colors, mode } = useThemeMode();
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);

  // Filtros
  const [rolFilter, setRolFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    correo: "",
    contrasena: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol: "Recepcionista",
    estado: "Activo",
  });

  const token = getToken() || undefined;
  const sessionUser = getSessionUser();

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.rol !== "Administrador") {
      router.replace("/panel");
    }
  }, [router]);

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token);
    if (resp.success && resp.data) {
      setUsuarios(resp.data);
      showNotification("success", "Usuarios cargados");
    } else {
      showNotification("error", "Error", resp.message || "Error al cargar usuarios");
    }
    setLoadingUsuarios(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarEstado = async (idUsuario: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const resp = await apiPatch<string, { estado: 'Activo' | 'Inactivo' }>(
        `/auth/usuarios/${idUsuario}/estado`,
        { estado: nuevoEstado as any },
        token
      );
      if (resp.success) {
        showNotification("success", "Estado actualizado", `Usuario ${nuevoEstado.toLowerCase()} exitosamente`);
        await cargarUsuarios();
      } else {
        showNotification("error", "Error", resp.message || "Error al actualizar estado");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  };

  const cambiarRol = async (idUsuario: number, rolActual: string) => {
    const nuevoRol = rolActual === 'Administrador' ? 'Recepcionista' : 'Administrador';
    try {
      const resp = await apiPatch<string, { rol: 'Administrador' | 'Recepcionista' }>(
        `/auth/usuarios/${idUsuario}/rol`,
        { rol: nuevoRol as any },
        token
      );
      if (resp.success) {
        showNotification("success", "Rol actualizado", `Rol cambiado a ${nuevoRol} exitosamente`);
        await cargarUsuarios();
      } else {
        showNotification("error", "Error", resp.message || "Error al actualizar rol");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      correo: "",
      contrasena: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "Recepcionista",
      estado: "Activo",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (usuario: UsuarioListItem) => {
    setIsEditMode(true);
    setEditingUserId(usuario.idUsuario);
    setFormData({
      correo: usuario.correo,
      contrasena: "", // Contraseña vacía para edición
      nombre: usuario.persona?.nombre || "",
      apellido: usuario.persona?.apellido || "",
      telefono: usuario.persona?.telefono || "",
      rol: usuario.rol as "Administrador" | "Recepcionista",
      estado: usuario.estado as "Activo" | "Inactivo",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      correo: "",
      contrasena: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "Recepcionista",
      estado: "Activo",
    });
  };

  const handleFormChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode && editingUserId) {
        // Modo edición: hacer PUT
        // Si la contraseña está vacía, no incluirla en el request
        const updateData: Partial<UserFormData> = { ...formData };
        if (!updateData.contrasena || updateData.contrasena.trim() === "") {
          delete updateData.contrasena;
        }
        const resp = await apiPut<any, Partial<UserFormData>>(`/auth/usuarios/${editingUserId}`, updateData, token);
        if (resp.success) {
          showNotification("success", "Usuario actualizado", resp.message || "Usuario actualizado exitosamente");
          closeModal();
          await cargarUsuarios();
        } else {
          showNotification("error", "Error", resp.message || "Error al actualizar usuario");
        }
      } else {
        // Modo creación: hacer POST
        const resp = await apiPost<any, UserFormData>(`/auth/usuarios`, formData, token);
        if (resp.success) {
          showNotification("success", "Usuario creado", resp.message || "Usuario creado exitosamente");
          closeModal();
          await cargarUsuarios();
        } else {
          showNotification("error", "Error", resp.message || "Error al crear usuario");
        }
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || (isEditMode ? "Error desconocido al actualizar usuario" : "Error desconocido al crear usuario"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSession = sessionUser ? u.idUsuario !== sessionUser.idUsuario : true;
      const matchesRol = rolFilter === "all" || u.rol === rolFilter;
      const matchesEstado = estadoFilter === "all" || u.estado === estadoFilter;
      return matchesSession && matchesRol && matchesEstado;
    });
  }, [usuarios, sessionUser, rolFilter, estadoFilter]);

  // Determinar si hay filtros activos
  const hasFilters = useMemo(() => {
    return rolFilter !== "all" || estadoFilter !== "all";
  }, [rolFilter, estadoFilter]);

  return (
    <DashboardShell title="Administración - Usuarios">
      <Stack gap={6}>
        {/* Barra superior con filtros y botón de refrescar */}
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
          <UserFilters
            rolFilter={rolFilter}
            estadoFilter={estadoFilter}
            onRolChange={setRolFilter}
            onEstadoChange={setEstadoFilter}
          />

          <Flex 
            gap={3} 
            align="end" 
            direction={{ base: "column", md: "row" }}
            w={{ base: "100%", md: "auto" }}
          >
            <Button
              size={{ base: "md", md: "sm" }}
              onClick={cargarUsuarios}
              disabled={loadingUsuarios}
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
                <Text>{loadingUsuarios ? "Cargando..." : "Refrescar"}</Text>
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
                <Text>Crear Usuario</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {/* Tabla de usuarios */}
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
            Listado de Usuarios
            {hasFilters && (
              <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
                ({usuariosFiltrados.length} de {usuarios.filter((u) => (sessionUser ? u.idUsuario !== sessionUser.idUsuario : true)).length})
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
                    ID
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
                    Nombre
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
                    Apellido
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
                    Teléfono
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
                    Correo
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
                    Rol
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
                {usuariosFiltrados.length === 0 && !loadingUsuarios ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: colors.subtext,
                      }}
                    >
                      No hay usuarios para mostrar
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
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
                            {u.idUsuario}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.persona?.nombre || "-"}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.persona?.apellido || "-"}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.persona?.telefono || "-"}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.correo}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.rol}
                          </Box>
                          <Box as="td" p={3} color={subtextColor}>
                            {u.estado}
                          </Box>
                          <Box as="td" p={3}>
                            <Flex gap={2} wrap="wrap">
                              <Button
                                size="xs"
                                bg={colors.gold}
                                color={colors.bg}
                                onClick={() => openEditModal(u)}
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
                                bg={colors.gold}
                                color={colors.bg}
                                onClick={() => cambiarEstado(u.idUsuario, u.estado)}
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
                                  <Icon as={u.estado === "Activo" ? FiXCircle : FiCheckCircle} />
                                  <Text>Cambiar Estado</Text>
                                </Flex>
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                borderColor={colors.border}
                                color={isHovered && mode === "light" ? "white" : colors.subtext}
                                onClick={() => cambiarRol(u.idUsuario, u.rol)}
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
                                <Flex align="center" gap={1}>
                                  <Icon as={FiUserCheck} />
                                  <Text>Actualizar Rol</Text>
                                </Flex>
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      );
                    };
                    return <RowWithHover key={u.idUsuario} />;
                  })
                )}
              </Box>
            </Box>
          </Box>

          {/* Vista de cards para móvil/tablet */}
          <Box display={{ base: "block", lg: "none" }}>
            {usuariosFiltrados.length === 0 && !loadingUsuarios ? (
              <Box
                textAlign="center"
                p={8}
                color={colors.subtext}
                fontSize="sm"
              >
                No hay usuarios para mostrar
              </Box>
            ) : (
              <Stack gap={4}>
                {usuariosFiltrados.map((u) => {
                  return (
                    <Box
                      key={u.idUsuario}
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
                            {u.persona?.nombre || "-"} {u.persona?.apellido || ""}
                          </Text>
                          <Text fontSize="sm" color={colors.subtext}>
                            ID: {u.idUsuario}
                          </Text>
                        </Box>
                        <Box textAlign="right">
                          <Text fontSize="sm" fontWeight="bold" color={colors.gold}>
                            {u.rol}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext}>
                            {u.estado}
                          </Text>
                        </Box>
                      </Flex>

                      <Stack gap={2} mb={4}>
                        <Box>
                          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                            Correo
                          </Text>
                          <Text fontSize="sm" color={colors.text} fontWeight="medium">
                            {u.correo}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                            Teléfono
                          </Text>
                          <Text fontSize="sm" color={colors.text} fontWeight="medium">
                            {u.persona?.telefono || "-"}
                          </Text>
                        </Box>
                      </Stack>

                      <Flex gap={2} wrap="wrap">
                        <Button
                          size="sm"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => openEditModal(u)}
                          _hover={{ 
                            bg: "#b8941f",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                          flex="1"
                          minW="120px"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={FiEdit} />
                            <Text>Editar</Text>
                          </Flex>
                        </Button>
                        <Button
                          size="sm"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => cambiarEstado(u.idUsuario, u.estado)}
                          _hover={{ 
                            bg: "#b8941f",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                          flex="1"
                          minW="120px"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={u.estado === "Activo" ? FiXCircle : FiCheckCircle} />
                            <Text>Cambiar Estado</Text>
                          </Flex>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={colors.border}
                          color={colors.subtext}
                          onClick={() => cambiarRol(u.idUsuario, u.rol)}
                          _hover={{
                            borderColor: colors.gold,
                            color: colors.gold,
                            bg: "transparent"
                          }}
                          transition="all 0.2s"
                          flex="1"
                          minW="120px"
                        >
                          <Flex align="center" gap={1}>
                            <Icon as={FiUserCheck} />
                            <Text>Actualizar Rol</Text>
                          </Flex>
                        </Button>
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
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
                <Icon as={FiX} />
              </Button>
            </Flex>
          </Box>
        )}

        {/* Modal de creación/edición de usuario */}
        <UserModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={submit}
          formData={formData}
          onFormChange={handleFormChange}
          isLoading={isSubmitting}
          isEditMode={isEditMode}
        />
      </Stack>
    </DashboardShell>
  );
}
