import { useState, useCallback } from "react";
import { createCompany, updateCompany, deactivateCompany, activateCompany, deleteCompanyPermanent } from "@/services/companies";
import { Company, CompanyFormData } from "../types";

type NotificationType = "success" | "error" | "info";

export function useCompaniesActions(
  token: string | undefined,
  showNotification: (type: NotificationType, title: string, description?: string) => void,
  reloadCompanies: () => Promise<void>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    nit: "",
    address: "",
    contact: "",
    phone: "",
    email: "",
    contractNumber: "",
    notes: "",
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({
      name: "",
      nit: "",
      address: "",
      contact: "",
      phone: "",
      email: "",
      contractNumber: "",
      notes: "",
    });
  }, []);

  const handleFormChange = useCallback((field: keyof CompanyFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const openCreateModal = useCallback(async () => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback(async (company: Company) => {
    setEditingId(company._id);
    setFormData({
      name: company.name || "",
      nit: company.nit || "",
      address: company.address || "",
      contact: company.contact || "",
      phone: company.phone || "",
      email: company.email || "",
      contractNumber: company.contractNumber || "",
      notes: company.notes || "",
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
    if (!formData.name || formData.name.trim() === "") {
      showNotification("error", "Error", "El nombre de la empresa es requerido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.nit || formData.nit.trim() === "") {
      showNotification("error", "Error", "El NIT es requerido");
      setIsSubmitting(false);
      return;
    }

    try {
      const resp = editingId
        ? await updateCompany(editingId, formData, token)
        : await createCompany(formData, token);

      if (resp.success) {
        showNotification(
          "success",
          editingId ? "Empresa actualizada" : "Empresa registrada",
          resp.message || "Operación exitosa"
        );
        closeModal();
        await reloadCompanies();
      } else {
        showNotification("error", "Error", resp.message || "Error al guardar");
      }
    } catch (e: any) {
      console.error("Error al guardar empresa:", e);
      showNotification("error", "Error", e?.message || "Error desconocido al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingId, token, showNotification, closeModal, reloadCompanies]);

  const handleDeactivate = useCallback(async (company: Company) => {
    if (!confirm(`¿Está seguro de que desea desactivar la empresa ${company.name}?`)) {
      return;
    }

    try {
      const resp = await deactivateCompany(company._id, token);
      if (resp.success) {
        showNotification("success", "Empresa desactivada");
        await reloadCompanies();
      } else {
        showNotification("error", "Error", resp.message || "Error al desactivar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al desactivar");
    }
  }, [token, showNotification, reloadCompanies]);

  const handleActivate = useCallback(async (company: Company) => {
    if (!confirm(`¿Está seguro de que desea activar la empresa ${company.name}?`)) {
      return;
    }

    try {
      const resp = await activateCompany(company._id, token);
      if (resp.success) {
        showNotification("success", "Empresa activada");
        await reloadCompanies();
      } else {
        showNotification("error", "Error", resp.message || "Error al activar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido al activar");
    }
  }, [token, showNotification, reloadCompanies]);

  const handleDeletePermanent = useCallback(async (company: Company) => {
    if (!confirm("⚠️ ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE esta empresa? Esta acción NO se puede deshacer.")) {
      return;
    }

    try {
      const resp = await deleteCompanyPermanent(company._id, token);
      if (resp.success) {
        showNotification("success", "Empresa eliminada permanentemente");
        await reloadCompanies();
      } else {
        showNotification("error", "Error", resp.message || "Error al eliminar");
      }
    } catch (e: any) {
      showNotification("error", "Error", e?.message || "Error desconocido");
    }
  }, [token, showNotification, reloadCompanies]);

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
  };
}

