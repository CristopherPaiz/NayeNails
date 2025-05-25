import { useState, useMemo } from "react";
import CRButton from "../../components/UI/CRButton";
import CRModal from "../../components/UI/CRModal";
import CRInput from "../../components/UI/CRInput";
import CRLoader from "../../components/UI/CRLoader";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useApiRequest from "../../hooks/useApiRequest";
import { useQueryClient } from "@tanstack/react-query";
import CategorySubcategorySelector from "../../components/admin/CategorySubcategorySelector";
import CRAlert from "../../components/UI/CRAlert.jsx";

const DiseniosAdminPage = () => {
  const queryClient = useQueryClient();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentDisenio, setCurrentDisenio] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: "",
    descripcion: "",
    imagen_url: "",
    precio: "",
    oferta: "",
    duracion: "",
    subcategorias: [],
  });
  const [errors, setErrors] = useState({});
  const [categorySelectorError, setCategorySelectorError] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", children: null, onConfirm: () => {} });

  const queryKeyDiseniosAdmin = ["diseniosAdmin"];
  const {
    data: disenios,
    isLoading: isLoadingDisenios,
    error: errorDisenios,
    refetch: refetchDisenios,
  } = useApiRequest({
    queryKey: queryKeyDiseniosAdmin,
    url: "/disenios/admin",
    method: "GET",
    notificationEnabled: false,
  });

  const { data: todasLasCategorias, isLoading: isLoadingCategorias } = useApiRequest({
    queryKey: ["categorias"],
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });

  const categoriasPadreOptionsForSelector = useMemo(() => {
    return (
      todasLasCategorias
        ?.filter((cp) => cp.activo)
        .map((cp) => ({
          label: cp.nombre,
          value: cp.id,
          subcategorias: cp.subcategorias?.filter((s) => s.activo).map((s) => ({ label: s.nombre, value: s.id })) ?? [],
        })) ?? []
    );
  }, [todasLasCategorias]);

  const commonMutationOptions = (successMsg) => ({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeyDiseniosAdmin });
      closeFormModal();
      setIsConfirmModalOpen(false); // También cierra el modal de confirmación si estaba abierto
      CRAlert.alert({ title: "Éxito", message: data?.message || successMsg, type: "success" });
    },
    onError: (error) => {
      // El error ya se muestra por useApiRequest si notificationEnabled es true por defecto
      // o podemos manejarlo aquí si queremos ser más específicos.
      setIsConfirmModalOpen(false);
      CRAlert.alert({ title: "Error", message: error.response?.data?.message || "La operación falló.", type: "error" });
    },
  });

  const addDisenioMutation = useApiRequest({
    url: "/disenios",
    method: "POST",
    options: commonMutationOptions("Diseño añadido con éxito."),
    notificationEnabled: false,
  });

  const editDisenioMutation = useApiRequest({
    method: "PUT",
    options: commonMutationOptions("Diseño actualizado con éxito."),
    notificationEnabled: false,
  });

  const toggleActivoDisenioMutation = useApiRequest({
    method: "PATCH",
    options: commonMutationOptions("Estado del diseño actualizado."), // Mensaje genérico, la API devuelve uno más específico
    notificationEnabled: false,
  });

  const deleteDisenioMutation = useApiRequest({
    method: "DELETE",
    options: commonMutationOptions("Diseño eliminado con éxito."),
    notificationEnabled: false,
  });

  const openFormModal = (mode, disenio = null) => {
    setModalMode(mode);
    setCurrentDisenio(disenio);
    setCategorySelectorError(null);
    if (mode === "edit" && disenio) {
      setFormValues({
        nombre: disenio.nombre ?? "",
        descripcion: disenio.descripcion ?? "",
        imagen_url: disenio.imagen_url ?? "",
        precio: disenio.precio?.toString() ?? "",
        oferta: disenio.oferta?.toString() ?? "",
        duracion: disenio.duracion ?? "",
        subcategorias: disenio.subcategorias_ids ?? [],
      });
    } else {
      setFormValues({
        nombre: "",
        descripcion: "",
        imagen_url: "",
        precio: "",
        oferta: "",
        duracion: "",
        subcategorias: [],
      });
    }
    setErrors({});
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentDisenio(null);
    setFormValues({
      nombre: "",
      descripcion: "",
      imagen_url: "",
      precio: "",
      oferta: "",
      duracion: "",
      subcategorias: [],
    });
    setCategorySelectorError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelectorChange = (selectedSubcategoryIds) => {
    setFormValues((prev) => ({ ...prev, subcategorias: selectedSubcategoryIds }));
  };

  const handleCategorySelectorError = (errorMsg) => {
    setCategorySelectorError(errorMsg);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formValues.imagen_url.trim()) newErrors.imagen_url = "La URL de la imagen es obligatoria.";
    else {
      try {
        new URL(formValues.imagen_url);
      } catch (e) {
        console.error(e);
        newErrors.imagen_url = "La URL de la imagen no es válida.";
      }
    }

    if (categorySelectorError) {
      newErrors.subcategoriasGlobal = categorySelectorError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formValues, subcategorias: formValues.subcategorias };

    if (modalMode === "add") {
      await addDisenioMutation.mutateAsync({ data: payload });
    } else {
      await editDisenioMutation.mutateAsync({
        url: `/disenios/${currentDisenio?.id}`,
        data: payload,
      });
    }
  };

  const prepareToggleActivo = (disenio) => {
    const actionText = disenio.activo ? "Deshabilitar" : "Habilitar";
    setConfirmModalProps({
      title: `Confirmar ${actionText}`,
      children: (
        <p>
          ¿Estás seguro de que deseas {actionText.toLowerCase()} el diseño "{disenio.nombre}"?
        </p>
      ),
      onConfirm: async () => {
        await toggleActivoDisenioMutation.mutateAsync({
          url: `/disenios/${disenio.id}/toggle-activo`,
          data: null,
        });
      },
      confirmButtonText: actionText,
      confirmButtonClass: disenio.activo ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
    });
    setIsConfirmModalOpen(true);
  };

  const prepareDeleteDisenio = (disenio) => {
    setConfirmModalProps({
      title: "Confirmar Eliminación",
      children: <p>¿Estás seguro de que deseas eliminar permanentemente el diseño "{disenio.nombre}"? Esta acción no se puede deshacer.</p>,
      onConfirm: async () => {
        await deleteDisenioMutation.mutateAsync({
          url: `/disenios/${disenio.id}`,
        });
      },
      confirmButtonText: "Eliminar",
      confirmButtonClass: "bg-red-600 hover:bg-red-700",
    });
    setIsConfirmModalOpen(true);
  };

  const isMutationLoading =
    addDisenioMutation.isPending || editDisenioMutation.isPending || toggleActivoDisenioMutation.isPending || deleteDisenioMutation.isPending;
  const categorySelectorKey =
    modalMode === "add" ? `new-${Date.now()}` : currentDisenio?.id ? `edit-${currentDisenio.id}` : `edit-fallback-${Date.now()}`;

  if (isLoadingDisenios || isLoadingCategorias) {
    return <CRLoader text="Cargando datos..." fullScreen={false} style="circle" size="lg" />;
  }

  if (errorDisenios) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <DynamicIcon name="AlertTriangle" className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">Error al cargar los diseños: {errorDisenios.message ?? "Error desconocido"}</p>
        <CRButton onClick={() => refetchDisenios()} title="Reintentar" className="mt-4 bg-primary text-white" />
      </div>
    );
  }

  return (
    <div className="sm:px">
      {isMutationLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Diseños</h1>
        <CRButton
          title="Añadir Nuevo Diseño"
          externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
          iconPosition="left"
          onClick={() => openFormModal("add")}
          className="bg-primary text-white hover:bg-opacity-90 text-sm py-2 px-4"
          disabled={isMutationLoading}
        />
      </div>

      {disenios?.length === 0 ? (
        <div className="text-center py-10 bg-background dark:bg-slate-800 rounded-lg shadow">
          <DynamicIcon name="ImageOff" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-xl text-textSecondary dark:text-slate-400">No hay diseños para mostrar.</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Empieza añadiendo un nuevo diseño.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disenios?.map((disenio) => (
            <div
              key={disenio.id}
              className={`rounded-lg shadow-lg overflow-hidden ${
                disenio.activo ? "bg-background dark:bg-slate-800" : "bg-gray-100 dark:bg-slate-700 opacity-70"
              }`}
            >
              <img src={disenio.imagen_url} alt={disenio.nombre} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    disenio.activo ? "text-textPrimary dark:text-white" : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {disenio.nombre}
                </h3>
                {!disenio.activo && <span className="text-xs font-normal text-yellow-600 dark:text-yellow-400">(Inactivo)</span>}
                <p className="text-xs text-textSecondary dark:text-slate-400 mb-1 truncate">{disenio.descripcion}</p>
                <p className="text-sm font-medium text-primary dark:text-primary-light mb-1">
                  {disenio.precio ? `Q${parseFloat(disenio.precio).toFixed(2)}` : "Precio no definido"}
                  {disenio.oferta && <span className="ml-2 text-red-500 dark:text-red-400">Oferta: Q{parseFloat(disenio.oferta).toFixed(2)}</span>}
                </p>
                <p className="text-xs text-textTertiary dark:text-slate-500">Duración: {disenio.duracion || "No especificada"}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2">
                  <CRButton
                    title="Editar"
                    onlyIcon
                    externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
                    onClick={() => openFormModal("edit", disenio)}
                    className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
                    disabled={isMutationLoading}
                  />
                  <CRButton
                    title={disenio.activo ? "Inactivar" : "Activar"}
                    onlyIcon
                    externalIcon={<DynamicIcon name={disenio.activo ? "EyeOff" : "Eye"} className="w-4 h-4" />}
                    onClick={() => prepareToggleActivo(disenio)}
                    className={`text-white !p-1.5 ${disenio.activo ? "!bg-yellow-500 hover:!bg-yellow-600" : "!bg-green-500 hover:!bg-green-600"}`}
                    disabled={isMutationLoading}
                  />
                  <CRButton
                    title="Eliminar"
                    onlyIcon
                    externalIcon={<DynamicIcon name="Trash2" className="w-4 h-4" />}
                    onClick={() => prepareDeleteDisenio(disenio)}
                    className="!bg-red-600 hover:!bg-red-700 text-white !p-1.5"
                    disabled={isMutationLoading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormModalOpen && (
        <CRModal
          isOpen={isFormModalOpen}
          setIsOpen={closeFormModal}
          title={modalMode === "add" ? "Añadir Nuevo Diseño" : "Editar Diseño"}
          width={window.innerWidth < 768 ? 95 : 70}
          height={window.innerWidth < 768 ? 90 : "auto"}
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <CRInput
              title="Nombre del Diseño"
              name="nombre"
              value={formValues.nombre}
              setValue={(val) => handleInputChange({ target: { name: "nombre", value: val } })}
              error={errors.nombre}
              placeholder="Ej: Uñas Galaxia"
              require
            />
            <CRInput
              title="Descripción"
              name="descripcion"
              value={formValues.descripcion}
              setValue={(val) => handleInputChange({ target: { name: "descripcion", value: val } })}
              placeholder="Pequeña descripción del diseño"
            />
            <CRInput
              title="URL de la Imagen"
              name="imagen_url"
              value={formValues.imagen_url}
              setValue={(val) => handleInputChange({ target: { name: "imagen_url", value: val } })}
              error={errors.imagen_url}
              placeholder="https://ejemplo.com/imagen.jpg"
              require
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CRInput
                title="Precio"
                name="precio"
                type="number"
                value={formValues.precio}
                setValue={(val) => handleInputChange({ target: { name: "precio", value: val } })}
                placeholder="Ej: 150"
              />
              <CRInput
                title="Precio de Oferta (opcional)"
                name="oferta"
                type="number"
                value={formValues.oferta}
                setValue={(val) => handleInputChange({ target: { name: "oferta", value: val } })}
                placeholder="Ej: 120"
              />
            </div>
            <CRInput
              title="Duración Estimada"
              name="duracion"
              value={formValues.duracion}
              setValue={(val) => handleInputChange({ target: { name: "duracion", value: val } })}
              placeholder="Ej: 1h 30min"
            />

            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <h4 className="text-base font-semibold text-textPrimary dark:text-gray-200">Selección de Categorías y Subcategorías</h4>
              <CategorySubcategorySelector
                key={categorySelectorKey}
                categoriasPadreOptions={categoriasPadreOptionsForSelector}
                initialSelectedSubcategoryIds={formValues.subcategorias}
                onChange={handleCategorySelectorChange}
                onError={handleCategorySelectorError}
              />
              {errors.subcategoriasGlobal && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.subcategoriasGlobal}</p>}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Subcategorías seleccionadas (IDs): {formValues.subcategorias.length > 0 ? formValues.subcategorias.join(", ") : "Ninguna"}
            </p>

            <div className="flex justify-end space-x-3 pt-3">
              <CRButton
                type="button"
                title="Cancelar"
                onClick={closeFormModal}
                className="bg-gray-300 dark:bg-gray-600 text-textPrimary dark:text-white"
                disabled={isMutationLoading}
              />
              <CRButton
                type="submit"
                title={modalMode === "add" ? "Añadir Diseño" : "Guardar Cambios"}
                className="bg-primary text-white"
                loading={isMutationLoading}
                disabled={isMutationLoading}
              />
            </div>
          </form>
        </CRModal>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isMutationLoading) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        {confirmModalProps.children}
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={(e) => {
              e.stopPropagation();
              if (!isMutationLoading) setIsConfirmModalOpen(false);
            }}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-textPrimary dark:text-white"
            disabled={isMutationLoading}
          />
          <CRButton
            title={confirmModalProps.confirmButtonText || "Confirmar"}
            onClick={async (e) => {
              e.stopPropagation();
              if (isMutationLoading) return;
              await confirmModalProps.onConfirm();
            }}
            className={`${confirmModalProps.confirmButtonClass || "bg-primary hover:bg-primary-dark"} text-white`}
            loading={isMutationLoading} // Considerar un loading específico para la acción de confirmación
            disabled={isMutationLoading}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default DiseniosAdminPage;
