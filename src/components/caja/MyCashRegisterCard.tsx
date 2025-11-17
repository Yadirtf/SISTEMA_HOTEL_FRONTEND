"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Heading,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getToken, getSessionUser } from "@/lib/session";
import { getMyCashRegister, openMyCashRegister, closeMyCashRegister } from "@/services/cash-registers";
import { CashRegister } from "@/app/caja/types";
import { formatDate, formatCurrency } from "@/lib/format";
import { OpenCashRegisterModal } from "./OpenCashRegisterModal";
import { CloseMyCashRegisterModal } from "./CloseMyCashRegisterModal";
import { InlineNotice } from "@/components/common/InlineNotice";
import { ExpensesTab } from "./ExpensesTab";

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: "green.500", color: "white" },
  closed: { bg: "gray.500", color: "white" },
  suspended: { bg: "orange.500", color: "white" },
};

export function MyCashRegisterCard() {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const user = getSessionUser();
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const {
    open: isOpenModalOpen,
    onOpen: onOpenModalOpen,
    onClose: onOpenModalClose,
  } = useDisclosure();
  
  const {
    open: isCloseModalOpen,
    onOpen: onCloseModalOpen,
    onClose: onCloseModalClose,
  } = useDisclosure();

  const loadMyCashRegister = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const resp = await getMyCashRegister(token);
      if (resp.success) {
        setCashRegister(resp.data);
      } else {
        setCashRegister(null);
      }
    } catch (error: any) {
      console.error("Error al cargar caja:", error);
      setCashRegister(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMyCashRegister();
  }, [loadMyCashRegister]);

  const showNotification = useCallback((type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  }, []);

  const handleOpen = async (initialAmount: number, notes?: string) => {
    if (!token) return;
    
    try {
      const resp = await openMyCashRegister({ initialAmount, notes }, token);
      if (resp.success) {
        showNotification("success", "Caja abierta", "Su caja ha sido abierta exitosamente");
        await loadMyCashRegister();
        onOpenModalClose();
      } else {
        showNotification("error", "Error", resp.message || "Error al abrir la caja");
      }
    } catch (error: any) {
      showNotification("error", "Error", error?.message || "Error desconocido al abrir la caja");
    }
  };

  const handleClose = async (data: {
    actualBalance: number;
    closingNotes?: string;
    operationsReport?: {
      totalSales?: number;
      totalReservations?: number;
      totalCashIncome?: number;
      totalCardIncome?: number;
      totalTransferIncome?: number;
    };
  }) => {
    if (!token || !cashRegister) return;
    
    try {
      const resp = await closeMyCashRegister(data, token);
      if (resp.success) {
        showNotification("success", "Caja cerrada", "Su caja ha sido cerrada exitosamente");
        await loadMyCashRegister();
        onCloseModalClose();
      } else {
        showNotification("error", "Error", resp.message || "Error al cerrar la caja");
      }
    } catch (error: any) {
      showNotification("error", "Error", error?.message || "Error desconocido al cerrar la caja");
    }
  };

  if (loading) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>Cargando información de caja...</Text>
      </Box>
    );
  }

  if (!cashRegister) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext} mb={4}>
          No tiene una caja asignada
        </Text>
        <Text color={colors.text} fontSize="sm">
          Contacte al administrador para que le asigne una caja
        </Text>
      </Box>
    );
  }

  const statusColor = statusColors[cashRegister.status] || statusColors.closed;

  return (
    <Box>
      {/* Notificaciones */}
      {notification && (
        <Box mb={4}>
          <InlineNotice
            type={notification.type}
            title={notification.title}
            description={notification.description}
            onClose={() => setNotification(null)}
            colors={colors}
          />
        </Box>
      )}

      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={6}
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
        mb={6}
      >
        <Stack gap={4}>
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading fontSize="xl" color={colors.gold} mb={2}>
                Mi Caja: {cashRegister.registerNumber}
              </Heading>
              <Badge
                bg={statusColor.bg}
                color={statusColor.color}
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
                fontWeight="bold"
              >
                {cashRegister.status === "open" ? "Abierta" : 
                 cashRegister.status === "closed" ? "Cerrada" : "Suspendida"}
              </Badge>
            </Box>
          </Flex>

          {/* Información de la caja */}
          <Stack gap={3}>
            <Flex justify="space-between" align="center">
              <Text color={colors.subtext} fontSize="sm">
                Monto Inicial:
              </Text>
              <Text color={colors.text} fontWeight="semibold">
                {formatCurrency(cashRegister.initialAmount)}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text color={colors.subtext} fontSize="sm">
                Saldo Actual:
              </Text>
              <Text color={colors.gold} fontWeight="bold" fontSize="lg">
                {formatCurrency(cashRegister.currentBalance)}
              </Text>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text color={colors.subtext} fontSize="sm">
                Apertura:
              </Text>
              <Text color={colors.text} fontSize="sm">
                {formatDate(cashRegister.openedAt)}
              </Text>
            </Flex>

            {cashRegister.closedAt && (
              <Flex justify="space-between" align="center">
                <Text color={colors.subtext} fontSize="sm">
                  Cierre:
                </Text>
                <Text color={colors.text} fontSize="sm">
                  {formatDate(cashRegister.closedAt)}
                </Text>
              </Flex>
            )}

            {cashRegister.notes && (
              <Box>
                <Text color={colors.subtext} fontSize="sm" mb={1}>
                  Notas:
                </Text>
                <Text color={colors.text} fontSize="sm">
                  {cashRegister.notes}
                </Text>
              </Box>
            )}
          </Stack>

          {/* Acciones según estado */}
          <Flex gap={3} mt={4} wrap="wrap">
            {cashRegister.status === "closed" && (
              <Button
                onClick={onOpenModalOpen}
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                flex="1"
                minW="150px"
                _hover={{ bg: "#b8941f" }}
              >
                Abrir Caja
              </Button>
            )}

            {cashRegister.status === "open" && (
              <Button
                onClick={onCloseModalOpen}
                bg="blue.500"
                color="white"
                fontWeight="bold"
                flex="1"
                minW="150px"
                _hover={{ bg: "blue.600" }}
              >
                Cerrar Caja
              </Button>
            )}

            {cashRegister.status === "suspended" && (
              <Text color={colors.subtext} fontSize="sm" fontStyle="italic">
                Su caja está suspendida. Contacte al administrador.
              </Text>
            )}
          </Flex>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box>
        <Flex
          gap={0}
          borderBottom="2px solid"
          borderColor={colors.border}
          mb={6}
          flexWrap="wrap"
        >
          {[
            { id: 0, label: "Información" },
            { id: 1, label: "Egresos" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              borderRadius={0}
              borderBottom={activeTab === tab.id ? "3px solid" : "none"}
              borderBottomColor={activeTab === tab.id ? colors.gold : "transparent"}
              color={activeTab === tab.id ? colors.gold : colors.subtext}
              fontWeight={activeTab === tab.id ? "bold" : "normal"}
              onClick={() => setActiveTab(tab.id)}
              _hover={{
                bg: colors.surface,
                color: colors.gold,
              }}
              px={6}
              py={4}
            >
              {tab.label}
            </Button>
          ))}
        </Flex>

        {activeTab === 0 && (
          <Box
            bg={colors.surface}
            borderColor={colors.border}
            borderWidth="2px"
            borderRadius="lg"
            p={6}
          >
            <Text color={colors.subtext} fontSize="sm" mb={4}>
              Información de la caja mostrada arriba
            </Text>
          </Box>
        )}

        {activeTab === 1 && cashRegister.status === "open" && (
          <ExpensesTab
            cashRegisterId={cashRegister._id}
            showNotification={showNotification}
            onExpenseRegistered={loadMyCashRegister}
          />
        )}

        {activeTab === 1 && cashRegister.status !== "open" && (
          <Box
            bg={colors.surface}
            borderColor={colors.border}
            borderWidth="2px"
            borderRadius="lg"
            p={6}
            textAlign="center"
          >
            <Text color={colors.subtext}>
              La caja debe estar abierta para gestionar egresos
            </Text>
          </Box>
        )}
      </Box>

      {/* Modales */}
      <OpenCashRegisterModal
        isOpen={isOpenModalOpen}
        onClose={onOpenModalClose}
        onSubmit={handleOpen}
      />

      {cashRegister && (
        <CloseMyCashRegisterModal
          isOpen={isCloseModalOpen}
          onClose={onCloseModalClose}
          onSubmit={handleClose}
          cashRegister={cashRegister}
        />
      )}
    </Box>
  );
}

