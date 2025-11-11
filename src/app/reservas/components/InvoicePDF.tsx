import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { BillingDetails } from "../services/billing";

// Registrar fuente si es necesario (opcional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf'
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2 solid #d4af37",
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d4af37",
    marginBottom: 5,
    textAlign: "center",
  },
  hotelSubtitle: {
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  invoiceDate: {
    fontSize: 10,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d4af37",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1 solid #e0e0e0",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontSize: 9,
    color: "#666666",
    width: "40%",
  },
  value: {
    fontSize: 9,
    color: "#333333",
    width: "60%",
    fontWeight: "normal",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottom: "1 solid #d4af37",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e0e0e0",
  },
  tableCol1: {
    width: "40%",
    fontSize: 9,
  },
  tableCol2: {
    width: "15%",
    fontSize: 9,
    textAlign: "center",
  },
  tableCol3: {
    width: "20%",
    fontSize: 9,
    textAlign: "right",
  },
  tableCol4: {
    width: "25%",
    fontSize: 9,
    textAlign: "right",
    fontWeight: "bold",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333333",
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    border: "1 solid #e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 10,
    color: "#333333",
    fontWeight: "normal",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #d4af37",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d4af37",
  },
  statusBadge: {
    backgroundColor: "#28a745",
    color: "#ffffff",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    width: 60,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #e0e0e0",
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
  },
  notes: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1 solid #e0e0e0",
    fontSize: 9,
    color: "#666666",
  },
});

interface InvoicePDFProps {
  billingDetails: BillingDetails;
  invoiceNumber: string;
  invoiceDate: Date;
  status: "paid" | "pending" | "overdue";
  includeProducts?: boolean; // Por defecto true para mantener compatibilidad
}

type InvoiceStatus = "paid" | "pending" | "overdue";

export function InvoicePDF({ billingDetails, invoiceNumber, invoiceDate, status, includeProducts = true }: InvoicePDFProps) {
  const { reservation, pendingSales, pendingSalesTotal, totalToPay, allSales } = billingDetails;
  const guest = typeof reservation.guest === "object" ? reservation.guest : null;
  const room = typeof reservation.room === "object" ? reservation.room : null;
  
  // Usar allSales si está disponible (incluye pendientes y pagadas), sino usar pendingSales
  const salesToShow = allSales && allSales.length > 0 ? allSales : pendingSales;

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "No definida";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Calcular total según si se incluyen productos o no
  let calculatedTotal: number;
  if (includeProducts) {
    // Si hay allSalesTotal (después del checkout), usar roomTotal + allSalesTotal
    // Si no, usar totalToPay (antes del checkout, incluye solo pendientes)
    if (allSalesTotal !== undefined) {
      calculatedTotal = roomTotal + allSalesTotal; // Habitación + todos los productos (pendientes y pagados)
    } else {
      calculatedTotal = totalToPay; // Incluye habitación + productos pendientes
    }
  } else {
    calculatedTotal = roomTotal; // Solo habitación
  }

  const statusText: Record<InvoiceStatus, string> = {
    paid: "PAGADA",
    pending: "PENDIENTE",
    overdue: "VENCIDA",
  };

  const statusColor: Record<InvoiceStatus, string> = {
    paid: "#28a745",
    pending: "#ffc107",
    overdue: "#dc3545",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.hotelName}>HOTEL</Text>
          <Text style={styles.hotelSubtitle}>Sistema de Gestión Hotelera</Text>
          
          <View style={styles.invoiceInfo}>
            <View>
              <Text style={styles.invoiceNumber}>FACTURA #{invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                Fecha de Emisión: {invoiceDate.toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor[status] }]}>
              <Text style={{ color: "#ffffff" }}>{statusText[status]}</Text>
            </View>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
          {guest && (
            <View>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre Completo:</Text>
                <Text style={styles.value}>{guest.firstName} {guest.lastName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Documento de Identidad:</Text>
                <Text style={styles.value}>{guest.documentNumber}</Text>
              </View>
              {guest.phoneNumber && (
                <View style={styles.row}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>{guest.phoneNumber}</Text>
                </View>
              )}
              {guest.email && (
                <View style={styles.row}>
                  <Text style={styles.label}>Correo Electrónico:</Text>
                  <Text style={styles.value}>{guest.email}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Detalles de la Reserva */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLES DE LA RESERVA</Text>
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Número de Habitación:</Text>
              <Text style={styles.value}>{reservation.roomNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de Entrada:</Text>
              <Text style={styles.value}>{formatDate(reservation.checkInTime)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de Salida:</Text>
              <Text style={styles.value}>{formatDate(reservation.checkOutTime)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Número de Noches:</Text>
              <Text style={styles.value}>{nights}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Número de Huéspedes:</Text>
              <Text style={styles.value}>{reservation.numberOfGuests || 1}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLE DE SERVICIOS</Text>
          <View style={styles.table}>
            {/* Encabezado de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol1, styles.headerText]}>Descripción</Text>
              <Text style={[styles.tableCol2, styles.headerText]}>Cantidad</Text>
              <Text style={[styles.tableCol3, styles.headerText]}>Precio Unitario</Text>
              <Text style={[styles.tableCol4, styles.headerText]}>Subtotal</Text>
            </View>

            {/* Fila de habitación */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCol1}>
                Alojamiento - Habitación {reservation.roomNumber} ({nights} {nights === 1 ? "noche" : "noches"})
              </Text>
              <Text style={styles.tableCol2}>{nights}</Text>
              <Text style={styles.tableCol3}>{formatCurrency(reservation.roomPrice || 0)}</Text>
              <Text style={styles.tableCol4}>{formatCurrency(roomTotal)}</Text>
            </View>

            {/* Productos fiados - solo si includeProducts es true */}
            {includeProducts && salesToShow.map((sale) =>
              sale.items.map((item, idx) => (
                <View key={`${sale._id}-${idx}`} style={styles.tableRow}>
                  <Text style={styles.tableCol1}>
                    {item.productName} - {new Date(sale.saleDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.tableCol2}>{item.quantity}</Text>
                  <Text style={styles.tableCol3}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={styles.tableCol4}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))
            )}

            {/* Fila de Total */}
            <View style={[styles.tableRow, { backgroundColor: "#f9f9f9", borderTop: "2 solid #d4af37" }]}>
              <Text style={[styles.tableCol1, { fontWeight: "bold", fontSize: 11 }]}>TOTAL A PAGAR</Text>
              <Text style={styles.tableCol2}></Text>
              <Text style={styles.tableCol3}></Text>
              <Text style={[styles.tableCol4, { fontSize: 12, color: "#d4af37" }]}>{formatCurrency(calculatedTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Notas */}
        {reservation.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Notas:</Text>
            <Text>{reservation.notes}</Text>
          </View>
        )}

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>Esta factura es generada automáticamente por el sistema de gestión hotelera.</Text>
          <Text style={{ marginTop: 5 }}>
            Para consultas, contacte con la administración del hotel.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

