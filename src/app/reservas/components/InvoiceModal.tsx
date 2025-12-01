"use client";

import { Box, Button, Flex, Stack, Text, Heading, Badge, Icon } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import type { BillingDetails as BillingDetailsType } from "../services/billing";
import { useState, useMemo } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDF } from "./InvoicePDF";
import { FiX, FiDownload, FiEye, FiFileText } from "react-icons/fi";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingDetails: BillingDetailsType | null;
}

// Función para generar ID de factura único
function generateInvoiceNumber(reservationId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const shortId = reservationId.slice(-6).toUpperCase();
  return `INV-${year}${month}${day}-${shortId}`;
}

export function InvoiceModal({ isOpen, onClose, billingDetails }: InvoiceModalProps) {
  const { colors } = useThemeMode();
  const [viewMode, setViewMode] = useState<"preview" | "pdf">("preview");
  const [includeProducts, setIncludeProducts] = useState(true); // Por defecto incluir productos
  const [includeLaundryServices, setIncludeLaundryServices] = useState(true); // Por defecto incluir servicios de lavandería
  const [includeAdditionalCharges, setIncludeAdditionalCharges] = useState(true); // Por defecto incluir cargos adicionales
  const invoiceDate = useMemo(() => new Date(), []);
  const invoiceNumber = useMemo(() => {
    if (!billingDetails) return "";
    return generateInvoiceNumber(billingDetails.reservation._id, invoiceDate);
  }, [billingDetails, invoiceDate]);

  // Determinar estado de la factura - debe estar antes del return condicional
  const invoiceStatus = useMemo(() => {
    if (!billingDetails) return "pending";
    const { reservation, pendingSales, pendingLaundryServices = [] } = billingDetails;
    
    // Si la reserva está pagada y no hay ventas ni servicios de lavandería pendientes, está pagada
    if (reservation.isPaid && pendingSales.length === 0 && pendingLaundryServices.length === 0) return "paid";
    
    // Si la reserva tiene estado checked_out y está pagada, está pagada
    if (reservation.status === "checked_out" && reservation.isPaid && pendingSales.length === 0 && pendingLaundryServices.length === 0) return "paid";
    
    // Si tiene fecha de salida y ya pasó, está vencida (solo si no está pagada)
    if (reservation.checkOutTime && new Date(reservation.checkOutTime) < new Date() && !reservation.isPaid) {
      return "overdue";
    }
    
    return "pending";
  }, [billingDetails]);

  // Calcular total según si se incluyen productos, servicios de lavandería y cargos adicionales - debe estar antes del return condicional
  const calculatedTotal = useMemo(() => {
    if (!billingDetails) return 0;
    const { 
      reservation, 
      totalToPay, 
      allSalesTotal, 
      pendingSalesTotal, 
      additionalCharges,
      allLaundryServicesTotal = 0,
      pendingLaundryServicesTotal = 0,
    } = billingDetails;
    
    // Calcular noches
    const calculateNights = (): number => {
      if (!reservation.checkOutTime) return 0;
      const checkIn = new Date(reservation.checkInTime);
      const checkOut = new Date(reservation.checkOutTime);
      const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    };
    
    const nights = calculateNights();
    const roomTotal = (reservation.roomPrice || 0) * nights;
    const additionalChargesValue = additionalCharges ?? 0;
    
    let baseTotal = roomTotal;
    
    if (includeProducts) {
      // Si hay allSalesTotal (después del checkout), usar roomTotal + allSalesTotal
      // Si no, calcular con productos pendientes
      if (allSalesTotal !== undefined) {
        baseTotal = roomTotal + allSalesTotal; // Habitación + todos los productos (pendientes y pagados)
      } else {
        // Antes del checkout: totalToPay incluye habitación + productos pendientes + cargos adicionales
        // Necesitamos restar los cargos adicionales si no se incluyen
        baseTotal = roomTotal + pendingSalesTotal;
      }
    }
    
    // Agregar servicios de lavandería si están incluidos (independiente de productos)
    if (includeLaundryServices) {
      if (allLaundryServicesTotal > 0) {
        baseTotal += allLaundryServicesTotal; // Todos los servicios de lavandería (pendientes y pagados)
      } else if (pendingLaundryServicesTotal > 0) {
        baseTotal += pendingLaundryServicesTotal; // Solo servicios de lavandería pendientes
      }
    }
    
    // Agregar cargos adicionales si están incluidos
    if (includeAdditionalCharges) {
      return baseTotal + additionalChargesValue;
    } else {
      return baseTotal;
    }
  }, [billingDetails, includeProducts, includeLaundryServices, includeAdditionalCharges]);

  // Memorizar las props del documento PDF para evitar problemas con PDFDownloadLink - debe estar antes del return condicional
  const pdfProps = useMemo(() => {
    if (!billingDetails) return null;
    return {
      billingDetails,
      invoiceNumber,
      invoiceDate,
      status: invoiceStatus,
      includeProducts,
      includeLaundryServices,
      includeAdditionalCharges,
    };
  }, [billingDetails, invoiceNumber, invoiceDate, invoiceStatus, includeProducts, includeLaundryServices, includeAdditionalCharges]);

  if (!isOpen || !billingDetails) return null;

  const { 
    reservation, 
    pendingSales, 
    pendingSalesTotal, 
    totalToPay, 
    allSales, 
    allSalesTotal, 
    additionalCharges,
    pendingLaundryServices = [],
    pendingLaundryServicesTotal = 0,
    allLaundryServices = [],
    allLaundryServicesTotal = 0,
  } = billingDetails;
  
  // Usar allSales si está disponible (incluye pendientes y pagadas), sino usar pendingSales
  const salesToShow = allSales && allSales.length > 0 ? allSales : pendingSales;
  const guest = typeof reservation.guest === "object" ? reservation.guest : null;
  const room = typeof reservation.room === "object" ? reservation.room : null;

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "No definida";
    const d = new Date(date);
    return d.toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Formato de 12 horas con AM/PM
    });
  };

  // Calcular noches
  const calculateNights = (): number => {
    if (!reservation.checkOutTime) return 0;
    const checkIn = new Date(reservation.checkInTime);
    const checkOut = new Date(reservation.checkOutTime);
    const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const roomTotal = (reservation.roomPrice || 0) * nights;

  const statusConfig = {
    paid: { text: "PAGADA", color: "green", bg: "#28a745" },
    pending: { text: "PENDIENTE", color: "orange", bg: "#ffc107" },
    overdue: { text: "VENCIDA", color: "red", bg: "#dc3545" },
  };

  const status = statusConfig[invoiceStatus];

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
        maxW="1200px"
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
          <Box>
            <Heading size="lg" color={colors.gold} mb={2}>
              Factura Profesional
            </Heading>
            <Text fontSize="sm" color={colors.subtext}>
              {invoiceNumber}
            </Text>
          </Box>
          <Flex gap={3} align="center">
            <Badge
              bg={status.bg}
              color="white"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="bold"
            >
              {status.text}
            </Badge>
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
        </Flex>

        {/* Controles de vista y personalización */}
        <Flex gap={2} p={4} borderBottom="1px solid" borderColor={colors.border} bg={colors.bg} flexWrap="wrap" align="center">
          <Flex gap={2} flex="1" minW="200px">
            <Button
              size="sm"
              variant={viewMode === "preview" ? "solid" : "outline"}
              bg={viewMode === "preview" ? colors.gold : "transparent"}
              color={viewMode === "preview" ? colors.bg : colors.text}
              borderColor={colors.border}
              onClick={() => setViewMode("preview")}
            >
              <Flex align="center" gap={2}>
                <Icon as={FiEye} />
                <Text>Vista Previa</Text>
              </Flex>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "pdf" ? "solid" : "outline"}
              bg={viewMode === "pdf" ? colors.gold : "transparent"}
              color={viewMode === "pdf" ? colors.bg : colors.text}
              borderColor={colors.border}
              onClick={() => setViewMode("pdf")}
            >
              <Flex align="center" gap={2}>
                <Icon as={FiFileText} />
                <Text>Vista PDF</Text>
              </Flex>
            </Button>
          </Flex>
          {/* Mostrar checkbox si hay productos (pendientes o pagados) */}
          {salesToShow.length > 0 && (
            <Flex gap={2} align="center">
              <input
                type="checkbox"
                checked={includeProducts}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeProducts(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: colors.gold,
                }}
              />
              <Text fontSize="sm" color={colors.text}>
                Incluir productos fiados
              </Text>
            </Flex>
          )}
          {/* Mostrar checkbox si hay servicios de lavandería (pendientes o pagados) */}
          {(allLaundryServices.length > 0 || pendingLaundryServices.length > 0) && (
            <Flex gap={2} align="center">
              <input
                type="checkbox"
                checked={includeLaundryServices}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeLaundryServices(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: colors.gold,
                }}
              />
              <Text fontSize="sm" color={colors.text}>
                Incluir servicios de lavandería
              </Text>
            </Flex>
          )}
          {/* Mostrar checkbox si hay cargos adicionales */}
          {(additionalCharges ?? 0) > 0 && (
            <Flex gap={2} align="center">
              <input
                type="checkbox"
                checked={includeAdditionalCharges}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeAdditionalCharges(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: colors.gold,
                }}
              />
              <Text fontSize="sm" color={colors.text}>
                Incluir cargos adicionales
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Contenido */}
        {viewMode === "preview" ? (
          <Stack gap={6} p={6}>
            {/* Encabezado de factura */}
            <Box textAlign="center" pb={4} borderBottom="2px solid" borderColor={colors.gold}>
              <Text fontSize="3xl" fontWeight="bold" color={colors.gold} mb={2}>
                HOTEL
              </Text>
              <Text fontSize="sm" color={colors.subtext} mb={4}>
                Sistema de Gestión Hotelera
              </Text>
              <Flex justify="space-between" align="center" mt={4}>
                <Box textAlign="left">
                  <Text fontSize="lg" fontWeight="bold" color={colors.text}>
                    FACTURA #{invoiceNumber}
                  </Text>
                  <Text fontSize="sm" color={colors.subtext}>
                    Fecha de Emisión: {invoiceDate.toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </Box>
                <Badge
                  bg={status.bg}
                  color="white"
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="md"
                  fontWeight="bold"
                >
                  {status.text}
                </Badge>
              </Flex>
            </Box>

            {/* Información del Cliente */}
            <Box>
              <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3} textTransform="uppercase">
                Información del Cliente
              </Text>
              {guest && (
                <Box
                  bg={colors.bg}
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={colors.border}
                >
                  <Stack gap={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color={colors.subtext}>Nombre Completo:</Text>
                      <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                        {guest.firstName} {guest.lastName}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color={colors.subtext}>Documento de Identidad:</Text>
                      <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                        {guest.documentNumber}
                      </Text>
                    </Flex>
                    {guest.phoneNumber && (
                      <Flex justify="space-between">
                        <Text fontSize="sm" color={colors.subtext}>Teléfono:</Text>
                        <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                          {guest.phoneNumber}
                        </Text>
                      </Flex>
                    )}
                    {guest.email && (
                      <Flex justify="space-between">
                        <Text fontSize="sm" color={colors.subtext}>Correo Electrónico:</Text>
                        <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                          {guest.email}
                        </Text>
                      </Flex>
                    )}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Detalles de la Reserva */}
            <Box>
              <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3} textTransform="uppercase">
                Detalles de la Reserva
              </Text>
              <Box
                bg={colors.bg}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colors.border}
              >
                <Stack gap={2}>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Número de Habitación:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {reservation.roomNumber}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Fecha de Entrada:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {formatDate(reservation.checkInTime)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Fecha de Salida:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {formatDate(reservation.checkOutTime)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Número de Noches:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {nights}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color={colors.subtext}>Número de Huéspedes:</Text>
                    <Text fontSize="sm" color={colors.text} fontWeight="semibold">
                      {reservation.numberOfGuests || 1}
                    </Text>
                  </Flex>
                </Stack>
              </Box>
            </Box>

            {/* Tabla de Servicios */}
            <Box>
              <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={3} textTransform="uppercase">
                Detalle de Servicios
              </Text>
              <Box
                bg={colors.bg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colors.border}
                overflow="hidden"
              >
                <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
                  <Box as="thead" bg={colors.gold}>
                    <Box as="tr">
                      <Box as="th" p={3} textAlign="left" color={colors.bg} fontSize="xs" fontWeight="bold" textTransform="uppercase">
                        Descripción
                      </Box>
                      <Box as="th" p={3} textAlign="center" color={colors.bg} fontSize="xs" fontWeight="bold" textTransform="uppercase">
                        Cantidad
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={colors.bg} fontSize="xs" fontWeight="bold" textTransform="uppercase">
                        Precio Unitario
                      </Box>
                      <Box as="th" p={3} textAlign="right" color={colors.bg} fontSize="xs" fontWeight="bold" textTransform="uppercase">
                        Subtotal
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {/* Fila de habitación */}
                    <Box as="tr" borderBottom="1px solid" borderColor={colors.border}>
                      <Box as="td" p={3} fontSize="sm" color={colors.text}>
                        Alojamiento - Habitación {reservation.roomNumber} ({nights} {nights === 1 ? "noche" : "noches"})
                      </Box>
                      <Box as="td" p={3} textAlign="center" fontSize="sm" color={colors.text}>
                        {nights}
                      </Box>
                      <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.text}>
                        ${formatPrice(reservation.roomPrice || 0)}
                      </Box>
                      <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.gold} fontWeight="bold">
                        ${formatPrice(roomTotal)}
                      </Box>
                    </Box>
                    {/* Productos fiados - solo si includeProducts es true */}
                    {includeProducts && salesToShow.map((sale) =>
                      sale.items.map((item, idx) => (
                        <Box
                          key={`${sale._id}-${idx}`}
                          as="tr"
                          borderBottom="1px solid"
                          borderColor={colors.border}
                        >
                          <Box as="td" p={3} fontSize="sm" color={colors.text}>
                            {item.productName} - {new Date(sale.saleDate).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </Box>
                          <Box as="td" p={3} textAlign="center" fontSize="sm" color={colors.text}>
                            {item.quantity}
                          </Box>
                          <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.text}>
                            ${formatPrice(item.unitPrice)}
                          </Box>
                          <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.gold} fontWeight="bold">
                            ${formatPrice(item.subtotal)}
                          </Box>
                        </Box>
                      ))
                    )}
                    {/* Servicios de lavandería - solo si includeLaundryServices es true */}
                    {includeLaundryServices && (allLaundryServices.length > 0 || pendingLaundryServices.length > 0) && (
                      <>
                        {(allLaundryServices.length > 0 ? allLaundryServices : pendingLaundryServices).map((service) =>
                          service.items.map((item, idx) => {
                            const garment = typeof item.garmentId === "object" ? item.garmentId : null;
                            const garmentName = garment ? garment.name : `Prenda ${idx + 1}`;
                            return (
                              <Box
                                key={`${service._id}-${idx}`}
                                as="tr"
                                borderBottom="1px solid"
                                borderColor={colors.border}
                              >
                                <Box as="td" p={3} fontSize="sm" color={colors.text}>
                                  {garmentName} - {service.serviceNumber} {service.createdAt ? new Date(service.createdAt).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }) : ""}
                                </Box>
                                <Box as="td" p={3} textAlign="center" fontSize="sm" color={colors.text}>
                                  {item.quantity}
                                </Box>
                                <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.text}>
                                  ${formatPrice(item.unitPrice)}
                                </Box>
                                <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.gold} fontWeight="bold">
                                  ${formatPrice(item.subtotal)}
                                </Box>
                              </Box>
                            );
                          })
                        )}
                      </>
                    )}
                    {/* Cargos adicionales - solo si includeAdditionalCharges es true */}
                    {includeAdditionalCharges && (additionalCharges ?? 0) > 0 && (
                      <Box
                        as="tr"
                        borderBottom="1px solid"
                        borderColor={colors.border}
                      >
                        <Box as="td" p={3} fontSize="sm" color={colors.text}>
                          Cargos Adicionales
                        </Box>
                        <Box as="td" p={3} textAlign="center" fontSize="sm" color={colors.text}>
                          1
                        </Box>
                        <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.text}>
                          ${formatPrice(additionalCharges ?? 0)}
                        </Box>
                        <Box as="td" p={3} textAlign="right" fontSize="sm" color={colors.gold} fontWeight="bold">
                          ${formatPrice(additionalCharges ?? 0)}
                        </Box>
                      </Box>
                    )}
                    {/* Fila de Total */}
                    <Box
                      as="tr"
                      bg={colors.bg}
                      borderTop="2px solid"
                      borderColor={colors.gold}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "16px",
                          color: colors.text,
                          fontWeight: "bold",
                        }}
                        colSpan={3}
                      >
                        TOTAL A PAGAR
                      </td>
                      <Box as="td" p={3} textAlign="right" fontSize="lg" color={colors.gold} fontWeight="bold">
                        ${formatPrice(calculatedTotal)}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Notas */}
            {reservation.notes && (
              <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
                <Text fontSize="sm" fontWeight="bold" color={colors.gold} mb={2}>
                  Notas:
                </Text>
                <Text fontSize="sm" color={colors.text}>
                  {reservation.notes}
                </Text>
              </Box>
            )}
          </Stack>
        ) : pdfProps ? (
          <Box p={4} h="calc(90vh - 200px)" minH="600px" position="relative">
            <PDFViewer width="100%" height="100%">
              <InvoicePDF 
                billingDetails={pdfProps.billingDetails}
                invoiceNumber={pdfProps.invoiceNumber}
                invoiceDate={pdfProps.invoiceDate}
                status={pdfProps.status}
                includeProducts={pdfProps.includeProducts}
                includeLaundryServices={pdfProps.includeLaundryServices}
                includeAdditionalCharges={pdfProps.includeAdditionalCharges}
              />
            </PDFViewer>
          </Box>
        ) : (
          <Box p={4} h="calc(90vh - 200px)" minH="600px" position="relative" display="flex" alignItems="center" justifyContent="center">
            <Text color={colors.subtext}>Cargando vista previa...</Text>
          </Box>
        )}

        {/* Botones */}
        <Flex gap={3} justify="flex-end" p={6} borderTop="2px solid" borderColor={colors.border} bg={colors.bg}>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ bg: colors.surface, color: colors.text }}
          >
            <Flex align="center" gap={2}>
              <Icon as={FiX} />
              <Text>Cerrar</Text>
            </Flex>
          </Button>
          {billingDetails && pdfProps && (
            <PDFDownloadLink
              key={`${invoiceNumber}-${includeProducts ? '1' : '0'}-${includeLaundryServices ? '1' : '0'}-${includeAdditionalCharges ? '1' : '0'}`}
              document={<InvoicePDF {...pdfProps} />}
              fileName={`Factura-${invoiceNumber}${!includeProducts ? '-SoloAlojamiento' : ''}${!includeLaundryServices ? '-SinLavanderia' : ''}${!includeAdditionalCharges ? '-SinCargosAdicionales' : ''}.pdf`}
            >
            {({ loading }) => (
              <Button
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                _hover={{ bg: "#b8941f" }}
                disabled={loading}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiDownload} />
                  <Text>{loading ? "Generando PDF..." : "Descargar PDF"}</Text>
                </Flex>
              </Button>
            )}
          </PDFDownloadLink>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
