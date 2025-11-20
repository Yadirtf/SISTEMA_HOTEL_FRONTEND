"use client";

import { Box, Button, Flex, Stack, Text, Input, Textarea, Heading, Icon } from "@chakra-ui/react";
import { formatPrice, formatPriceFromString } from "@/lib/format";
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { searchGuests, Guest } from "@/services/reservations";
import { getToken } from "@/lib/session";
import { getPaymentMethods, getPaymentTypes, PaymentMethod, PaymentType } from "@/services/payment-methods";
import { FiX, FiSearch, FiXCircle, FiCheckCircle } from "react-icons/fi";

export type ReservationFormData = {
  documentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  phoneNumber: string;
  email: string;
  origin: string;
  profession: string;
  checkInTime: string;
  checkOutTime: string;
  numberOfGuests: string;
  specialRequests: string;
  notes: string;
  paymentStatus: "paid" | "pending";
  paymentMethodId?: string;
  paymentTypeId?: string;
};

type ReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  roomNumber: string;
  roomPrice: number;
  roomType?: { guestPricing?: Record<number, number> } | null;
  isLoading?: boolean;
};

export function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  roomNumber,
  roomPrice,
  roomType,
  isLoading = false,
}: ReservationModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [formData, setFormData] = useState<ReservationFormData>({
    documentNumber: "",
    guestFirstName: "",
    guestLastName: "",
    phoneNumber: "",
    email: "",
    origin: "",
    profession: "",
    checkInTime: "",
    checkOutTime: "",
    numberOfGuests: "1",
    specialRequests: "",
    notes: "",
    paymentStatus: "pending",
    paymentMethodId: undefined,
    paymentTypeId: undefined,
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);

  // Estados para el buscador de clientes
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Cargar medios y tipos de pago
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const [methodsResp, typesResp] = await Promise.all([
          getPaymentMethods(false, token),
          getPaymentTypes(false, token),
        ]);
        if (methodsResp.success && methodsResp.data) {
          setPaymentMethods(methodsResp.data);
        }
        if (typesResp.success && typesResp.data) {
          setPaymentTypes(typesResp.data);
        }
      } catch (error) {
        console.error("Error loading payment data:", error);
      }
    };
    if (isOpen) {
      loadPaymentData();
    }
  }, [isOpen, token]);

  // Efecto para buscar clientes con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchGuests(searchQuery, token);
        if (response.success && Array.isArray(response.data)) {
          setSearchResults(response.data);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, token]);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showResults]);

  // Función para seleccionar un cliente y autocompletar
  const handleSelectGuest = (guest: Guest) => {
    setFormData((prev) => ({
      ...prev,
      documentNumber: guest.documentNumber,
      guestFirstName: guest.firstName,
      guestLastName: guest.lastName,
      phoneNumber: guest.phoneNumber,
      email: guest.email || "",
      origin: guest.origin || "",
      profession: guest.profession || "",
    }));
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  // Función para calcular el precio según número de huéspedes
  const calculatePriceForGuests = (guestCount: number): number => {
    const numGuests = parseInt(guestCount.toString()) || 1;
    const guestPricing = roomType?.guestPricing;

    if (guestPricing && numGuests > 0) {
      // Buscar precio exacto
      if (guestPricing[numGuests] !== undefined) {
        return guestPricing[numGuests];
      }
      // Si no hay precio exacto, buscar el precio más cercano (menor o igual)
      const availableGuestCounts = Object.keys(guestPricing)
        .map(Number)
        .filter(count => count <= numGuests)
        .sort((a, b) => b - a);
      
      if (availableGuestCounts.length > 0) {
        return guestPricing[availableGuestCounts[0]];
      }
    }
    
    // Si no hay estructura de precios, usar precio base
    return roomPrice;
  };

  // Calcular precio actual según número de huéspedes
  const currentPricePerNight = calculatePriceForGuests(parseInt(formData.numberOfGuests) || 1);

  // Función para formatear fecha y hora al formato datetime-local
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Autocompletar fecha de entrada con fecha y hora actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        checkInTime: prev.checkInTime || formatDateTimeLocal(now),
      }));
    }
  }, [isOpen]);

  // Limpiar formulario al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        documentNumber: "",
        guestFirstName: "",
        guestLastName: "",
        phoneNumber: "",
        email: "",
        origin: "",
        profession: "",
        checkInTime: "",
        checkOutTime: "",
        numberOfGuests: "1",
        specialRequests: "",
        notes: "",
        paymentStatus: "pending",
        paymentMethodId: undefined,
        paymentTypeId: undefined,
      });
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ReservationFormData, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler especial para fecha de salida que siempre mantiene la hora en 12:00 PM
  const handleCheckOutDateChange = (dateValue: string) => {
    if (!dateValue) {
      handleChange("checkOutTime", "");
      return;
    }
    // Si el usuario selecciona solo la fecha (formato YYYY-MM-DD), agregar hora 12:00
    if (dateValue.length === 10) {
      const dateWithNoon = `${dateValue}T12:00`;
      handleChange("checkOutTime", dateWithNoon);
    } else {
      // Si viene con hora, extraer solo la fecha y forzar hora 12:00
      const datePart = dateValue.split('T')[0];
      const dateWithNoon = `${datePart}T12:00`;
      handleChange("checkOutTime", dateWithNoon);
    }
  };

  // Establecer fecha mínima como hoy
  const today = new Date().toISOString().split("T")[0];

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={colors.border}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
        maxW="600px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <Flex
          justify="space-between"
          align="center"
          p={6}
          borderBottom="2px solid"
          borderColor={colors.border}
          bg={colors.bg}
        >
          <Flex align="center" gap={3}>
            <Heading size="lg" color={colors.gold}>
              Ocupar Habitación #{roomNumber}
            </Heading>
          </Flex>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ bg: colors.surface, color: colors.text }}
            fontSize="xl"
            p={2}
            minW="auto"
            h="auto"
          >
            <Icon as={FiX} />
          </Button>
        </Flex>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack gap={4} p={6}>
            {/* Buscador de clientes */}
            <Box position="relative" ref={searchContainerRef}>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Buscar Cliente Existente
              </Text>
              <Box position="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  bg={colors.bg}
                  borderColor={colors.border}
                  color={colors.text}
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  placeholder="Buscar por documento, nombre o teléfono..."
                  pl={10}
                />
                <Icon
                  as={FiSearch}
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  color={colors.subtext}
                  fontSize="lg"
                  pointerEvents="none"
                />
                {isSearching && (
                  <Box
                    position="absolute"
                    right={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color={colors.subtext}
                    fontSize="sm"
                  >
                    Buscando...
                  </Box>
                )}
              </Box>

              {/* Dropdown de resultados */}
              {showResults && searchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  mt={1}
                  bg={colors.surface}
                  borderWidth="1px"
                  borderColor={colors.border}
                  borderRadius="md"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                  zIndex={1001}
                  maxH="300px"
                  overflowY="auto"
                >
                  <Stack gap={0}>
                    {searchResults.map((guest) => (
                      <Box
                        key={guest._id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: colors.bg }}
                        borderBottomWidth="1px"
                        borderBottomColor={colors.border}
                        onClick={() => handleSelectGuest(guest)}
                      >
                        <Flex justify="space-between" align="center">
                          <Box flex="1">
                            <Text fontWeight="bold" color={colors.text} fontSize="sm">
                              {guest.firstName} {guest.lastName}
                            </Text>
                            <Text fontSize="xs" color={colors.subtext} mt={1}>
                              Doc: {guest.documentNumber} • Tel: {guest.phoneNumber}
                            </Text>
                            {guest.email && (
                              <Text fontSize="xs" color={colors.subtext}>
                                {guest.email}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              {showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  mt={1}
                  bg={colors.surface}
                  borderWidth="1px"
                  borderColor={colors.border}
                  borderRadius="md"
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                  zIndex={1001}
                  p={3}
                >
                  <Text fontSize="sm" color={colors.subtext} textAlign="center">
                    No se encontraron clientes
                  </Text>
                </Box>
              )}
            </Box>

            {/* Separador */}
            <Box
              borderTopWidth="1px"
              borderTopColor={colors.border}
              pt={4}
            >
              <Text
                fontSize="xs"
                color={colors.subtext}
                textAlign="center"
                mb={2}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                O complete los datos manualmente
              </Text>
            </Box>

            {/* Información del huésped */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información del Huésped
              </Text>
              <Stack gap={3}>
                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Número de Documento *
                  </Text>
                  <Input
                    required
                    value={formData.documentNumber}
                    onChange={(e) => handleChange("documentNumber", e.target.value.toUpperCase())}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="CC123456789"
                    maxLength={20}
                  />
                </Box>

                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Nombre *
                    </Text>
                    <Input
                      required
                      value={formData.guestFirstName}
                      onChange={(e) => handleChange("guestFirstName", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Juan"
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Apellido *
                    </Text>
                    <Input
                      required
                      value={formData.guestLastName}
                      onChange={(e) => handleChange("guestLastName", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Pérez"
                    />
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Teléfono *
                  </Text>
                  <Input
                    required
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="+57 300 1234567"
                  />
                </Box>

                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Email
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="correo@ejemplo.com"
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Origen
                    </Text>
                    <Input
                      value={formData.origin}
                      onChange={(e) => handleChange("origin", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Ciudad, País"
                    />
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Profesión
                  </Text>
                  <Input
                    value={formData.profession}
                    onChange={(e) => handleChange("profession", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Ingeniero"
                  />
                </Box>
              </Stack>
            </Box>

            {/* Información de la reserva */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información de la Reserva
              </Text>
              <Stack gap={3}>
                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Fecha de Entrada *
                    </Text>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.checkInTime}
                      onChange={(e) => handleChange("checkInTime", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      min={today}
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Fecha de Salida
                    </Text>
                    <Input
                      type="date"
                      value={formData.checkOutTime ? formData.checkOutTime.split('T')[0] : ""}
                      onChange={(e) => handleCheckOutDateChange(e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      min={formData.checkInTime ? formData.checkInTime.split('T')[0] : today}
                    />
                    {formData.checkOutTime && (
                      <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                        Hora de salida: 12:00 PM
                      </Text>
                    )}
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Número de Huéspedes
                  </Text>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleChange("numberOfGuests", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Estado de Pago
                  </Text>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as "paid" | "pending";
                      handleChange("paymentStatus", newStatus);
                      // Si cambia a "pending", limpiar los campos de pago
                      if (newStatus === "pending") {
                        handleChange("paymentMethodId", undefined);
                        handleChange("paymentTypeId", undefined);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      color: colors.text,
                      fontSize: "14px",
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagó</option>
                  </select>
                </Box>

                {formData.paymentStatus === "paid" && (
                  <>
                    <Box>
                      <Text fontSize="sm" color={colors.subtext} mb={1}>
                        Método de Pago
                      </Text>
                      <select
                        value={formData.paymentMethodId || ""}
                        onChange={(e) => handleChange("paymentMethodId", e.target.value || undefined)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "6px",
                          color: colors.text,
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Seleccionar método de pago</option>
                        {paymentMethods.map((method) => (
                          <option key={method._id} value={method._id}>
                            {method.icon ? `${method.icon} ` : ""}{method.name}
                          </option>
                        ))}
                      </select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" color={colors.subtext} mb={1}>
                        Tipo de Pago
                      </Text>
                      <select
                        value={formData.paymentTypeId || ""}
                        onChange={(e) => handleChange("paymentTypeId", e.target.value || undefined)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: "6px",
                          color: colors.text,
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Seleccionar tipo de pago</option>
                        {paymentTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </>
                )}

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Solicitudes Especiales
                  </Text>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleChange("specialRequests", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Ej: Cama extra, cuna, etc."
                    maxLength={500}
                    rows={3}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Notas
                  </Text>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Notas adicionales..."
                    maxLength={500}
                    rows={3}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Precio */}
            <Box
              bg={colors.bg}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="md" fontWeight="bold" color={colors.text}>
                  Precio por Noche:
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
                  ${formatPrice(currentPricePerNight)}
                </Text>
              </Flex>
              {roomType?.guestPricing && (
                <Text fontSize="xs" color={colors.subtext} textAlign="right">
                  {parseInt(formData.numberOfGuests) || 1} {parseInt(formData.numberOfGuests) === 1 ? 'huésped' : 'huéspedes'}
                  {roomType.guestPricing[parseInt(formData.numberOfGuests) || 1] !== undefined && (
                    <span> • Precio especial</span>
                  )}
                </Text>
              )}
            </Box>

            {/* Botones */}
            <Flex gap={3} justify="flex-end" mt={4}>
              <Button
                type="button"
                variant="outline"
                borderColor={colors.border}
                color={colors.text}
                onClick={onClose}
                _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
                disabled={isLoading}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiXCircle} />
                  <Text>Cancelar</Text>
                </Flex>
              </Button>
              <Button
                type="submit"
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
                disabled={isLoading}
                boxShadow={`0 2px 8px ${colors.gold}50`}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiCheckCircle} />
                  <Text>{isLoading ? "Guardando..." : "Confirmar Reserva"}</Text>
                </Flex>
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}

