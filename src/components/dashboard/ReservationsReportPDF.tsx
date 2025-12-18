import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReservationReportData } from "@/services/reservations-report";

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
  reportInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  reportDate: {
    fontSize: 10,
    color: "#666666",
  },
  reportUser: {
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
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333333",
  },
  cellText: {
    fontSize: 8,
    color: "#333333",
  },
  colRoom: {
    width: "10%",
  },
  colName: {
    width: "18%",
  },
  colDocument: {
    width: "12%",
  },
  colOrigin: {
    width: "12%",
  },
  colProfession: {
    width: "12%",
  },
  colTime: {
    width: "10%",
  },
  colPhone: {
    width: "12%",
  },
  colGuests: {
    width: "8%",
    textAlign: "center",
  },
  colPayment: {
    width: "6%",
    textAlign: "center",
  },
  statusBadge: {
    backgroundColor: "#28a745",
    color: "#ffffff",
    padding: "2 6",
    borderRadius: 4,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusBadgeUnpaid: {
    backgroundColor: "#ffc107",
    color: "#000000",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #e0e0e0",
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
  },
});

interface ReservationsReportPDFProps {
  reservations: ReservationReportData[];
  generatedDate: Date;
  generatedBy: string;
}

export function ReservationsReportPDF({
  reservations,
  generatedDate,
  generatedBy,
}: ReservationsReportPDFProps) {
  const formatTime = (date: Date | string): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getClientName = (reservation: ReservationReportData): string => {
    const firstName = reservation.guestFirstName || "";
    const lastName = reservation.guestLastName || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  const getPaymentStatus = (isPaid: boolean): string => {
    return isPaid ? "Pagado" : "Pendiente";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.hotelName}>SISTEMA HOTEL</Text>
          <Text style={styles.hotelSubtitle}>Reporte de Reservas Activas</Text>

          <View style={styles.reportInfo}>
            <View>
              <Text style={styles.reportDate}>
                Fecha de Generación: {formatDate(generatedDate)}
              </Text>
              <Text style={styles.reportUser}>
                Generado por: {generatedBy}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabla de Reservas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESERVAS ACTIVAS</Text>
          <View style={styles.table}>
            {/* Encabezado de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colRoom, styles.headerText]}>N° Hab.</Text>
              <Text style={[styles.colName, styles.headerText]}>Nombre Cliente</Text>
              <Text style={[styles.colDocument, styles.headerText]}>N° Documento</Text>
              <Text style={[styles.colOrigin, styles.headerText]}>Lugar</Text>
              <Text style={[styles.colProfession, styles.headerText]}>Profesión</Text>
              <Text style={[styles.colTime, styles.headerText]}>Hora Ingreso</Text>
              <Text style={[styles.colPhone, styles.headerText]}>Teléfono</Text>
              <Text style={[styles.colGuests, styles.headerText]}>Huéspedes</Text>
              <Text style={[styles.colPayment, styles.headerText]}>Pago</Text>
            </View>

            {/* Filas de datos */}
            {reservations.map((reservation) => (
              <View key={reservation._id} style={styles.tableRow}>
                <Text style={[styles.colRoom, styles.cellText]}>
                  {reservation.roomNumber}
                </Text>
                <Text style={[styles.colName, styles.cellText]}>
                  {getClientName(reservation)}
                </Text>
                <Text style={[styles.colDocument, styles.cellText]}>
                  {reservation.documentNumber}
                </Text>
                <Text style={[styles.colOrigin, styles.cellText]}>
                  {reservation.guestOrigin || "N/A"}
                </Text>
                <Text style={[styles.colProfession, styles.cellText]}>
                  {reservation.guestProfession || "N/A"}
                </Text>
                <Text style={[styles.colTime, styles.cellText]}>
                  {formatTime(reservation.checkInTime)}
                </Text>
                <Text style={[styles.colPhone, styles.cellText]}>
                  {reservation.guestPhoneNumber || "N/A"}
                </Text>
                <Text style={[styles.colGuests, styles.cellText]}>
                  {reservation.numberOfGuests || 1}
                </Text>
                <View style={styles.colPayment}>
                  <View
                    style={
                      reservation.isPaid
                        ? styles.statusBadge
                        : [styles.statusBadge, styles.statusBadgeUnpaid]
                    }
                  >
                    <Text
                      style={{
                        color: reservation.isPaid ? "#ffffff" : "#000000",
                      }}
                    >
                      {getPaymentStatus(reservation.isPaid)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>
            Total de reservas activas: {reservations.length}
          </Text>
          <Text style={{ marginTop: 5 }}>
            Este reporte es generado automáticamente por el sistema de gestión hotelera.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

