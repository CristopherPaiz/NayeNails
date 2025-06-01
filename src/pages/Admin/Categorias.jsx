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
import CustomSwitch from "../../components/UI/CustomSwitch.jsx";
import CRAlert from "../../components/UI/CRAlert.jsx";

const CategoriasPage = () => {
  const queryClient = useQueryClient();
  const [categorias, setCategorias] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("addParent");
  const [currentCategoria, setCurrentCategoria] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", children: null });

  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const isValidReactComponent = (component) => {
    return (
      component &&
      (typeof component === "function" || (typeof component === "object" && component.$$typeof && typeof component.render === "function"))
    );
  };

  const iconOptions = useMemo(() => {
    try {
      const validIcons = [];
      const allKeys = Object.getOwnPropertyNames(LucideIcons);
      const excludeList = ["createLucideIcon", "default", "__esModule", "icons"];

      const iconKeys = allKeys.filter((key) => !excludeList.includes(key) && !key.startsWith("_") && key[0] === key[0].toUpperCase());

      iconKeys.forEach((iconName) => {
        try {
          const IconComponent = LucideIcons[iconName];
          if (isValidReactComponent(IconComponent)) {
            validIcons.push({ label: iconName, value: iconName });
          }
        } catch (error) {
          console.warn(`Error al procesar icono ${iconName}:`, error);
        }
      });
      validIcons.sort((a, b) => a.label.localeCompare(b.label));
      return validIcons;
    } catch (error) {
      console.error("Error al cargar iconos:", error);
      return [];
    }
  }, []);

  const queryKeyCategorias = ["categorias"];

  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    error: errorCategorias,
    refetch: refetchCategorias,
  } = useApiRequest({
    queryKey: queryKeyCategorias,
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });

  useEffect(() => {
    if (categoriasData) {
      setCategorias(categoriasData);
    }
  }, [categoriasData]);

  const commonMutationOptionsForToggle = {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
      setIsConfirmModalOpen(false);
      setIsLoadingAction(false);
      CRAlert.alert({ title: "Éxito", message: data?.message || "Estado actualizado.", type: "success" });
    },
    onError: (error) => {
      setIsConfirmModalOpen(false);
      setIsLoadingAction(false);
      CRAlert.alert({ title: "Error", message: error.response?.data?.message || "No se pudo actualizar el estado.", type: "error" });
    },
  };

  const addCategoriaPadreMutation = useApiRequest({
    url: "/categorias",
    method: "POST",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        closeFormModal();
        setIsLoadingAction(false);
      },
      onError: () => {
        setIsLoadingAction(false);
      },
    },
    successMessage: "Categoría padre creada con éxito.",
  });

  const editCategoriaPadreMutation = useApiRequest({
    method: "PUT",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        closeFormModal();
        setIsLoadingAction(false);
      },
      onError: () => {
        setIsLoadingAction(false);
      },
    },
    successMessage: "Categoría padre actualizada con éxito.",
  });

  const addSubcategoriaMutation = useApiRequest({
    method: "POST",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        closeFormModal();
        setIsLoadingAction(false);
      },
      onError: () => {
        setIsLoadingAction(false);
      },
    },
    successMessage: "Subcategoría creada con éxito.",
  });

  const editSubcategoriaMutation = useApiRequest({
    method: "PUT",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyCategorias });
        closeFormModal();
        setIsLoadingAction(false);
      },
      onError: () => {
        setIsLoadingAction(false);
      },
    },
    successMessage: "Subcategoría actualizada con éxito.",
  });

  const toggleActivoCategoriaPadreMutation = useApiRequest({
    method: "PATCH",
    options: commonMutationOptionsForToggle,
    notificationEnabled: false,
  });

  const toggleActivoSubcategoriaMutation = useApiRequest({
    method: "PATCH",
    options: commonMutationOptionsForToggle,
    notificationEnabled: false,
  });

  const handleToggleParent = (parentId) => {
    setSelectedParentId((prevId) => (prevId === parentId ? null : parentId));
  };

  const openFormModal = (mode, categoriaData = null, parentIdForNewChild = null) => {
    setModalMode(mode);
    if ((mode === "editParent" || mode === "editChild") && categoriaData) {
      setCurrentCategoria(categoriaData);
    } else if (mode === "addChild" && parentIdForNewChild) {
      setCurrentCategoria({ idPadre: parentIdForNewChild });
    } else {
      setCurrentCategoria(null);
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
      } else if (modalMode === "editParent" && currentCategoria) {
        await editCategoriaPadreMutation.mutateAsync({ url: `/categorias/${currentCategoria.id}`, data: formData });
      } else if (modalMode === "addChild" && currentCategoria) {
        await addSubcategoriaMutation.mutateAsync({ url: `/categorias/${currentCategoria.idPadre}/subcategorias`, data: formData });
      } else if (modalMode === "editChild" && currentCategoria) {
        await editSubcategoriaMutation.mutateAsync({ url: `/categorias/subcategorias/${currentCategoria.id}`, data: formData });
      }
    } catch (err) {
      console.error("Error en la mutación del formulario:", err);
      setIsLoadingAction(false);
    }
  };

  const prepareToggleActivo = (itemType, item) => {
    const actionText = item.activo ? "Deshabilitar" : "Habilitar";
    const itemName = item.nombre;
    const typeText = itemType === "parent" ? "categoría padre" : "subcategoría";

    setConfirmModalProps({
      title: `${actionText} ${typeText}`,
      children: (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que deseas {actionText.toLowerCase()} la {typeText} "{itemName}"?
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <CRButton
              title="Cancelar"
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoadingAction && !isAnyMutationLoading) setIsConfirmModalOpen(false);
              }}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-textPrimary dark:text-white"
              disabled={isLoadingAction || isAnyMutationLoading}
            />
            <CRButton
              title={actionText}
              onClick={async (e) => {
                e.stopPropagation();
                if (isLoadingAction || isAnyMutationLoading) return;
                setIsLoadingAction(true);
                try {
                  if (itemType === "parent") {
                    await toggleActivoCategoriaPadreMutation.mutateAsync({
                      url: `/categorias/${item.id}/toggle-activo`,
                      data: null,
                    });
                  } else if (itemType === "child") {
                    await toggleActivoSubcategoriaMutation.mutateAsync({
                      url: `/categorias/subcategorias/${item.id}/toggle-activo`,
                      data: null,
                    });
                  }
                } catch (err) {
                  console.error("Error en la mutación de toggle activo:", err);
                  setIsLoadingAction(false);
                }
              }}
              className={`${item.activo ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
              loading={isLoadingAction}
              disabled={isLoadingAction || isAnyMutationLoading}
            />
          </div>
        </>
      ),
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

  const isAnyMutationLoading =
    addCategoriaPadreMutation.isPending ||
    editCategoriaPadreMutation.isPending ||
    addSubcategoriaMutation.isPending ||
    editSubcategoriaMutation.isPending ||
    toggleActivoCategoriaPadreMutation.isPending ||
    toggleActivoSubcategoriaMutation.isPending;

  return (
    <div className="sm:px">
      {(isLoadingAction || isAnyMutationLoading) && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Categorías</h1>
        <div>
          <CRButton
            title="Añadir Categoría Padre"
            externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => openFormModal("addParent")}
            className="bg-primary text-white hover:bg-opacity-90 text-sm py-2 px-4"
            disabled={isLoadingAction || isAnyMutationLoading}
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
              onEditSubcategoria={(subcat) => openFormModal("editChild", { ...subcat, idPadre: cat.id })}
              onToggleActivoSubcategoria={(subcat) => prepareToggleActivo("child", subcat)}
              disabledActions={isLoadingAction || isAnyMutationLoading}
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
          isLoading={isLoadingAction || isAnyMutationLoading}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isLoadingAction && !isAnyMutationLoading) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        {confirmModalProps.children}
      </ConfirmationModal>
    </div>
  );
};

export default CategoriasPage;
