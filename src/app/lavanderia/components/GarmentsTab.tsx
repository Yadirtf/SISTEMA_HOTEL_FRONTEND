"use client";

import { useState } from "react";
import { Box, Button, Flex, Text, Spinner, SimpleGrid, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useLaundryGarmentsData } from "../hooks/useLaundryGarmentsData";
import { useLaundryGarmentsActions } from "../hooks/useLaundryGarmentsActions";
import { useLaundryCategoriesData } from "../hooks/useLaundryCategoriesData";
import { GarmentModal } from "./GarmentModal";

interface GarmentsTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function GarmentsTab({ showNotification }: GarmentsTabProps) {
  const { colors } = useThemeMode();
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  
  const { garments, loading, loadGarments } = useLaundryGarmentsData(
    categoryFilter || undefined,
    showInactive
  );
  const { categories } = useLaundryCategoriesData();
  
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
  } = useLaundryGarmentsActions(showNotification, loadGarments);

  const getCategoryName = (garment: any): string => {
    if (!garment.categoryId) return "Sin categoría";
    if (typeof garment.categoryId === "object") {
      return garment.categoryId.name;
    }
    const cat = categories.find((c) => c._id === garment.categoryId);
    return cat?.name || "Sin categoría";
  };

  const getCategoryPrice = (garment: any): number => {
    if (!garment.categoryId) return 0;
    if (typeof garment.categoryId === "object") {
      return garment.categoryId.pricePerUnit;
    }
    const cat = categories.find((c) => c._id === garment.categoryId);
    return cat?.pricePerUnit || 0;
  };

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        align={{ base: "stretch", md: "center" }}
      >
        <Text fontSize="xl" fontWeight="bold" color={colors.gold} flex={1}>
          Prendas
        </Text>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            width: 'auto',
            minWidth: '150px',
            maxWidth: '200px',
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
          <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Todas las categorías
          </option>
          {categories
            .filter(cat => cat.isActive)
            .map((cat) => (
              <option
                key={cat._id}
                value={cat._id}
                style={{ backgroundColor: colors.surface, color: colors.text }}
              >
                {cat.name}
              </option>
            ))}
        </select>

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
            <Text>Nueva Prenda</Text>
          </Flex>
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : garments.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay prendas registradas</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {garments.map((garment) => (
            <Box
              key={garment._id}
              p={5}
              bg={colors.surface}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={garment.isActive ? colors.border : "red.500"}
              _hover={{ borderColor: colors.gold, transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="start" mb={3}>
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold" color={colors.text} mb={1}>
                    {garment.name}
                  </Text>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Categoría: {getCategoryName(garment)}
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={colors.gold}>
                    ${getCategoryPrice(garment).toLocaleString()}
                  </Text>
                </Box>
                <Badge
                  colorScheme={garment.isActive ? "green" : "red"}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {garment.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </Flex>

              <Flex gap={2} mt={4}>
                <Button
                  onClick={() => openEditModal(garment)}
                  size="sm"
                  variant="ghost"
                  color={colors.gold}
                  _hover={{ bg: colors.bg }}
                  flex={1}
                >
                  <Icon as={FiEdit} mr={1} />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(garment)}
                  size="sm"
                  variant="ghost"
                  color="red.400"
                  _hover={{ bg: colors.bg, color: "red.500" }}
                >
                  <Icon as={FiTrash2} />
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <GarmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isSubmitting}
        categories={categories.filter(cat => cat.isActive)}
      />
    </Box>
  );
}

