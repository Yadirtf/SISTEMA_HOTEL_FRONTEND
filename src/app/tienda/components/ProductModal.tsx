"use client";

import React, { useState } from "react";
import { Box, Button, Input, Textarea, Text, Stack, Flex, Icon } from "@chakra-ui/react";
import { FiX, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice, parseFormattedNumber, formatNumberInput } from "@/lib/format";
import type { ProductFormData, Category } from "../types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: ProductFormData;
  onFormChange: (field: keyof ProductFormData, value: any) => void;
  isLoading: boolean;
  categories: Category[];
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading,
  categories,
}: ProductModalProps) {
  const { colors } = useThemeMode();
  const [purchasePriceInput, setPurchasePriceInput] = useState<string>("");
  const [salePriceInput, setSalePriceInput] = useState<string>("");
  const [stockInput, setStockInput] = useState<string>("");

  // Sincronizar los inputs cuando cambia formData (al editar o resetear)
  React.useEffect(() => {
    if (formData.purchasePrice === 0) {
      setPurchasePriceInput("");
    } else if (!purchasePriceInput || parseFormattedNumber(purchasePriceInput) !== formData.purchasePrice) {
      setPurchasePriceInput(formatNumberInput(formData.purchasePrice.toString()));
    }
  }, [formData.purchasePrice]);

  React.useEffect(() => {
    if (formData.salePrice === 0) {
      setSalePriceInput("");
    } else if (!salePriceInput || parseFormattedNumber(salePriceInput) !== formData.salePrice) {
      setSalePriceInput(formatNumberInput(formData.salePrice.toString()));
    }
  }, [formData.salePrice]);

  React.useEffect(() => {
    if ((formData.stock || 0) === 0) {
      setStockInput("");
    } else if (!stockInput || parseInt(stockInput.replace(/\D/g, "")) !== (formData.stock || 0)) {
      setStockInput((formData.stock || 0).toString());
    }
  }, [formData.stock]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
        maxW="600px"
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
            {isEditing ? "Editar Producto" : "Crear Producto"}
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
          >
            <Icon as={FiX} fontSize="xl" />
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <form onSubmit={handleSubmit}>
            <Stack gap={5}>
              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Código de Barras <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  value={formData.barcode}
                  onChange={(e) => onFormChange("barcode", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Nombre <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Precio de Compra <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={purchasePriceInput}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value);
                    setPurchasePriceInput(formatted);
                    const n = parseFormattedNumber(formatted);
                    onFormChange("purchasePrice", n);
                  }}
                  onBlur={(e) => {
                    const n = parseFormattedNumber(e.target.value);
                    onFormChange("purchasePrice", n);
                    setPurchasePriceInput(n === 0 ? "" : formatNumberInput(n.toString()));
                  }}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  placeholder="0"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Precio de Venta <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={salePriceInput}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value);
                    setSalePriceInput(formatted);
                    const n = parseFormattedNumber(formatted);
                    onFormChange("salePrice", n);
                  }}
                  onBlur={(e) => {
                    const n = parseFormattedNumber(e.target.value);
                    onFormChange("salePrice", n);
                    setSalePriceInput(n === 0 ? "" : formatNumberInput(n.toString()));
                  }}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  placeholder="0"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  required
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Stock
                </Text>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={stockInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStockInput(value);
                    // Permitir escribir libremente, solo actualizar el valor numérico
                    const n = parseInt(value.replace(/\D/g, "")) || 0;
                    onFormChange("stock", n);
                  }}
                  onBlur={(e) => {
                    const n = parseInt(e.target.value.replace(/\D/g, "")) || 0;
                    onFormChange("stock", n);
                    setStockInput(n === 0 ? "" : n.toString());
                  }}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  placeholder="0"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Categoría
                </Text>
                <select
                  value={formData.category || ""}
                  onChange={(e) => onFormChange("category", e.target.value || undefined)}
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                    Sin categoría
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      style={{ backgroundColor: colors.surface, color: colors.text }}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Descripción
                </Text>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => onFormChange("description", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  rows={3}
                />
              </Box>

              <Flex gap={3} justify="flex-end">
                <Button onClick={onClose} variant="ghost" color={colors.subtext}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiXCircle} />
                    <Text>Cancelar</Text>
                  </Flex>
                </Button>
                <Button
                  type="submit"
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  disabled={isLoading}
                >
                  <Flex align="center" gap={2}>
                    <Icon as={FiCheckCircle} />
                    <Text>{isLoading ? "Cargando..." : isEditing ? "Actualizar" : "Crear"}</Text>
                  </Flex>
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

