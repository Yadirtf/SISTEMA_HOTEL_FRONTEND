"use client";

import { useState } from "react";
import { Box, Button, Flex, Text, Spinner, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiPlus, FiEdit, FiCheckCircle, FiXCircle, FiEye } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useLaundryServicesData } from "../hooks/useLaundryServicesData";
import { useLaundryServicesActions } from "../hooks/useLaundryServicesActions";
import { useLaundryGarmentsData } from "../hooks/useLaundryGarmentsData";
import { ServiceModal } from "./ServiceModal";
import { CompleteServiceModal } from "./CompleteServiceModal";
import type { LaundryService } from "../types";

interface ServicesTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function ServicesTab({ showNotification }: ServicesTabProps) {
  const { colors } = useThemeMode();
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { services, loading, loadServices } = useLaundryServicesData(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { garments, loading: loadingGarments } = useLaundryGarmentsData();
  
  const {
    isModalOpen,
    isCompleteModalOpen,
    selectedServiceId,
    isSubmitting,
    formData,
    completeFormData,
    handleFormChange,
    handleCompleteFormChange,
    addItem,
    removeItem,
    updateItem,
    openCreateModal,
    openEditModal,
    openCompleteModal,
    closeModal,
    closeCompleteModal,
    handleSubmit,
    handleComplete,
    handleCancel,
  } = useLaundryServicesActions(showNotification, loadServices);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "yellow", label: "Pendiente" },
      completed: { color: "green", label: "Completado" },
      cancelled: { color: "red", label: "Cancelado" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "gray", label: status };
    return (
      <Badge colorScheme={config.color} fontSize="xs" px={2} py={1} borderRadius="md">
        {config.label}
      </Badge>
    );
  };

  const getClientName = (service: LaundryService): string => {
    if (typeof service.clientId === 'object' && service.clientId) {
      return `${service.clientId.firstName} ${service.clientId.lastName}`;
    }
    return "Cliente no disponible";
  };

  const getClientDocument = (service: LaundryService): string => {
    if (typeof service.clientId === 'object' && service.clientId) {
      return service.clientId.documentNumber;
    }
    return "-";
  };

  const getRoomNumber = (service: LaundryService): string => {
    if (typeof service.roomId === 'object' && service.roomId) {
      return service.roomId.number;
    }
    return "-";
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
          Servicios de Lavandería
        </Text>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
            Todos los estados
          </option>
          <option value="pending" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Pendientes
          </option>
          <option value="completed" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Completados
          </option>
          <option value="cancelled" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Cancelados
          </option>
        </select>
        
        <Button onClick={openCreateModal} bg={colors.gold} color="white" _hover={{ bg: "#b8941f" }} whiteSpace="nowrap">
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Nuevo Servicio</Text>
          </Flex>
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : services.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay servicios registrados</Text>
        </Box>
      ) : (
        <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Número</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Cliente</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Habitación</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Prendas</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Total</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id} style={{ borderBottom: `1px solid ${colors.border}` }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <td style={{ padding: "12px", color: colors.text, fontWeight: "semibold" }}>
                    {service.serviceNumber}
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    <Box>
                      <Text fontWeight="semibold">{getClientName(service)}</Text>
                      <Text fontSize="sm" color={colors.subtext}>
                        {getClientDocument(service)}
                      </Text>
                    </Box>
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    {getRoomNumber(service)}
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    {service.items.length} prenda(s)
                  </td>
                  <td style={{ padding: "12px", color: colors.gold, fontWeight: "bold" }}>
                    ${service.totalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getStatusBadge(service.status)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Flex gap={2}>
                      {service.status === 'pending' && (
                        <>
                          <IconButton
                            onClick={() => openEditModal(service)}
                            aria-label="Editar"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            color={colors.gold}
                            _hover={{ bg: colors.bg }}
                          />
                          <IconButton
                            onClick={() => openCompleteModal(service._id!)}
                            aria-label="Completar"
                            icon={<FiCheckCircle />}
                            size="sm"
                            variant="ghost"
                            color="green.400"
                            _hover={{ bg: colors.bg, color: "green.500" }}
                          />
                          <IconButton
                            onClick={() => handleCancel(service._id!)}
                            aria-label="Cancelar"
                            icon={<FiXCircle />}
                            size="sm"
                            variant="ghost"
                            color="red.400"
                            _hover={{ bg: colors.bg, color: "red.500" }}
                          />
                        </>
                      )}
                      {service.status === 'completed' && (
                        <IconButton
                          onClick={() => {
                            // Ver detalles del servicio completado
                            showNotification("info", "Servicio completado", `Servicio ${service.serviceNumber} fue completado y pagado`);
                          }}
                          aria-label="Ver detalles"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          color={colors.subtext}
                          _hover={{ bg: colors.bg }}
                        />
                      )}
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      <ServiceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isEditing={!!selectedServiceId}
        formData={formData}
        onFormChange={handleFormChange}
        addItem={addItem}
        removeItem={removeItem}
        updateItem={updateItem}
        isLoading={isSubmitting}
        garments={garments.filter(g => g.isActive)}
        loadingGarments={loadingGarments}
      />

      {selectedServiceId && (() => {
        const service = services.find(s => s._id === selectedServiceId);
        return service ? (
          <CompleteServiceModal
            isOpen={isCompleteModalOpen}
            onClose={closeCompleteModal}
            onSubmit={handleComplete}
            formData={completeFormData}
            onFormChange={handleCompleteFormChange}
            isLoading={isSubmitting}
            totalAmount={service.totalAmount}
          />
        ) : null;
      })()}
    </Box>
  );
}

