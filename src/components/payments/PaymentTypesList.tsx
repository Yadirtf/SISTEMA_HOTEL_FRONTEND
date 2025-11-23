"use client";

import { Box, Button, Spinner, Text, Badge, Flex, Icon } from "@chakra-ui/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PaymentType } from "@/services/payment-methods";
import { deletePaymentType } from "@/services/payment-methods";

interface PaymentTypesListProps {
  paymentTypes: PaymentType[];
  loading: boolean;
  onEdit: (type: PaymentType) => void;
  onDelete: () => void;
  token?: string;
}

export function PaymentTypesList({
  paymentTypes,
  loading,
  onEdit,
  onDelete,
  token,
}: PaymentTypesListProps) {
  const { colors } = useThemeMode();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tipo de pago?")) {
      return;
    }

    try {
      const resp = await deletePaymentType(id, token);
      if (resp.success) {
        onDelete();
      } else {
        alert(resp.message || "Error al eliminar el tipo de pago");
      }
    } catch (error: any) {
      alert(error.message || "Error inesperado al eliminar el tipo de pago");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color={colors.gold} />
      </Box>
    );
  }

  if (paymentTypes.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color={colors.subtext}>No hay tipos de pago registrados</Text>
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
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Orden</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Requiere Pago Completo</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Estado</th>
            <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paymentTypes.map((type) => (
            <tr key={type._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={{ padding: "12px", color: colors.text }}>{type.name}</td>
              <td style={{ padding: "12px", color: colors.subtext }}>{type.description || "-"}</td>
              <td style={{ padding: "12px", color: colors.text }}>{type.order}</td>
              <td style={{ padding: "12px" }}>
                <Badge colorScheme={type.requiresFullPayment ? "blue" : "gray"}>
                  {type.requiresFullPayment ? "Sí" : "No"}
                </Badge>
              </td>
              <td style={{ padding: "12px" }}>
                <Badge colorScheme={type.isActive ? "green" : "red"}>
                  {type.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td style={{ padding: "12px" }}>
                <Flex gap={2}>
                  <Button
                    size="sm"
                    bg={colors.gold}
                    color="white"
                    _hover={{ bg: "#b8941f" }}
                    onClick={() => onEdit(type)}
                  >
                    <Flex align="center" gap={1.5}>
                      <Icon as={FiEdit} />
                      <Text>Editar</Text>
                    </Flex>
                  </Button>
                  <Button
                    size="sm"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={() => type._id && handleDelete(type._id)}
                  >
                    <Flex align="center" gap={1.5}>
                      <Icon as={FiTrash2} />
                      <Text>Eliminar</Text>
                    </Flex>
                  </Button>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
