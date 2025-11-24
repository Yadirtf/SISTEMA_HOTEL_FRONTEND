"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Heading, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getSessionUser, getToken } from "@/lib/session";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";

type Accion = {
  idAccion: number;
  idUsuario: number;
  descripcionAccion: string;
  fechaAccion: string;
};

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  persona: null | { nombre: string; apellido: string };
};

export default function AdminHistorialPage() {
  const router = useRouter();
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const token = getToken() || undefined;

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.rol !== "Administrador") {
      router.replace("/panel");
    }
  }, [router]);

  const cargar = async () => {
    const resp = await apiGet<Accion[]>(`/auth/acciones`, token);
    if (resp.success && resp.data) setAcciones(resp.data);
    const u = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token);
    if (u.success && u.data) setUsuarios(u.data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const nombreDe = (id: number) => {
    const u = usuarios.find(x => x.idUsuario === id);
    if (!u) return `#${id}`;
    if (u.persona) return `${u.persona.nombre} ${u.persona.apellido}`.trim();
    return u.correo;
  };

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedAcciones,
    itemsPerPage,
    totalItems
  } = usePagination(acciones, 13);

  return (
    <DashboardShell title="Administración - Historial">
      <Stack gap={4}>
        <Heading size="sm" color="white">Historial de acciones</Heading>
        <Box overflowX="auto" bg="gray.800" borderColor="gray.700" borderWidth="1px" borderRadius="md" p={4}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Usuario</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Acción</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAcciones.map((a) => (
                <tr key={a.idAccion}>
                  <td style={{ padding: '8px', color: '#E2E8F0' }}>{nombreDe(a.idUsuario)}</td>
                  <td style={{ padding: '8px', color: '#E2E8F0' }}>{a.descripcionAccion}</td>
                  <td style={{ padding: '8px', color: '#E2E8F0' }}>{new Date(a.fechaAccion).toLocaleString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true, // Formato de 12 horas con AM/PM
                  })}</td>
                </tr>
              ))}
              {paginatedAcciones.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '12px', color: '#A0AEC0' }}>No hay acciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </Box>
      </Stack>
    </DashboardShell>
  );
}


