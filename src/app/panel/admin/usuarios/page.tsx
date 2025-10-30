"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/session";
import { useRouter } from "next/navigation";

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
  const [msg, setMsg] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);

  const token = getToken() || undefined;
  const sessionUser = getSessionUser();

  useEffect(() => {
    const user = getSessionUser();
    if (user && user.rol !== "Administrador") {
      router.replace("/panel");
    }
  }, [router]);

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    setMsg(null);
    const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token);
    if (resp.success && resp.data) setUsuarios(resp.data);
    setMsg(resp.message || (resp.success ? `Usuarios cargados` : `Error`));
    setLoadingUsuarios(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <DashboardShell title="Administración - Usuarios">
      <Stack gap={6}>
        <Box bg="gray.800" borderColor="gray.700" borderWidth="1px" borderRadius="md" p={4}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" color="white">Usuarios</Heading>
            <Button size="sm" onClick={cargarUsuarios} disabled={loadingUsuarios} colorScheme="blue">Refrescar</Button>
          </Flex>
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Apellido</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Teléfono</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Correo</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios
                  .filter((u) => (sessionUser ? u.idUsuario !== sessionUser.idUsuario : true))
                  .map((u) => (
                  <tr key={u.idUsuario}>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.idUsuario}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.persona?.nombre || '-'}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.persona?.apellido || '-'}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.persona?.telefono || '-'}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.correo}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.rol}</td>
                    <td style={{ padding: '8px', color: '#E2E8F0' }}>{u.estado}</td>
                    <td style={{ padding: '8px' }}>
                      <Flex gap={2} wrap="wrap">
                        <Button size="xs" colorScheme="yellow" onClick={async () => {
                          const nuevo = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
                          const resp = await apiPatch<string, { estado: 'Activo' | 'Inactivo' }>(`/auth/usuarios/${u.idUsuario}/estado`, { estado: nuevo as any }, token);
                          setMsg(resp.message || (resp.success ? 'Estado actualizado' : 'Error'));
                          await cargarUsuarios();
                        }}>Cambiar estado</Button>
                        <Button size="xs" colorScheme="purple" onClick={async () => {
                          const nuevoRol = u.rol === 'Administrador' ? 'Recepcionista' : 'Administrador';
                          const resp = await apiPatch<string, { rol: 'Administrador' | 'Recepcionista' }>(`/auth/usuarios/${u.idUsuario}/rol`, { rol: nuevoRol as any }, token);
                          setMsg(resp.message || (resp.success ? 'Rol actualizado' : 'Error'));
                          await cargarUsuarios();
                        }}>Actualizar rol</Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '12px', color: '#A0AEC0' }}>No hay usuarios para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {msg && (
          <Box bg="gray.900" borderColor="gray.700" borderWidth="1px" p={3} borderRadius="md" color="gray.200">{msg}</Box>
        )}
      </Stack>
    </DashboardShell>
  );
}


