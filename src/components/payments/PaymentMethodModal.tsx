"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  Box,
  Text,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PaymentMethod, PaymentMethodFormData, createPaymentMethod, updatePaymentMethod } from "@/services/payment-methods";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  paymentMethod?: PaymentMethod | null;
  token?: string;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  onSave,
  paymentMethod,
  token,
}: PaymentMethodModalProps) {
  const { colors } = useThemeMode();
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: "",
    description: "",
    icon: "",
    isActive: true,
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        name: paymentMethod.name || "",
        description: paymentMethod.description || "",
        icon: paymentMethod.icon || "",
        isActive: paymentMethod.isActive ?? true,
        order: paymentMethod.order ?? 0,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "",
        isActive: true,
        order: 0,
      });
    }
  }, [paymentMethod, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      let resp;
      if (paymentMethod?._id) {
        resp = await updatePaymentMethod(paymentMethod._id, formData, token);
      } else {
        resp = await createPaymentMethod(formData, token);
      }

      if (resp.success) {
        onSave();
      } else {
        alert(resp.message || "Error al guardar el medio de pago");
      }
    } catch (error: any) {
      alert(error.message || "Error inesperado al guardar el medio de pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(3px)"
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        color={colors.text}
        borderRadius="lg"
        w={{ base: "95%", md: "90%" }}
        maxW="500px"
        maxH="90vh"
        overflowY="auto"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            {paymentMethod ? "Editar Medio de Pago" : "Crear Medio de Pago"}
          </Text>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            color={colors.subtext}
            _hover={{ bg: colors.bg, color: colors.gold }}
            minW="auto"
            w="32px"
            h="32px"
            p={0}
            fontSize="xl"
          >
            ×
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={5}>
            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Nombre <Text as="span" color="red.500">*</Text>
              </Text>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                required
              />
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Descripción
              </Text>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                rows={3}
              />
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Icono
              </Text>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Ej: 💵, 💳, 🏦"
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              />
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Orden
              </Text>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min={0}
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              />
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Estado
              </Text>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "6px",
                  color: colors.text,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <option value="active" style={{ backgroundColor: colors.surface, color: colors.text }}>Activo</option>
                <option value="inactive" style={{ backgroundColor: colors.surface, color: colors.text }}>Inactivo</option>
              </select>
            </Box>

            <Flex gap={3} justify="flex-end">
              <Button onClick={onClose} variant="ghost" color={colors.subtext}>
                Cancelar
              </Button>
              <Button
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                {paymentMethod ? "Actualizar" : "Crear"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
