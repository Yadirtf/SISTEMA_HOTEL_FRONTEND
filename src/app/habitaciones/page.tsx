"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { getToken } from "@/lib/session";

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // form state (create/update)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [type, setType] = useState<"single" | "double" | "suite">("single");
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [floor, setFloor] = useState<number>(1);
  const [maxOccupancy, setMaxOccupancy] = useState<number>(1);
  const [description, setDescription] = useState<string>("");

  // Mapas de traducción
  const typeToEs: Record<string, string> = { single: "Individual", double: "Doble", suite: "Suite" };
  const esToType: Record<string, string> = { Individual: "single", Doble: "double", Suite: "suite" };
  const statusToEs: Record<string, string> = { available: "Disponible", occupied: "Ocupada", maintenance: "Mantenimiento", cleaning: "Limpieza" };

  const load = async () => {
    setLoading(true);
    const resp = await apiGet<Room[]>(`/rooms`, token);
    if (resp.success && resp.data) setRooms(resp.data);
    setMsg(resp.message || (resp.success ? "Habitaciones cargadas" : "Error"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setNumber("");
    setType("single");
    setPricePerNight(0);
    setFloor(1);
    setMaxOccupancy(1);
    setDescription("");
  };

  const submit = async () => {
    setMsg(null);
    const body: any = { number, type, pricePerNight, floor, maxOccupancy, description, isActive: true };
    try {
      const resp = editingId
        ? await apiPut<Room, typeof body>(`/rooms/number/${number}`, body, token)
        : await apiPost<Room, typeof body>(`/rooms`, body, token);
      setMsg(resp.message || (resp.success ? "Guardado" : "Error al guardar"));
      if (resp.success) { resetForm(); await load(); }
    } catch (e: any) {
      setMsg(`Error al guardar: ${e?.message || "desconocido"}`);
    }
  };

  const deactivate = async (id: string, roomNumber?: string) => {
    if (!confirm("¿Está seguro de que desea desactivar esta habitación? (La habitación se ocultará pero no se eliminará)")) return;
    setMsg(null);
    try {
      // Preferir desactivación por número si está disponible
      const resp = roomNumber
        ? await apiDelete<Room>(`/rooms/number/${roomNumber}`, token)
        : await apiDelete<Room>(`/rooms/${id}`, token);
      setMsg(resp.message || (resp.success ? "Habitación desactivada" : "Error al desactivar"));
      if (resp.success) await load();
    } catch (e: any) {
      setMsg(`Error al desactivar: ${e?.message || "desconocido"}`);
    }
  };

  const deletePermanent = async (id: string, roomNumber?: string) => {
    if (!confirm("⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE esta habitación? Esta acción NO se puede deshacer.")) return;
    setMsg(null);
    try {
      // Preferir eliminación por número si está disponible
      const resp = roomNumber
        ? await apiDelete<any>(`/rooms/number/${roomNumber}/permanent`, token)
        : await apiDelete<any>(`/rooms/${id}/permanent`, token);
      setMsg(resp.message || (resp.success ? "Habitación eliminada permanentemente" : "Error al eliminar"));
      if (resp.success) await load();
    } catch (e: any) {
      setMsg(`Error al eliminar: ${e?.message || "desconocido"}`);
    }
  };

  const changeStatus = async (roomNumber: string, newStatus: string) => {
    setMsg(null);
    try {
      const resp = await apiPatch<Room, { status: string }>(`/rooms/number/${roomNumber}/status`, { status: newStatus }, token);
      setMsg(resp.message || (resp.success ? "Estado actualizado" : "Error al actualizar estado"));
      if (resp.success) await load();
    } catch (e: any) {
      setMsg(`Error al actualizar estado: ${e?.message || "desconocido"}`);
    }
  };

  const startEdit = (r: Room) => {
    setEditingId(r._id);
    setNumber(r.number || "");
    setType((r.type as any) || "single");
    setPricePerNight(r.pricePerNight || 0);
    setFloor(r.floor || 1);
    setMaxOccupancy(r.maxOccupancy || 1);
    setDescription(r.description || "");
  };

  return (
    <DashboardShell title="Habitaciones">
      <Stack gap={6}>
        <Box bg="gray.800" borderColor="gray.700" borderWidth="1px" borderRadius="md" p={4}>
          <Heading size="sm" color="white" mb={3}>{editingId ? "Editar habitación" : "Crear habitación"}</Heading>
          <Flex gap={3} wrap="wrap">
            <Box>
              <Text color="gray.300" mb={1}>Número</Text>
              <Input value={number} onChange={(e) => setNumber(e.target.value)} w="160px" bg="gray.700" color="white" />
            </Box>
            <Box>
              <Text color="gray.300" mb={1}>Tipo</Text>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{ width: 160, backgroundColor: '#2D3748', color: 'white', borderRadius: 6, padding: 8, border: '1px solid #4A5568' }}
              >
                <option value="single">{typeToEs.single}</option>
                <option value="double">{typeToEs.double}</option>
                <option value="suite">{typeToEs.suite}</option>
              </select>
            </Box>
            <Box>
              <Text color="gray.300" mb={1}>Precio/noche</Text>
              <Input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} w="160px" bg="gray.700" color="white" />
            </Box>
            <Box>
              <Text color="gray.300" mb={1}>Piso</Text>
              <Input type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} w="120px" bg="gray.700" color="white" />
            </Box>
            <Box>
              <Text color="gray.300" mb={1}>Capacidad</Text>
              <Input type="number" value={maxOccupancy} onChange={(e) => setMaxOccupancy(Number(e.target.value))} w="120px" bg="gray.700" color="white" />
            </Box>
            <Box flex={1} minW="240px">
              <Text color="gray.300" mb={1}>Descripción</Text>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} bg="gray.700" color="white" />
            </Box>
            <Flex align="end" gap={2}>
              <Button colorScheme="blue" onClick={submit}>{editingId ? "Actualizar" : "Crear"}</Button>
              {editingId && <Button variant="outline" onClick={resetForm}>Cancelar</Button>}
            </Flex>
          </Flex>
        </Box>

        <Box bg="gray.800" borderColor="gray.700" borderWidth="1px" borderRadius="md" p={4}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="sm" color="white">Listado de habitaciones</Heading>
            <Button size="sm" onClick={load} disabled={loading} colorScheme="blue">Refrescar</Button>
          </Flex>
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Precio</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Piso</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Capacidad</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Descripción</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #2D3748', color: '#CBD5E0' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id}>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{r.number}</td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{typeToEs[r.type] || r.type}</td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{r.pricePerNight}</td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>
                      <select
                        value={r.status}
                        onChange={(e) => changeStatus(r.number, e.target.value)}
                        style={{
                          backgroundColor: '#2D3748',
                          color: 'white',
                          borderRadius: 6,
                          padding: '4px 8px',
                          border: '1px solid #4A5568',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="available">{statusToEs.available}</option>
                        <option value="occupied">{statusToEs.occupied}</option>
                        <option value="maintenance">{statusToEs.maintenance}</option>
                        <option value="cleaning">{statusToEs.cleaning}</option>
                      </select>
                    </td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{r.floor ?? '-'}</td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{r.maxOccupancy ?? '-'}</td>
                    <td style={{ padding: 8, color: '#E2E8F0' }}>{r.description || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <Flex gap={2} wrap="wrap" direction="column">
                        <Flex gap={2}>
                          <Button size="xs" onClick={() => startEdit(r)}>Editar</Button>
                          <Button size="xs" colorScheme="orange" onClick={() => deactivate(r._id, r.number)}>Desactivar</Button>
                        </Flex>
                        <Button size="xs" colorScheme="red" onClick={() => deletePermanent(r._id, r.number)}>Eliminar</Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 12, color: '#A0AEC0' }}>Sin habitaciones.</td>
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


