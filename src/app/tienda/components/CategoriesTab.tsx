"use client";

import { useState } from "react";
import { Box, Button, Flex, Input, Text, Spinner, SimpleGrid, Badge, IconButton } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useCategoriesData } from "../hooks/useCategoriesData";
import { useCategoriesActions } from "../hooks/useCategoriesActions";
import { CategoryModal } from "./CategoryModal";

interface CategoriesTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function CategoriesTab({ showNotification }: CategoriesTabProps) {
  const { colors } = useThemeMode();
  const [showInactive, setShowInactive] = useState(false);
  const { categories, loading, loadCategories } = useCategoriesData(showInactive);

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
    handleToggleActive,
  } = useCategoriesActions(showNotification, loadCategories);

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        align={{ base: "stretch", md: "center" }}
      >
        <Text fontSize="xl" fontWeight="bold" color={colors.gold} flex={1}>
          Categorías
        </Text>
        
        {/* Filtro de categorías inactivas */}
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
          + Nueva Categoría
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
              p={4}
              bg={colors.surface}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={colors.border}
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
            >
              <Flex justify="space-between" align="start" mb={2}>
                <Box flex={1}>
                  <Text fontWeight="bold" fontSize="lg" color={colors.text} mb={1}>
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text fontSize="sm" color={colors.subtext} mb={2}>
                      {category.description}
                    </Text>
                  )}
                  <Badge colorScheme={category.isActive ? "green" : "red"} mb={2}>
                    {category.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </Box>
                {category.color && (
                  <Box w="24px" h="24px" borderRadius="full" bg={category.color} border="2px solid" borderColor={colors.border} />
                )}
              </Flex>

              <Flex gap={2} flexWrap="wrap">
                <Button
                  size="sm"
                  onClick={() => openEditModal(category)}
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  flex={1}
                  minW="100px"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleActive(category)}
                  bg={category.isActive ? "orange.500" : "green.500"}
                  color="white"
                  _hover={{ bg: category.isActive ? "orange.600" : "green.600" }}
                  whiteSpace="nowrap"
                >
                  {category.isActive ? "Desactivar" : "Activar"}
                </Button>
                <IconButton
                  size="sm"
                  aria-label="Eliminar"
                  onClick={() => handleDelete(category)}
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                >
                  🗑️
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

