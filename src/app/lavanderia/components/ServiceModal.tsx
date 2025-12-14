"use client";

import { useState, useEffect } from "react";
import { Box, Button, Input, Text, Stack, Flex, Icon, Textarea, IconButton } from "@chakra-ui/react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { getToken } from "@/lib/session";
import { getRoomsWithActiveReservations } from "@/services/laundry-services";
import { getLaundryGarments } from "@/services/laundry-garments";
import { getPaymentMethods, getPaymentTypes } from "@/services/payment-methods";
import type { LaundryServiceFormData, LaundryGarment, LaundryCategory } from "../types";
import type { PaymentMethod, PaymentType } from "@/services/payment-methods";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: LaundryServiceFormData;
  onFormChange: (field: keyof LaundryServiceFormData, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: 'garmentId' | 'quantity', value: any) => void;
  isLoading: boolean;
  garments: LaundryGarment[];
  loadingGarments: boolean;
}

export function ServiceModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  addItem,
  removeItem,
  updateItem,
  isLoading,
  garments,
  loadingGarments,
}: ServiceModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;

  // Estados para habitaciones con reservas activas
  const [roomsWithReservations, setRoomsWithReservations] = useState<Array<{
    room: { _id: string; number: string };
    client: { _id: string; documentNumber: string; firstName: string; lastName: string };
  }>>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ _id: string; documentNumber: string; firstName: string; lastName: string } | null>(null);

  // Estados para métodos y tipos de pago
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loadingPaymentData, setLoadingPaymentData] = useState(false);

  // Cargar habitaciones con reservas activas y métodos de pago al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoadingRooms(true);
        setLoadingPaymentData(true);
        try {
          const [roomsResp, methodsResp, typesResp] = await Promise.all([
            getRoomsWithActiveReservations(token),
            getPaymentMethods(false, token),
            getPaymentTypes(false, token),
          ]);
          
          if (roomsResp.success && roomsResp.data) {
            setRoomsWithReservations(roomsResp.data.map(item => ({
              room: item.room,
              client: item.client,
            })));
          }
          
          if (methodsResp.success && methodsResp.data) {
            setPaymentMethods(methodsResp.data);
          }
          
          if (typesResp.success && typesResp.data) {
            setPaymentTypes(typesResp.data);
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoadingRooms(false);
          setLoadingPaymentData(false);
        }
      };
      loadData();
    }
  }, [isOpen, token]);

  // Auto-seleccionar cliente cuando se selecciona una habitación
  const handleRoomChange = (roomId: string) => {
    onFormChange("roomId", roomId);
    
    // Buscar el cliente asociado a esta habitación
    const roomData = roomsWithReservations.find(item => item.room._id === roomId);
    if (roomData) {
      setSelectedClient(roomData.client);
    } else {
      setSelectedClient(null);
    }
  };

  // Limpiar cliente seleccionado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedClient(null);
    }
  }, [isOpen]);

  // Calcular total estimado
  const calculateEstimatedTotal = () => {
    let total = 0;
    formData.items.forEach(item => {
      if (item.garmentId && item.quantity > 0) {
        const garment = garments.find(g => g._id === item.garmentId);
        if (garment) {
          const category = typeof garment.categoryId === 'object' 
            ? garment.categoryId as LaundryCategory
            : null;
          if (category) {
            total += category.pricePerUnit * item.quantity;
          }
        }
      }
    });
    return total;
  };

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
            {isEditing ? "Editar Servicio" : "Crear Servicio de Lavandería"}
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
              {/* Selección de Habitación */}
              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Habitación <Text as="span" color="red.500">*</Text>
                </Text>
                <select
                  value={formData.roomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  disabled={loadingRooms || isEditing}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    border: `2px solid ${colors.border}`,
                    fontSize: '14px',
                    cursor: (loadingRooms || isEditing) ? 'not-allowed' : 'pointer',
                    opacity: (loadingRooms || isEditing) ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingRooms && !isEditing) {
                      e.currentTarget.style.borderColor = colors.gold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  onFocus={(e) => {
                    if (!loadingRooms && !isEditing) {
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
                    {loadingRooms ? "Cargando..." : "Seleccionar habitación"}
                  </option>
                  {roomsWithReservations.map((item) => (
                    <option
                      key={item.room._id}
                      value={item.room._id}
                      style={{ backgroundColor: colors.surface, color: colors.text }}
                    >
                      Habitación {item.room.number}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <Box mt={2} p={3} bg={colors.bg} borderRadius="md" border="1px solid" borderColor={colors.border}>
                    <Text fontSize="sm" color={colors.subtext} mb={1}>Cliente asociado:</Text>
                    <Text fontWeight="semibold" color={colors.text}>
                      {selectedClient.firstName} {selectedClient.lastName}
                    </Text>
                    <Text fontSize="sm" color={colors.subtext}>
                      {selectedClient.documentNumber}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Prendas */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text color={colors.text} fontWeight="semibold">
                    Prendas <Text as="span" color="red.500">*</Text>
                  </Text>
                  {!isEditing && (
                    <Button
                      onClick={addItem}
                      size="sm"
                      bg={colors.gold}
                      color="white"
                      _hover={{ bg: "#b8941f" }}
                    >
                      <Flex align="center" gap={1}>
                        <Icon as={FiPlus} />
                        <Text>Agregar Prenda</Text>
                      </Flex>
                    </Button>
                  )}
                </Flex>

                {formData.items.length === 0 ? (
                  <Box
                    p={4}
                    bg={colors.bg}
                    borderRadius="md"
                    border="2px dashed"
                    borderColor={colors.border}
                    textAlign="center"
                  >
                    <Text color={colors.subtext}>No hay prendas agregadas</Text>
                  </Box>
                ) : (
                  <Stack gap={3}>
                    {formData.items.map((item, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg={colors.bg}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={colors.border}
                      >
                        <Flex gap={3} align="flex-start">
                          <Box flex={1}>
                            <Text color={colors.text} mb={2} fontSize="sm" fontWeight="semibold">
                              Prenda
                            </Text>
                            <select
                              value={item.garmentId}
                              onChange={(e) => updateItem(index, 'garmentId', e.target.value)}
                              disabled={isEditing || loadingGarments}
                              required
                              style={{
                                width: '100%',
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderRadius: '6px',
                                padding: '8px 12px',
                                border: `2px solid ${colors.border}`,
                                fontSize: '14px',
                                cursor: (isEditing || loadingGarments) ? 'not-allowed' : 'pointer',
                                opacity: (isEditing || loadingGarments) ? 0.6 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!isEditing && !loadingGarments) {
                                  e.currentTarget.style.borderColor = colors.gold;
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = colors.border;
                              }}
                              onFocus={(e) => {
                                if (!isEditing && !loadingGarments) {
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
                                Seleccionar prenda
                              </option>
                              {garments
                                .filter(g => g.isActive)
                                .map((garment) => {
                                  const category = typeof garment.categoryId === 'object' 
                                    ? garment.categoryId as LaundryCategory
                                    : null;
                                  return (
                                    <option
                                      key={garment._id}
                                      value={garment._id}
                                      style={{ backgroundColor: colors.surface, color: colors.text }}
                                    >
                                      {garment.name}
                                      {category ? ` - $${category.pricePerUnit.toLocaleString()}` : ''}
                                    </option>
                                  );
                                })}
                            </select>
                          </Box>
                          <Box w="120px">
                            <Text color={colors.text} mb={2} fontSize="sm" fontWeight="semibold">
                              Cantidad
                            </Text>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              bg={colors.surface}
                              borderColor={colors.border}
                              color={colors.text}
                              _hover={{ borderColor: colors.gold }}
                              _focus={{ borderColor: colors.gold }}
                              min="1"
                              disabled={isEditing}
                              required
                            />
                          </Box>
                          {!isEditing && (
                            <IconButton
                              onClick={() => removeItem(index)}
                              aria-label="Eliminar prenda"
                              variant="ghost"
                              colorScheme="red"
                              color="red.400"
                              _hover={{ bg: "red.50", color: "red.600", transform: "scale(1.1)" }}
                              transition="all 0.2s"
                              mt={7}
                              size="sm"
                            >
                              <Icon as={FiTrash2} />
                            </IconButton>
                          )}
                        </Flex>
                        {item.garmentId && item.quantity > 0 && (() => {
                          const garment = garments.find(g => g._id === item.garmentId);
                          const category = garment && typeof garment.categoryId === 'object' 
                            ? garment.categoryId as LaundryCategory
                            : null;
                          const subtotal = category ? category.pricePerUnit * item.quantity : 0;
                          return subtotal > 0 ? (
                            <Text fontSize="sm" color={colors.gold} mt={2} fontWeight="semibold">
                              Subtotal: ${subtotal.toLocaleString()}
                            </Text>
                          ) : null;
                        })()}
                      </Box>
                    ))}
                  </Stack>
                )}

                {formData.items.length > 0 && (
                  <Box mt={4} p={4} bg={colors.bg} borderRadius="md" border="2px solid" borderColor={colors.gold}>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.text} fontWeight="bold" fontSize="lg">
                        Total Estimado:
                      </Text>
                      <Text color={colors.gold} fontWeight="bold" fontSize="xl">
                        ${calculateEstimatedTotal().toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                )}
              </Box>

              {/* Estado de Pago */}
              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Estado de Pago
                </Text>
                <select
                  value={formData.paymentStatus || 'pending'}
                  onChange={(e) => onFormChange("paymentStatus", e.target.value as 'paid' | 'pending')}
                  style={{
                    width: '100%',
                    backgroundColor: colors.bg,
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
                  <option value="pending" style={{ backgroundColor: colors.surface, color: colors.text }}>
                    Pendiente (Fiado)
                  </option>
                  <option value="paid" style={{ backgroundColor: colors.surface, color: colors.text }}>
                    Pagado
                  </option>
                </select>
              </Box>

              {/* Método de Pago - Solo si está pagado */}
              {formData.paymentStatus === 'paid' && (
                <>
                  <Box>
                    <Text color={colors.text} mb={2} fontWeight="semibold">
                      Método de Pago
                    </Text>
                    <select
                      value={formData.paymentMethodId || ""}
                      onChange={(e) => onFormChange("paymentMethodId", e.target.value)}
                      disabled={loadingPaymentData}
                      style={{
                        width: '100%',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: `2px solid ${colors.border}`,
                        fontSize: '14px',
                        cursor: loadingPaymentData ? 'wait' : 'pointer',
                        opacity: loadingPaymentData ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingPaymentData) {
                          e.currentTarget.style.borderColor = colors.gold;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                      onFocus={(e) => {
                        if (!loadingPaymentData) {
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
                        {loadingPaymentData ? "Cargando..." : "Seleccionar método de pago"}
                      </option>
                      {paymentMethods
                        .filter(method => method.isActive)
                        .map((method) => (
                          <option
                            key={method._id}
                            value={method._id}
                            style={{ backgroundColor: colors.surface, color: colors.text }}
                          >
                            {method.name}
                          </option>
                        ))}
                    </select>
                  </Box>

                  <Box>
                    <Text color={colors.text} mb={2} fontWeight="semibold">
                      Tipo de Pago
                    </Text>
                    <select
                      value={formData.paymentTypeId || ""}
                      onChange={(e) => onFormChange("paymentTypeId", e.target.value)}
                      disabled={loadingPaymentData}
                      style={{
                        width: '100%',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: `2px solid ${colors.border}`,
                        fontSize: '14px',
                        cursor: loadingPaymentData ? 'wait' : 'pointer',
                        opacity: loadingPaymentData ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingPaymentData) {
                          e.currentTarget.style.borderColor = colors.gold;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                      onFocus={(e) => {
                        if (!loadingPaymentData) {
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
                        {loadingPaymentData ? "Cargando..." : "Seleccionar tipo de pago"}
                      </option>
                      {paymentTypes
                        .filter(type => type.isActive)
                        .map((type) => (
                          <option
                            key={type._id}
                            value={type._id}
                            style={{ backgroundColor: colors.surface, color: colors.text }}
                          >
                            {type.name}
                          </option>
                        ))}
                    </select>
                  </Box>
                </>
              )}

              {/* Notas */}
              <Box>
                <Text color={colors.text} mb={2} fontWeight="semibold">
                  Notas
                </Text>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => onFormChange("notes", e.target.value)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  placeholder="Instrucciones especiales o notas sobre el servicio..."
                  rows={3}
                />
              </Box>

              <Flex gap={3} justify="flex-end" pt={2}>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  color={colors.subtext}
                  _hover={{ bg: colors.bg, color: colors.text }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  bg={colors.gold}
                  color="white"
                  _hover={{ bg: "#b8941f" }}
                  loading={isLoading}
                  loadingText={isEditing ? "Actualizando..." : "Creando..."}
                  disabled={formData.items.length === 0}
                >
                  {isEditing ? "Actualizar" : "Crear Servicio"}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

