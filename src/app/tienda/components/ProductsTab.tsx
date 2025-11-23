"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, Input, Text, Spinner, SimpleGrid, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiPlus, FiEdit, FiCheckCircle, FiXCircle, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { useProductsData } from "../hooks/useProductsData";
import { useProductsActions } from "../hooks/useProductsActions";
import { useCategoriesData } from "../hooks/useCategoriesData";
import { ProductModal } from "./ProductModal";
import type { Product, Category } from "../types";

interface ProductsTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function ProductsTab({ showNotification }: ProductsTabProps) {
  const { colors } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  
  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { products, loading, loadProducts } = useProductsData(
    categoryFilter || undefined, 
    debouncedSearchQuery || undefined,
    showInactive
  );
  const { categories } = useCategoriesData();
  
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
  } = useProductsActions(showNotification, loadProducts);

  const getCategoryName = (product: Product): string => {
    if (!product.category) return "Sin categoría";
    if (typeof product.category === "object") {
      return product.category.name;
    }
    const cat = categories.find((c) => c._id === product.category);
    return cat?.name || "Sin categoría";
  };

  return (
    <Box>
      {/* Header con búsqueda y filtros */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        align={{ base: "stretch", md: "center" }}
      >
        {/* Barra de búsqueda */}
        <Input
          placeholder="Buscar por nombre o código de barras..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={colors.surface}
          borderColor={colors.border}
          borderWidth="2px"
          color={colors.text}
          flex={1}
          _focus={{
            borderColor: colors.gold,
            boxShadow: `0 0 0 1px ${colors.gold}`,
          }}
        />
        
        {/* Filtro de categoría compacto */}
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
        
        {/* Filtro de productos inactivos */}
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
            Solo activos
          </option>
          <option value="inactive" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Incluir inactivos
          </option>
        </select>
        
        {/* Botón de nuevo producto */}
        <Button
          onClick={openCreateModal}
          bg={colors.gold}
          color="white"
          _hover={{ bg: "#b8941f" }}
          whiteSpace="nowrap"
        >
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Nuevo Producto</Text>
          </Flex>
        </Button>
      </Flex>

      {/* Lista de productos */}
      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : products.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay productos registrados</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {products.map((product) => (
            <Box
              key={product._id}
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
                    {product.name}
                  </Text>
                  <Text fontSize="sm" color={colors.subtext} mb={2}>
                    Código: {product.barcode}
                  </Text>
                  <Badge colorScheme={product.isActive ? "green" : "red"} mb={2}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </Box>
                <Badge bg={typeof product.category === "object" ? product.category?.color : undefined}>
                  {getCategoryName(product)}
                </Badge>
              </Flex>
              
              <Box mb={3}>
                <Text fontSize="sm" color={colors.subtext}>
                  Compra: ${formatPrice(product.purchasePrice)}
                </Text>
                <Text fontSize="sm" color={colors.subtext}>
                  Venta: ${formatPrice(product.salePrice)}
                </Text>
                <Text fontSize="sm" color={colors.subtext}>
                  Ganancia: ${formatPrice(product.salePrice - product.purchasePrice)}
                </Text>
                <Text fontSize="sm" color={product.stock <= 10 ? "red" : colors.subtext} fontWeight="bold">
                  Stock: {formatPrice(product.stock)}
                </Text>
              </Box>

              <Flex gap={2} flexWrap="wrap">
                <Button
                  size="sm"
                  onClick={() => openEditModal(product)}
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  flex={1}
                  minW="100px"
                >
                  <Flex align="center" gap={1}>
                    <Icon as={FiEdit} />
                    <Text>Editar</Text>
                  </Flex>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleActive(product)}
                  bg={product.isActive ? "orange.500" : "green.500"}
                  color="white"
                  _hover={{ bg: product.isActive ? "orange.600" : "green.600" }}
                  whiteSpace="nowrap"
                >
                  <Flex align="center" gap={1}>
                    <Icon as={product.isActive ? FiXCircle : FiCheckCircle} />
                    <Text>{product.isActive ? "Desactivar" : "Activar"}</Text>
                  </Flex>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDelete(product)}
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                >
                  <Flex align="center" gap={1}>
                    <Icon as={FiTrash2} />
                    <Text>Eliminar</Text>
                  </Flex>
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Modal de producto */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isSubmitting}
        categories={categories}
      />
    </Box>
  );
}

