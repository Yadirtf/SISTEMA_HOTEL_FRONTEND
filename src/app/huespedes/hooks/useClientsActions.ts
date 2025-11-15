import { useState, useCallback, useEffect } from "react";
import { createClient, updateClient, deactivateClient, activateClient, deleteClientPermanent } from "@/services/clients";
import { getCompanies } from "@/services/companies";
import { Client, ClientFormData, Company } from "../types";

type NotificationType = "success" | "error" | "info";

export function useClientsActions(
  token: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadClients: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    documentNumber: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    origin: "",
    profession: "",
    notes: "",
    isCompanyClient: false,
    companyId: undefined,
  });

  // Cargar empresas cuando se abre el modal
  useEffect(() => {
    const loadCompanies = async () => {
      if (isModalOpen) {
        setLoadingCompanies(true);
        try {
          const resp = await getCompanies({ status: 'active' }, token);
          if (resp.success && resp.data) {
            setCompanies(resp.data);
          }
        } catch (error) {
          console.error("Error al cargar empresas:", error);
        } finally {
          setLoadingCompanies(false);
        }
      }
    };
    loadCompanies();
  }, [isModalOpen, token]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      documentNumber: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      origin: "",
      profession: "",
      notes: "",
      isCompanyClient: false,
      companyId: undefined,
    });
  }, []);

  const handleFormChange = useCallback((field: keyof ClientFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Si se desactiva isCompanyClient, limpiar companyId
      if (field === "isCompanyClient" && !value) {
        updated.companyId = undefined;
      }
      return updated;
    });
  }, []);

  const openCreateModal = useCallback(async () => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback(async (client: Client) => {
    console.log("openEditModal - Cliente recibido:", {
      _id: client._id,
      _id_type: typeof client._id,
      _id_length: client._id?.length,
      documentNumber: client.documentNumber,
      name: `${client.firstName} ${client.lastName}`
    });
    setEditingId(client._id);
    setFormData({
      documentNumber: client.documentNumber || "",
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      phoneNumber: client.phoneNumber || "",
      email: client.email || "",
      origin: client.origin || "",
      profession: client.profession || "",
      notes: client.notes || "",
      isCompanyClient: client.isCompanyClient || false,
      companyId: client.company?._id || undefined,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    
    // Validaciones básicas
    if (!formData.documentNumber || formData.documentNumber.trim() === "") {
      showNotification("error", "Error", "El número de documento es requerido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.firstName || formData.firstName.trim() === "") {
      showNotification("error", "Error", "El nombre es requerido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.lastName || formData.lastName.trim() === "") {
      showNotification("error", "Error", "El apellido es requerido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      showNotification("error", "Error", "El teléfono es requerido");
      setIsSubmitting(false);
      return;
    }

          // Validar que si es cliente de empresa, tenga companyId
          if (formData.isCompanyClient && !formData.companyId) {
            showNotification("error", "Error", "Debe seleccionar una empresa para clientes de empresa");
            setIsSubmitting(false);
            return;
          }

    try {
      if (editingId) {
        console.log("Actualizando cliente con ID:", editingId);
      }
      const resp = editingId
        ? await updateClient(editingId, formData, token)
        : await createClient(formData, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Huésped actualizado" : "Huésped registrado",
          resp.message || "Operación exitosa"
        );
        closeModal();
        await reloadClients();
      } else {
        showNotification("error", "Error", resp.message || "Error al guardar");
      }
    } catch (e: any) {
      console.error("Error al guardar cliente:", e);
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingId, token, showNotification, closeModal, reloadClients]);

  const handleDeactivate = useCallback(async (client: Client) => {
    if (!confirm(`¿Está seguro de que desea desactivar al huésped ${client.firstName} ${client.lastName}?`)) {
      return;
    }

    try {
      const resp = await deactivateClient(client._id, token);
      if (resp.success) {
        showNotification("success", "Huésped desactivado");
        await reloadClients();
      } else {
        showNotification("error", "Error", resp.message || "Error al desactivar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al desactivar");
    }
  }, [token, showNotification, reloadClients]);

  const handleActivate = useCallback(async (client: Client) => {
    if (!confirm(`¿Está seguro de que desea activar al huésped ${client.firstName} ${client.lastName}?`)) {
      return;
    }

    try {
      const resp = await activateClient(client._id, token);
      if (resp.success) {
        showNotification("success", "Huésped activado");
        await reloadClients();
      } else {
        showNotification("error", "Error", resp.message || "Error al activar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al activar");
    }
  }, [token, showNotification, reloadClients]);

  const handleDeletePermanent = useCallback(async (client: Client) => {
    if (!confirm("⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE este huésped? Esta acción NO se puede deshacer.")) {
      return;
    }

    try {
      const resp = await deleteClientPermanent(client._id, token);
      if (resp.success) {
        showNotification("success", "Huésped eliminado permanentemente");
        await reloadClients();
      } else {
        showNotification("error", "Error", resp.message || "Error al eliminar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  }, [token, showNotification, reloadClients]);

  return {
    isModalOpen,
    editingId,
    isSubmitting,
    formData,
    handleFormChange,
    openCreateModal,
    openEditModal,
    closeModal,
    submit,
    handleDeactivate,
    handleActivate,
    handleDeletePermanent,
    companies,
    loadingCompanies,
  };
}

