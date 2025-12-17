"use client";

import { useState } from "react";
import { Box, Button, Flex, Text, Spinner, SimpleGrid, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useLaundryCategoriesData } from "../hooks/useLaundryCategoriesData";
import { useLaundryCategoriesActions } from "../hooks/useLaundryCategoriesActions";
import { CategoryModal } from "./CategoryModal";

interface CategoriesTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function CategoriesTab({ showNotification }: CategoriesTabProps) {
  const { colors } = useThemeMode();
  const [showInactive, setShowInactive] = useState(false);
  const { categories, loading, loadCategories } = useLaundryCategoriesData(showInactive);

  const {
    isModalOpen,
    editingId,
    isSubmitting,
    formData,
    handleFormChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useLaundryCategoriesActions(showNotification, loadCategories);

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        align={{ base: "stretch", md: "center" }}
      >
        <Text fontSize="xl" fontWeight="bold" color={colors.gold} flex={1}>
          Categorías de Lavandería
        </Text>
        
        <select
          value={showInactive ? "inactive" : "active"}
          onChange={(e) => setShowInactive(e.target.value === "inactive")}
          style={{
            width: 'auto',
            minWidth: '150px',
            maxWidth: '180px',
            backgroundColor: colors.surface,
            color: colors.text,
            borderRadius: '6px',
            padding: '8px 12px',
            border: `2px solid ${colors.border}`,
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
          <option value="active" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Solo activas
          </option>
          <option value="inactive" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Incluir inactivas
          </option>
        </select>
        
        <Button onClick={openCreateModal} bg={colors.gold} color="white" _hover={{ bg: "#b8941f" }} whiteSpace="nowrap">
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Nueva Categoría</Text>
          </Flex>
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : categories.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay categorías registradas</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {categories.map((category) => (
            <Box
              key={category._id}
              p={5}
              bg={colors.surface}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={category.isActive ? colors.border : "red.500"}
              _hover={{ borderColor: colors.gold, transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="start" mb={3}>
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold" color={colors.text} mb={1}>
                    {category.name}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>
                    ${category.pricePerUnit.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color={colors.subtext} mt={1}>
                    por unidad
                  </Text>
                </Box>
                <Badge
                  colorScheme={category.isActive ? "green" : "red"}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {category.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </Flex>

              <Flex gap={2} mt={4}>
                <Button
                  onClick={() => openEditModal(category)}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  color={colors.gold}
                  _hover={{ bg: colors.bg, color: colors.gold, transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                  flex={1}
                >
                  <Flex align="center" gap={2}>
                    <Icon as={FiEdit} />
                    <Text>Editar</Text>
                  </Flex>
                </Button>
                <IconButton
                  onClick={() => handleDelete(category)}
                  aria-label="Eliminar"
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  color="red.400"
                  _hover={{ bg: "red.50", color: "red.600", transform: "scale(1.1)" }}
                  transition="all 0.2s"
                >
                  <Icon as={FiTrash2} />
                </IconButton>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isSubmitting}
      />
    </Box>
  );
}

