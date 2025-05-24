import { useState, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import CategoriaPadreCard from "../Admin/categoriasManage/CategoriaPadreCard.jsx";
import CategoriaFormModal from "../Admin/categoriasManage/CategoriaFormModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal";
import useApiRequest from "../../hooks/useApiRequest.js";
import { useQueryClient } from "@tanstack/react-query";

const CategoriasPage = () => {
  const queryClient = useQueryClient();
  const [categorias, setCategorias] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("addParent");
  const [currentCategoria, setCurrentCategoria] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", message: "", onConfirm: () => {} });

  const [isLoadingAction, setIsLoadingAction] = useState(false); // Para acciones específicas como submit o toggle

  const iconOptions = useMemo(
    () =>
      Object.keys(LucideIcons)
        .filter((name) => /^[A-Z]/.test(name) && !["createLucideIcon", "icons", "createElement", "LucideIcon", "LucideProps"].includes(name))
        .map((name) => ({ label: name, value: name })),
    []
  );

  const queryKeyCategorias = ["/categorias"];

  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    error: errorCategorias,
    refetch: refetchCategorias,
  } = useApiRequest({
    queryKey: queryKeyCategorias,
    url: "/categorias",
    method: "GET",
    notificationEnabled: false, // Las notificaciones de error se manejan abajo
  });

  useEffect(() => {
    if (categoriasData) {
      setCategorias(categoriasData);
    }
  }, [categoriasData]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
      closeFormModal();
      setIsLoadingAction(false);
    },
    onError: () => {
      setIsLoadingAction(false);
      // La notificación de error ya la maneja useApiRequest
    },
  };

  const addCategoriaPadreMutation = useApiRequest({
    url: "/categorias",
    method: "POST",
    options: mutationOptions,
    successMessage: "Categoría padre creada con éxito.",
  });

  const editCategoriaPadreMutation = useApiRequest({
    url: `/categorias/${currentCategoria?.id}`, // URL se actualiza cuando currentCategoria cambia
    method: "PUT",
    options: mutationOptions,
    successMessage: "Categoría padre actualizada con éxito.",
  });

  const addSubcategoriaMutation = useApiRequest({
    url: `/categorias/${currentCategoria?.idPadre}/subcategorias`, // URL se actualiza
    method: "POST",
    options: mutationOptions,
    successMessage: "Subcategoría creada con éxito.",
  });

  const editSubcategoriaMutation = useApiRequest({
    url: `/subcategorias/${currentCategoria?.id}`, // URL se actualiza
    method: "PUT",
    options: mutationOptions,
    successMessage: "Subcategoría actualizada con éxito.",
  });

  const toggleActivoCategoriaPadreMutation = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        setIsConfirmModalOpen(false);
        setIsLoadingAction(false);
        // Notificación ya manejada por el hook
      },
      onError: () => {
        setIsConfirmModalOpen(false);
        setIsLoadingAction(false);
      },
    },
    // successMessage se puede establecer dinámicamente si es necesario
  });

  const toggleActivoSubcategoriaMutation = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        setIsConfirmModalOpen(false);
        setIsLoadingAction(false);
      },
      onError: () => {
        setIsConfirmModalOpen(false);
        setIsLoadingAction(false);
      },
    },
  });

  const handleToggleParent = (parentId) => {
    setSelectedParentId((prevId) => (prevId === parentId ? null : parentId));
  };

  const openFormModal = (mode, categoriaData = null, parentIdForNewChild = null) => {
    setModalMode(mode);
    if ((mode === "editParent" || mode === "editChild") && categoriaData) {
      setCurrentCategoria(categoriaData);
    } else if (mode === "addChild" && parentIdForNewChild) {
      setCurrentCategoria({ idPadre: parentIdForNewChild }); // Solo idPadre para nueva subcategoría
    } else {
      setCurrentCategoria(null); // Para nueva categoría padre
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentCategoria(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsLoadingAction(true);
    try {
      if (modalMode === "addParent") {
        await addCategoriaPadreMutation.mutateAsync(formData);
      } else if (modalMode === "editParent") {
        await editCategoriaPadreMutation.mutateAsync(formData);
      } else if (modalMode === "addChild") {
        // formData ya tiene idPadre del modal, pero la URL de la mutación lo usa del currentCategoria
        await addSubcategoriaMutation.mutateAsync(formData);
      } else if (modalMode === "editChild") {
        await editSubcategoriaMutation.mutateAsync(formData);
      }
    } catch (err) {
      // El error ya es manejado y notificado por useApiRequest
      setIsLoadingAction(false); // Asegurar que se detenga la carga en error
    }
    // onSuccess en las mutaciones se encarga de cerrar modal y setIsLoadingAction(false)
  };

  const prepareToggleActivo = (itemType, item, parentId = null) => {
    const actionText = item.activo ? "inactivar" : "activar";
    const itemName = item.nombre;
    setConfirmModalProps({
      title: `Confirmar ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `¿Estás seguro de que deseas ${actionText} "${itemName}"?`,
      onConfirm: async () => {
        setIsLoadingAction(true);
        try {
          if (itemType === "parent") {
            await toggleActivoCategoriaPadreMutation.mutateAsync(null, {
              url: `/categorias/${item.id}/toggle-activo`, // URL específica para esta mutación
            });
          } else if (itemType === "child") {
            await toggleActivoSubcategoriaMutation.mutateAsync(null, {
              url: `/subcategorias/${item.id}/toggle-activo`, // URL específica
            });
          }
        } catch (err) {
          setIsLoadingAction(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  if (isLoadingCategorias) {
    return <CRLoader text="Cargando categorías..." fullScreen={false} style="circle" size="lg" />;
  }

  if (errorCategorias) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <DynamicIcon name="AlertTriangle" className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">Error al cargar las categorías: {errorCategorias.message ?? "Error desconocido"}</p>
        <CRButton onClick={() => refetchCategorias()} title="Reintentar" className="mt-4 bg-primary text-white" />
      </div>
    );
  }

  return (
    <div className="sm:px">
      {(isLoadingAction ||
        addCategoriaPadreMutation.isPending ||
        editCategoriaPadreMutation.isPending ||
        addSubcategoriaMutation.isPending ||
        editSubcategoriaMutation.isPending ||
        toggleActivoCategoriaPadreMutation.isPending ||
        toggleActivoSubcategoriaMutation.isPending) && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Categorías</h1>
        <div>
          <CRButton
            title="Añadir Categoría Padre"
            externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => openFormModal("addParent")}
            className="bg-primary text-white hover:bg-opacity-90 text-sm py-2 px-4"
          />
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="text-center py-10 bg-background dark:bg-slate-800 rounded-lg shadow">
          <DynamicIcon name="PackageOpen" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-xl text-textSecondary dark:text-slate-400">No hay categorías para mostrar.</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Empieza añadiendo una categoría padre.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categorias.map((cat) => (
            <CategoriaPadreCard
              key={cat.id}
              categoria={cat}
              isExpanded={selectedParentId === cat.id}
              onToggleExpand={() => handleToggleParent(cat.id)}
              onEdit={() => openFormModal("editParent", cat)}
              onToggleActivo={() => prepareToggleActivo("parent", cat)}
              onAddSubcategoria={() => openFormModal("addChild", null, cat.id)}
              onEditSubcategoria={(subcat) => openFormModal("editChild", subcat)}
              onToggleActivoSubcategoria={(subcat) => prepareToggleActivo("child", subcat, cat.id)}
            />
          ))}
        </div>
      )}

      {isFormModalOpen && (
        <CategoriaFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          mode={modalMode}
          categoriaToEdit={currentCategoria}
          iconOptions={iconOptions}
          isLoading={isLoadingAction}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isLoadingAction) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        <p>{confirmModalProps.message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={() => {
              if (!isLoadingAction) setIsConfirmModalOpen(false);
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoadingAction}
          />
          <CRButton
            title="Confirmar"
            onClick={confirmModalProps.onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white"
            loading={isLoadingAction}
            disabled={isLoadingAction}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CategoriasPage;
