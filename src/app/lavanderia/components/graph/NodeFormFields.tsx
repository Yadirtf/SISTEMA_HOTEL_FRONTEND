"use client";

import { Box, Input, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CreateGraphNodeFormData, NodeType } from "../../types";

interface NodeFormFieldsProps {
  formData: CreateGraphNodeFormData;
  onChange: (data: Partial<CreateGraphNodeFormData>) => void;
  showIdField?: boolean;
}

export function NodeFormFields({ formData, onChange, showIdField = true }: NodeFormFieldsProps) {
  const { colors } = useThemeMode();

  const selectStyle = {
    width: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: '6px',
    padding: '8px 12px',
    border: `2px solid ${colors.border}`,
    fontSize: '14px',
    cursor: 'pointer',
  };

  const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = colors.gold;
    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = colors.border;
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleSelectHover = (e: React.MouseEvent<HTMLSelectElement>, isEnter: boolean) => {
    e.currentTarget.style.borderColor = isEnter ? colors.gold : colors.border;
  };

  return (
    <>
      {showIdField && (
        <Box>
          <Text color={colors.text} mb={2} fontWeight="semibold">
            ID (MongoDB ObjectId o identificador único)
          </Text>
          <Input
            value={formData.id}
            onChange={(e) => onChange({ id: e.target.value })}
            placeholder="Ej: 507f1f77bcf86cd799439011"
            bg={colors.bg}
            borderColor={colors.border}
            color={colors.text}
          />
        </Box>
      )}

      {formData.type === NodeType.CLIENT && (
        <>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Número de Documento
            </Text>
            <Input
              value={formData.documentNumber || ""}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />
          </Box>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Nombre
            </Text>
            <Input
              value={formData.firstName || ""}
              onChange={(e) => onChange({ firstName: e.target.value })}
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />
          </Box>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Apellido
            </Text>
            <Input
              value={formData.lastName || ""}
              onChange={(e) => onChange({ lastName: e.target.value })}
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />
          </Box>
        </>
      )}

      {formData.type === NodeType.ROOM && (
        <Box>
          <Text color={colors.text} mb={2} fontWeight="semibold">
            Número de Habitación
          </Text>
          <Input
            value={formData.number || ""}
            onChange={(e) => onChange({ number: e.target.value })}
            bg={colors.bg}
            borderColor={colors.border}
            color={colors.text}
          />
        </Box>
      )}

      {formData.type === NodeType.LAUNDRY_SERVICE && (
        <>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Número de Servicio
            </Text>
            <Input
              value={formData.serviceNumber || ""}
              onChange={(e) => onChange({ serviceNumber: e.target.value })}
              placeholder="Ej: LAV-2024-001"
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />
          </Box>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Estado
            </Text>
            <select
              value={formData.status || "pending"}
              onChange={(e) => onChange({ status: e.target.value })}
              style={selectStyle}
              onMouseEnter={(e) => handleSelectHover(e, true)}
              onMouseLeave={(e) => handleSelectHover(e, false)}
              onFocus={handleSelectFocus}
              onBlur={handleSelectBlur}
            >
              <option value="pending" style={{ backgroundColor: colors.surface, color: colors.text }}>
                Pendiente
              </option>
              <option value="completed" style={{ backgroundColor: colors.surface, color: colors.text }}>
                Completado
              </option>
              <option value="cancelled" style={{ backgroundColor: colors.surface, color: colors.text }}>
                Cancelado
              </option>
            </select>
          </Box>
          <Box>
            <Text color={colors.text} mb={2} fontWeight="semibold">
              Monto Total
            </Text>
            <Input
              type="number"
              value={formData.totalAmount || ""}
              onChange={(e) => onChange({ totalAmount: parseFloat(e.target.value) })}
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />
          </Box>
        </>
      )}
    </>
  );
}

