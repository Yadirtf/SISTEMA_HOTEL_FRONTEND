"use client";

import { Box, Button, Input, Text, Stack, Flex, IconButton, Badge } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { useProductsData } from "../hooks/useProductsData";
import { useState, useEffect, useRef } from "react";
import { getActiveReservations, type ActiveReservation } from "@/services/reservations";
import { getToken } from "@/lib/session";
import { getProductByBarcode } from "@/services/products";
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
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { products } = useProductsData(undefined, searchQuery);

  // Cargar reservas activas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadActiveReservations();
      // Enfocar el input de búsqueda cuando se abre el modal
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Limpiar estados cuando se cierra el modal
      setSearchQuery("");
      setBarcodeError(null);
      setIsScanning(false);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, []);

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
    setBarcodeError(null);
    // Re-enfocar el input para el siguiente escaneo
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  // Función para detectar si el valor parece un código de barras
  const isBarcodeLike = (value: string): boolean => {
    // Los códigos de barras típicamente son:
    // - Solo números (EAN-13, UPC, etc.)
    // - O números con algunos caracteres especiales
    // - Longitud entre 8 y 20 caracteres
    // - Sin espacios (a menos que sea un código compuesto)
    const trimmed = value.trim();
    if (trimmed.length < 4 || trimmed.length > 30) {
      return false;
    }
    // Si es principalmente numérico o tiene formato de código de barras
    const numericRatio = (trimmed.match(/\d/g) || []).length / trimmed.length;
    return numericRatio > 0.7; // Al menos 70% numérico
  };

  // Función para buscar y añadir producto por código de barras
  const handleBarcodeScan = async (barcode: string) => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return;

    setIsScanning(true);
    setBarcodeError(null);

    const token = getToken();
    if (!token) {
      setBarcodeError("No hay sesión activa");
      setIsScanning(false);
      return;
    }

    try {
      const resp = await getProductByBarcode(trimmedBarcode, token);
      
      if (resp.success && resp.data) {
        const product = resp.data;
        
        // Verificar que el producto esté activo y tenga stock
        if (!product.isActive) {
          setBarcodeError(`El producto "${product.name}" está inactivo`);
          setIsScanning(false);
          return;
        }
        
        if (product.stock <= 0) {
          setBarcodeError(`El producto "${product.name}" no tiene stock disponible`);
          setIsScanning(false);
          return;
        }

        // Añadir el producto al carrito (addItem ya maneja incrementar cantidad si existe)
        handleAddProduct(product);
        setIsScanning(false);
      } else {
        setBarcodeError(resp.message || "Producto no encontrado");
        setIsScanning(false);
      }
    } catch (error: any) {
      console.error("[SaleModal] Error al buscar producto por código de barras:", error);
      setBarcodeError(error.message || "Error al buscar el producto");
      setIsScanning(false);
    }
  };

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setBarcodeError(null);

    // Limpiar timeout anterior si existe
    if (barcodeTimeoutRef.current) {
      clearTimeout(barcodeTimeoutRef.current);
      barcodeTimeoutRef.current = null;
    }

    // Si el valor parece un código de barras, esperar un momento para ver si se completa
    // (los escáneres envían los caracteres rápidamente y luego un Enter)
    if (isBarcodeLike(value)) {
      const currentValue = value; // Capturar el valor actual
      barcodeTimeoutRef.current = setTimeout(() => {
        // Verificar que el valor actual del input siga siendo el mismo (no se haya modificado)
        // Esto evita buscar códigos de barras parciales mientras el usuario está escribiendo
        if (searchInputRef.current?.value === currentValue && isBarcodeLike(currentValue) && currentValue.trim().length >= 4) {
          handleBarcodeScan(currentValue);
        }
      }, 200); // Reducido a 200ms para respuesta más rápida
    }
  };

  // Manejar tecla Enter en el input de búsqueda
  const handleSearchKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      
      if (!trimmed) return;

      // Si parece un código de barras, buscar por código de barras
      if (isBarcodeLike(trimmed)) {
        await handleBarcodeScan(trimmed);
      } else {
        // Si no parece código de barras, mantener el comportamiento de búsqueda normal
        // (ya se muestra la lista de productos filtrados)
        // Si hay un solo producto en los resultados y está activo con stock, añadirlo automáticamente
        const activeProducts = products.filter(p => p.isActive && p.stock > 0);
        if (activeProducts.length === 1) {
          handleAddProduct(activeProducts[0]);
        }
      }
    }
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

            <Box>
              <Input
                ref={searchInputRef}
                placeholder="Escanear código de barras o buscar producto por código o nombre..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                bg={colors.bg}
                borderColor={barcodeError ? "red.500" : isScanning ? colors.gold : colors.border}
                color={colors.text}
                disabled={isScanning}
                autoFocus
              />
              {isScanning && (
                <Text fontSize="xs" color={colors.gold} mt={1}>
                  Buscando producto...
                </Text>
              )}
              {barcodeError && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {barcodeError}
                </Text>
              )}
            </Box>

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
                        ${formatPrice(product.salePrice)} - Stock: {product.stock}
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
                            ${formatPrice(product.salePrice)} c/u
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
                            ${formatPrice(product.salePrice * item.quantity)}
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
                  <Text fontWeight="bold" fontSize="xl" color={colors.gold}>${formatPrice(total)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={colors.subtext}>Ganancia:</Text>
                  <Badge colorScheme="green" fontSize="md">${formatPrice(totalProfit)}</Badge>
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

