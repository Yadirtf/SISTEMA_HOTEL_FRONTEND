"use client";

import { useState, useEffect } from "react";
import { Button, Flex, Icon, Text } from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import { pdf } from "@react-pdf/renderer";
import { ReservationsReportPDF } from "./ReservationsReportPDF";
import { getReservationsForReport } from "@/services/reservations-report";
import { getToken } from "@/lib/session";
import { getSessionUser } from "@/lib/session";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { InlineNotice } from "@/components/common/InlineNotice";
import type { ReservationReportData } from "@/services/reservations-report";

export function GenerateReservationsReportButton() {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationReportData[] | null>(null);
  const [generatedDate, setGeneratedDate] = useState<Date | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  const { colors } = useThemeMode();
  const user = getSessionUser();

  const showNotification = (type: "success" | "error" | "info", title: string, description?: string) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), type === "error" ? 5000 : 3000);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const result = await getReservationsForReport(token || undefined);

      if (!result.success || !result.data) {
        showNotification("error", "Error", result.message || "Error al obtener las reservas");
        return;
      }

      const date = new Date();
      setReservations(result.data);
      setGeneratedDate(date);
    } catch (error) {
      showNotification("error", "Error", "Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const userName = user ? `${user.correo}` : "Usuario";

  // Auto-descargar cuando se generen los datos
  useEffect(() => {
    if (reservations && generatedDate) {
      const generateAndDownload = async () => {
        try {
          const blob = await pdf(
            <ReservationsReportPDF
              reservations={reservations}
              generatedDate={generatedDate}
              generatedBy={userName}
            />
          ).toBlob();

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `reporte-reservas-${generatedDate.toISOString().split("T")[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showNotification("success", "Éxito", "Reporte generado y descargado correctamente");

          // Limpiar estado
          setReservations(null);
          setGeneratedDate(null);
        } catch (error) {
          showNotification("error", "Error", "Error al generar el PDF");
        }
      };

      generateAndDownload();
    }
  }, [reservations, generatedDate, userName]);

  return (
    <>
      {notification && (
        <InlineNotice
          type={notification.type}
          title={notification.title}
          description={notification.description}
          onClose={() => setNotification(null)}
          colors={colors}
        />
      )}
      <Button
        onClick={handleGenerate}
        loading={loading}
        colorScheme="yellow"
        variant="solid"
        size="md"
        bg={colors.gold}
        color="#000000"
        _hover={{ bg: "#b8941f" }}
      >
        <Flex align="center" gap={2}>
          <Icon as={FiDownload} />
          <Text>Generar Reporte PDF</Text>
        </Flex>
      </Button>
    </>
  );
}

