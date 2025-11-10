"use client";

import { Box, Button, Input, Text, Stack, Flex, IconButton, Badge } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useProductsData } from "../hooks/useProductsData";
import { useState, useEffect } from "react";
import { getActiveReservations, type ActiveReservation } from "@/services/reservations";
import { getToken } from "@/lib/session";
import type { SaleItem, Product } from "../types";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (products: Product[]) => void;
  items: SaleItem[];
  addItem: (item: SaleItem) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  selectedReservationId?: string;
  isCreditSale: boolean;
  setSelectedReservationId: (id: string | undefined) => void;
  setIsCreditSale: (value: boolean) => void;
  isLoading: boolean;
}

export function SaleModal({
  isOpen,
  onClose,
  onSubmit,
  items,
  addItem,
  removeItem,
  updateItemQuantity,
  selectedReservationId,
  isCreditSale,
  setSelectedReservationId,
  setIsCreditSale,
  isLoading,
}: SaleModalProps) {
  const { colors } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReservations, setActiveReservations] = useState<ActiveReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const { products } = useProductsData(undefined, searchQuery);

  // Cargar reservas activas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadActiveReservations();
    }
  }, [isOpen]);

  const loadActiveReservations = async () => {
    const token = getToken();
    if (!token) {
      console.error('[SaleModal] No hay token disponible');
      return;
    }
    
    setLoadingReservations(true);
    try {
      console.log('[SaleModal] Cargando reservas activas...');
      const resp = await getActiveReservations(token);
      console.log('[SaleModal] Respuesta completa:', JSON.stringify(resp, null, 2));
      
      if (resp.success && resp.data) {
        console.log('[SaleModal] Reservas activas cargadas:', resp.data.length, 'reservas');
        console.log('[SaleModal] Datos de reservas:', resp.data);
        
        // Asegurarse de que los datos sean un array
        const reservations = Array.isArray(resp.data) ? resp.data : [];
        setActiveReservations(reservations);
      } else {
        console.warn('[SaleModal] No se pudieron cargar las reservas activas:', resp.message);
        setActiveReservations([]);
      }
    } catch (error: any) {
      console.error('[SaleModal] Error al cargar reservas activas:', error);
      console.error('[SaleModal] Detalles del error:', error.message, error.stack);
      setActiveReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  if (!isOpen) return null;

  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) {
      alert("El producto no tiene stock disponible");
      return;
    }
    addItem({
      productId: product._id!,
      quantity: 1,
    });
    setSearchQuery("");
  };

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) return sum;
    return sum + product.salePrice * item.quantity;
  }, 0);

  const totalProfit = items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.productId);
    if (!product) return sum;
    return sum + (product.salePrice - product.purchasePrice) * item.quantity;
  }, 0);

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
        maxW="800px"
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
            Registrar Venta
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
          <Stack gap={4}>
            {/* Selector de reserva para ventas fiadas */}
            <Box>
              <Text mb={2} fontWeight="semibold" color={colors.text}>
                ¿Venta fiada a una habitación?
              </Text>
              <Flex gap={2} align="center" mb={2}>
                <input
                  type="checkbox"
                  checked={isCreditSale}
                  onChange={(e) => {
                    setIsCreditSale(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedReservationId(undefined);
                    }
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <Text color={colors.text} fontSize="sm">
                  Marcar como fiada
                </Text>
              </Flex>
              
              {isCreditSale && (
                <Box>
                  <select
                    value={selectedReservationId || ""}
                    onChange={(e) => setSelectedReservationId(e.target.value || undefined)}
                    style={{
                      width: '100%',
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      border: `2px solid ${colors.border}`,
                      fontSize: '14px',
                      cursor: loadingReservations ? 'wait' : 'pointer',
                      opacity: loadingReservations ? 0.6 : 1,
                    }}
                    disabled={loadingReservations}
                    onMouseEnter={(e) => {
                      if (!loadingReservations) {
                        e.currentTarget.style.borderColor = colors.gold;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingReservations) {
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
                    onFocus={(e) => {
                      if (!loadingReservations) {
                        e.currentTarget.style.borderColor = colors.gold;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="" style={{ backgroundColor: colors.surface, color: colors.text }}>
                      {loadingReservations ? "Cargando habitaciones..." : "Seleccionar habitación..."}
                    </option>
                    {!loadingReservations && activeReservations.length === 0 && (
                      <option value="" disabled style={{ backgroundColor: colors.surface, color: colors.subtext }}>
                        No hay habitaciones ocupadas actualmente
                      </option>
                    )}
                    {!loadingReservations && activeReservations.map((reservation) => {
                      // Manejar diferentes formatos de respuesta del backend
                      const guest = typeof reservation.guest === 'object' && reservation.guest !== null 
                        ? reservation.guest 
                        : null;
                      const room = typeof reservation.room === 'object' && reservation.room !== null 
                        ? reservation.room 
                        : null;
                      
                      const guestName = guest 
                        ? `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || guest.documentNumber || reservation.documentNumber
                        : reservation.documentNumber;
                      const roomNumber = room?.number || reservation.roomNumber || 'N/A';
                      
                      return (
                        <option
                          key={reservation._id}
                          value={reservation._id}
                          style={{ backgroundColor: colors.surface, color: colors.text }}
                        >
                          Habitación {roomNumber} - {guestName}
                        </option>
                      );
                    })}
                  </select>
                  {!loadingReservations && activeReservations.length === 0 && (
                    <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                      Solo se muestran habitaciones con estado "Ocupada" (checked_in)
                    </Text>
                  )}
                </Box>
              )}
            </Box>

            <Input
              placeholder="Buscar producto por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={colors.bg}
              borderColor={colors.border}
              color={colors.text}
            />

            {searchQuery && products.length > 0 && (
              <Box maxH="200px" overflowY="auto" borderWidth="1px" borderColor={colors.border} borderRadius="md" p={2}>
                {products.filter(p => p.isActive && p.stock > 0).map((product) => (
                  <Flex
                    key={product._id}
                    justify="space-between"
                    align="center"
                    p={2}
                    _hover={{ bg: colors.bg }}
                    cursor="pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <Box>
                      <Text fontWeight="bold">{product.name}</Text>
                      <Text fontSize="sm" color={colors.subtext}>
                        ${product.salePrice.toLocaleString()} - Stock: {product.stock}
                      </Text>
                    </Box>
                    <Button size="sm" bg={colors.gold} color="white">
                      Agregar
                    </Button>
                  </Flex>
                ))}
              </Box>
            )}

            {items.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2} color={colors.text}>
                  Productos en la venta
                </Text>
                <Stack gap={2}>
                  {items.map((item) => {
                    const product = products.find((p) => p._id === item.productId);
                    if (!product) return null;
                    return (
                      <Flex
                        key={item.productId}
                        justify="space-between"
                        align="center"
                        p={3}
                        bg={colors.bg}
                        borderRadius="md"
                      >
                        <Box flex={1}>
                          <Text fontWeight="bold">{product.name}</Text>
                          <Text fontSize="sm" color={colors.subtext}>
                            ${product.salePrice.toLocaleString()} c/u
                          </Text>
                        </Box>
                        <Flex align="center" gap={2}>
                          <IconButton
                            size="sm"
                            aria-label="Decrementar"
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                            bg={colors.border}
                            color={colors.text}
                          >
                            -
                          </IconButton>
                          <Text minW="40px" textAlign="center" fontWeight="bold">
                            {item.quantity}
                          </Text>
                          <IconButton
                            size="sm"
                            aria-label="Incrementar"
                            onClick={() => {
                              if (item.quantity < product.stock) {
                                updateItemQuantity(item.productId, item.quantity + 1);
                              }
                            }}
                            bg={colors.border}
                            color={colors.text}
                            disabled={item.quantity >= product.stock}
                          >
                            +
                          </IconButton>
                          <Text minW="100px" textAlign="right" fontWeight="bold">
                            ${(product.salePrice * item.quantity).toLocaleString()}
                          </Text>
                          <IconButton
                            size="sm"
                            aria-label="Eliminar"
                            onClick={() => removeItem(item.productId)}
                            bg="red.500"
                            color="white"
                          >
                            🗑️
                          </IconButton>
                        </Flex>
                      </Flex>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {items.length > 0 && (
              <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="2px" borderColor={colors.border}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="bold" color={colors.text}>Total:</Text>
                  <Text fontWeight="bold" fontSize="xl" color={colors.gold}>${total.toLocaleString()}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={colors.subtext}>Ganancia:</Text>
                  <Badge colorScheme="green" fontSize="md">${totalProfit.toLocaleString()}</Badge>
                </Flex>
              </Box>
            )}

            <Flex gap={3} justify="flex-end">
              <Button onClick={onClose} variant="ghost" color={colors.subtext}>
                Cancelar
              </Button>
              <Button
                onClick={() => onSubmit(products)}
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
                disabled={isLoading || items.length === 0 || (isCreditSale && !selectedReservationId)}
              >
                {isLoading 
                  ? "Registrando..." 
                  : isCreditSale 
                    ? "Registrar Venta Fiada" 
                    : "Registrar Venta"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

