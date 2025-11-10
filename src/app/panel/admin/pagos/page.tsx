"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getToken, getSessionUser } from "@/lib/session";
import { PaymentMethodsList } from "@/components/payments/PaymentMethodsList";
import { PaymentTypesList } from "@/components/payments/PaymentTypesList";
import { PaymentMethodModal } from "@/components/payments/PaymentMethodModal";
import { PaymentTypeModal } from "@/components/payments/PaymentTypeModal";
import { PaymentMethod, PaymentType, PaymentMethodFormData, PaymentTypeFormData } from "@/services/payment-methods";

export default function PagosPage() {
  const router = useRouter();
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const sessionUser = getSessionUser();

  const [activeTab, setActiveTab] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);

  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Guardia de rol
  useEffect(() => {
    const user = getSessionUser();
    if (user && user.rol !== "Administrador") {
      router.replace("/panel");
    }
  }, [router]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const { getPaymentMethods } = await import("@/services/payment-methods");
      const resp = await getPaymentMethods(false, token);
      if (resp.success && resp.data) {
        setPaymentMethods(resp.data);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentTypes = async () => {
    setLoading(true);
    try {
      const { getPaymentTypes } = await import("@/services/payment-methods");
      const resp = await getPaymentTypes(false, token);
      if (resp.success && resp.data) {
        setPaymentTypes(resp.data);
      }
    } catch (error) {
      console.error("Error loading payment types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
    loadPaymentTypes();
  }, []);

  const handleCreateMethod = () => {
    setSelectedPaymentMethod(null);
    setIsMethodModalOpen(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setIsMethodModalOpen(true);
  };

  const handleCreateType = () => {
    setSelectedPaymentType(null);
    setIsTypeModalOpen(true);
  };

  const handleEditType = (type: PaymentType) => {
    setSelectedPaymentType(type);
    setIsTypeModalOpen(true);
  };

  const handleMethodSaved = () => {
    loadPaymentMethods();
    setIsMethodModalOpen(false);
  };

  const handleTypeSaved = () => {
    loadPaymentTypes();
    setIsTypeModalOpen(false);
  };

  return (
    <DashboardShell title="Gestión de Medios y Tipos de Pago">
      <Box>
        <Flex
          gap={0}
          borderBottom="2px solid"
          borderColor={colors.border}
          mb={6}
          flexWrap="wrap"
        >
          {[
            { id: 0, label: "Medios de Pago" },
            { id: 1, label: "Tipos de Pago" },
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
          <Box>
            <Box mb={4}>
              <Button
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                onClick={handleCreateMethod}
              >
                Crear Medio de Pago
              </Button>
            </Box>
            <PaymentMethodsList
              paymentMethods={paymentMethods}
              loading={loading}
              onEdit={handleEditMethod}
              onDelete={loadPaymentMethods}
              token={token}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box mb={4}>
              <Button
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                onClick={handleCreateType}
              >
                Crear Tipo de Pago
              </Button>
            </Box>
            <PaymentTypesList
              paymentTypes={paymentTypes}
              loading={loading}
              onEdit={handleEditType}
              onDelete={loadPaymentTypes}
              token={token}
            />
          </Box>
        )}

        <PaymentMethodModal
          isOpen={isMethodModalOpen}
          onClose={() => setIsMethodModalOpen(false)}
          onSave={handleMethodSaved}
          paymentMethod={selectedPaymentMethod}
          token={token}
        />

        <PaymentTypeModal
          isOpen={isTypeModalOpen}
          onClose={() => setIsTypeModalOpen(false)}
          onSave={handleTypeSaved}
          paymentType={selectedPaymentType}
          token={token}
        />
      </Box>
    </DashboardShell>
  );
}

