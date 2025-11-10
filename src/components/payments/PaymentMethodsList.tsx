"use client";

import { Box, IconButton, Spinner, Text, Badge, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PaymentMethod } from "@/services/payment-methods";
import { deletePaymentMethod } from "@/services/payment-methods";

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  onEdit: (method: PaymentMethod) => void;
  onDelete: () => void;
  token?: string;
}

export function PaymentMethodsList({
  paymentMethods,
  loading,
  onEdit,
  onDelete,
  token,
}: PaymentMethodsListProps) {
  const { colors } = useThemeMode();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este medio de pago?")) {
      return;
    }

    try {
      const resp = await deletePaymentMethod(id, token);
      if (resp.success) {
        onDelete();
      } else {
        alert(resp.message || "Error al eliminar el medio de pago");
      }
    } catch (error: any) {
      alert(error.message || "Error inesperado al eliminar el medio de pago");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color={colors.gold} />
      </Box>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color={colors.subtext}>No hay medios de pago registrados</Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Nombre</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Descripción</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Icono</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Orden</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Estado</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paymentMethods.map((method) => (
            <tr key={method._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={{ padding: "12px", color: colors.text }}>{method.name}</td>
              <td style={{ padding: "12px", color: colors.subtext }}>{method.description || "-"}</td>
              <td style={{ padding: "12px", color: colors.text }}>{method.icon || "-"}</td>
              <td style={{ padding: "12px", color: colors.text }}>{method.order}</td>
              <td style={{ padding: "12px" }}>
                <Badge colorScheme={method.isActive ? "green" : "red"}>
                  {method.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td style={{ padding: "12px" }}>
                <Flex gap={2}>
                  <IconButton
                    aria-label="Editar"
                    size="sm"
                    bg={colors.gold}
                    color="white"
                    _hover={{ bg: "#b8941f" }}
                    onClick={() => onEdit(method)}
                  >
                    ✏️
                  </IconButton>
                  <IconButton
                    aria-label="Eliminar"
                    size="sm"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={() => method._id && handleDelete(method._id)}
                  >
                    🗑️
                  </IconButton>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
