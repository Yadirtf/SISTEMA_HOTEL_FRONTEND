"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Badge, Button, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";

export function ReservationsBell() {
  const token = getToken() || undefined;
  const { colors } = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => (overdue?.length || 0) + (expiring?.length || 0), [overdue, expiring]);

  const load = async (minutes: number = 60) => {
    setLoading(true);
    try {
      const [o, e] = await Promise.all([
        apiGet<any[]>("/reservations/overdue", token),
        apiGet<any[]>(`/reservations/expiring?minutes=${minutes}`, token),
      ]);
      setOverdue(o.success && Array.isArray(o.data) ? o.data : []);
      setExpiring(e.success && Array.isArray(e.data) ? e.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(60);
    const id = setInterval(() => load(60), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <Box position="relative" ref={containerRef}>
      <IconButton 
        aria-label="Notificaciones de reservas" 
        onClick={() => setIsOpen(!isOpen)}
        bg={isOpen ? colors.bg : "transparent"}
        _hover={{ bg: colors.bg }}
      >
        🔔
      </IconButton>
      {total > 0 && (
        <Badge position="absolute" top="-6px" right="-6px" colorScheme="red" borderRadius="full" px={2}>
          {total}
        </Badge>
      )}

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 12px)"
          right={0}
          w="420px"
          maxH="600px"
          bg={colors.surface}
          color={colors.text}
          borderWidth="2px"
          borderColor={colors.border}
          borderRadius="lg"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
          zIndex={1000}
          overflow="hidden"
        >
          {/* Flecha superior */}
          <Box
            position="absolute"
            top="-8px"
            right="20px"
            w="0"
            h="0"
            borderLeft="8px solid transparent"
            borderRight="8px solid transparent"
            borderBottom={`8px solid ${colors.border}`}
          />
          <Box
            position="absolute"
            top="-6px"
            right="20px"
            w="0"
            h="0"
            borderLeft="8px solid transparent"
            borderRight="8px solid transparent"
            borderBottom={`8px solid ${colors.surface}`}
          />

          {/* Header */}
          <Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor={colors.border}>
            <Text fontWeight="bold" fontSize="lg">Notificaciones de Reservas</Text>
            <Button size="xs" onClick={() => load(60)} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </Button>
          </Flex>

          {/* Contenido */}
          <Box p={4} maxH="520px" overflowY="auto">
            {/* Vencidas */}
            <Box mb={4}>
              <Flex align="center" gap={2} mb={3}>
                <Text fontWeight="bold" fontSize="sm">Vencidas</Text>
                <Badge colorScheme="red" borderRadius="full">{overdue.length}</Badge>
              </Flex>
              <Stack gap={2}>
                {overdue.length === 0 ? (
                  <Text fontSize="sm" color={colors.subtext} textAlign="center" py={2}>
                    Sin reservas vencidas
                  </Text>
                ) : (
                  overdue.map((r: any) => (
                    <Box
                      key={r._id}
                      p={3}
                      bg={colors.bg}
                      borderWidth="1px"
                      borderColor={colors.border}
                      borderRadius="md"
                      _hover={{ borderColor: colors.gold }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="start" gap={2}>
                        <Box flex="1">
                          <Text fontWeight="bold" fontSize="sm" color={colors.text}>
                            Hab. {r.roomNumber}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext} mt={1}>
                            {r.guest?.firstName} {r.guest?.lastName}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext}>
                            {r.documentNumber}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext} mt={1}>
                            Salida: {r.checkOutTime ? new Date(r.checkOutTime).toLocaleString("es-CO", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true, // Formato de 12 horas con AM/PM
                            }) : "-"}
                          </Text>
                        </Box>
                        <Badge colorScheme="red" fontSize="xs">Vencida</Badge>
                      </Flex>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>

            {/* Por vencer */}
            <Box>
              <Flex align="center" gap={2} mb={3}>
                <Text fontWeight="bold" fontSize="sm">Por vencer (60 min)</Text>
                <Badge colorScheme="yellow" borderRadius="full">{expiring.length}</Badge>
              </Flex>
              <Stack gap={2}>
                {expiring.length === 0 ? (
                  <Text fontSize="sm" color={colors.subtext} textAlign="center" py={2}>
                    Sin reservas por vencer
                  </Text>
                ) : (
                  expiring.map((r: any) => (
                    <Box
                      key={r._id}
                      p={3}
                      bg={colors.bg}
                      borderWidth="1px"
                      borderColor={colors.border}
                      borderRadius="md"
                      _hover={{ borderColor: colors.gold }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="start" gap={2}>
                        <Box flex="1">
                          <Text fontWeight="bold" fontSize="sm" color={colors.text}>
                            Hab. {r.roomNumber}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext} mt={1}>
                            {r.guest?.firstName} {r.guest?.lastName}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext}>
                            {r.documentNumber}
                          </Text>
                          <Text fontSize="xs" color={colors.subtext} mt={1}>
                            Salida: {r.checkOutTime ? new Date(r.checkOutTime).toLocaleString("es-CO", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true, // Formato de 12 horas con AM/PM
                            }) : "-"}
                          </Text>
                        </Box>
                        <Badge colorScheme="yellow" fontSize="xs">Por vencer</Badge>
                      </Flex>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

