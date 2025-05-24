import React, { useState, useMemo } from "react";
import CRButton from "../../components/UI/CRButton";
import CRModal from "../../components/UI/CRModal";
import CRInput from "../../components/UI/CRInput";
import CRSelect from "../../components/UI/CRSelect";
import CRLoader from "../../components/UI/CRLoader";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useApiRequest from "../../hooks/useApiRequest";
import { useQueryClient } from "@tanstack/react-query";

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
    subcategorias: [], // Array de IDs de subcategorías
  });
  const [errors, setErrors] = useState({});

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", message: "", onConfirm: () => {} });

  const [selectedCategoriaParaSub, setSelectedCategoriaParaSub] = useState(null);

  const queryKeyDiseniosAdmin = ["diseniosAdmin"]; // Cambiado para evitar conflicto con queryKey de exploración
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

  const { data: categoriasPadreData, isLoading: isLoadingCategoriasPadre } = useApiRequest({
    queryKey: ["categorias"], // Reutiliza la query key de categorías
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });

  const categoriasPadreOptions = useMemo(() => {
    return (
      categoriasPadreData
        ?.filter((cp) => cp.activo)
        .map((cp) => ({
          label: cp.nombre,
          value: cp.id, // ID de la Categoría Padre
          subcategorias: cp.subcategorias?.filter((s) => s.activo).map((s) => ({ label: s.nombre, value: s.id })) ?? [], // IDs de Subcategorías
        })) ?? []
    );
  }, [categoriasPadreData]);

  const subcategoriasOptionsDeCategoriaSeleccionada = useMemo(() => {
    if (!selectedCategoriaParaSub) return [];
    const catPadre = categoriasPadreOptions.find((cp) => cp.value === selectedCategoriaParaSub.value);
    return catPadre?.subcategorias ?? [];
  }, [selectedCategoriaParaSub, categoriasPadreOptions]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyDiseniosAdmin });
      closeFormModal();
    },
  };

  const addDisenioMutation = useApiRequest({
    url: "/disenios",
    method: "POST",
    options: mutationOptions,
    successMessage: "Diseño añadido con éxito.",
  });

  const editDisenioMutation = useApiRequest({
    method: "PUT",
    options: mutationOptions,
    successMessage: "Diseño actualizado con éxito.",
  });

  const toggleActivoDisenioMutation = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeyDiseniosAdmin });
        setIsConfirmModalOpen(false);
      },
    },
  });

  const openFormModal = (mode, disenio = null) => {
    setModalMode(mode);
    setCurrentDisenio(disenio);
    if (mode === "edit" && disenio) {
      setFormValues({
        nombre: disenio.nombre ?? "",
        descripcion: disenio.descripcion ?? "",
        imagen_url: disenio.imagen_url ?? "",
        precio: disenio.precio ?? "",
        oferta: disenio.oferta ?? "",
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
    setSelectedCategoriaParaSub(null);
    setErrors({});
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentDisenio(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubcategoriasChange = (selectedOptionsDeCategoriaActual) => {
    // selectedOptionsDeCategoriaActual es un array de objetos { label, value } del CRSelect actual
    const currentSubIdsFromSelectedCategory = selectedOptionsDeCategoriaActual.map((opt) => opt.value);

    // Mantener las subcategorías de OTRAS categorías padre que ya estaban seleccionadas
    const otherCategorySubIds = formValues.subcategorias.filter(
      (id) => !subcategoriasOptionsDeCategoriaSeleccionada.some((subOpt) => subOpt.value === id)
    );

    setFormValues((prev) => ({
      ...prev,
      subcategorias: [...otherCategorySubIds, ...currentSubIdsFromSelectedCategory],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formValues.imagen_url.trim()) newErrors.imagen_url = "La URL de la imagen es obligatoria.";
    else {
      try {
        new URL(formValues.imagen_url);
      } catch (e) {
        console.log(e);
        newErrors.imagen_url = "La URL de la imagen no es válida.";
      }
    }
    if (formValues.subcategorias.length === 0) {
      newErrors.subcategoriasGlobal = "Debe seleccionar al menos una subcategoría en total.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formValues }; // formValues.subcategorias ya es un array de IDs

    if (modalMode === "add") {
      await addDisenioMutation.mutateAsync(payload);
    } else {
      await editDisenioMutation.mutateAsync(payload, {
        url: `/disenios/${currentDisenio?.id}`,
      });
    }
  };

  const prepareToggleActivo = (disenio) => {
    const actionText = disenio.activo ? "inactivar" : "activar";
    setConfirmModalProps({
      title: `Confirmar ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `¿Estás seguro de que deseas ${actionText} el diseño "${disenio.nombre}"?`,
      onConfirm: async () => {
        await toggleActivoDisenioMutation.mutateAsync(null, {
          url: `/disenios/${disenio.id}/toggle-activo`,
        });
      },
    });
    setIsConfirmModalOpen(true);
  };

  const isMutationLoading = addDisenioMutation.isPending || editDisenioMutation.isPending || toggleActivoDisenioMutation.isPending;

  if (isLoadingDisenios || isLoadingCategoriasPadre) {
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
                  {disenio.precio}
                  {disenio.oferta && <span className="ml-2 text-red-500 dark:text-red-400">Oferta: {disenio.oferta}</span>}
                </p>
                <p className="text-xs text-textTertiary dark:text-slate-500">Duración: {disenio.duracion}</p>
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
                    className={`text-white !p-1.5 ${disenio.activo ? "!bg-red-500 hover:!bg-red-600" : "!bg-green-500 hover:!bg-green-600"}`}
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
          width={window.innerWidth < 768 ? 90 : 50}
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <CRInput
              title="Nombre del Diseño"
              name="nombre"
              value={formValues.nombre}
              onChange={handleInputChange}
              error={errors.nombre}
              placeholder="Ej: Uñas Galaxia"
              require
            />
            <CRInput
              title="Descripción"
              name="descripcion"
              value={formValues.descripcion}
              onChange={handleInputChange}
              placeholder="Pequeña descripción del diseño"
            />
            <CRInput
              title="URL de la Imagen"
              name="imagen_url"
              value={formValues.imagen_url}
              onChange={handleInputChange}
              error={errors.imagen_url}
              placeholder="https://ejemplo.com/imagen.jpg"
              require
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CRInput title="Precio" name="precio" value={formValues.precio} onChange={handleInputChange} placeholder="Ej: Q150" />
              <CRInput
                title="Precio de Oferta (opcional)"
                name="oferta"
                value={formValues.oferta}
                onChange={handleInputChange}
                placeholder="Ej: Q120"
              />
            </div>
            <CRInput title="Duración Estimada" name="duracion" value={formValues.duracion} onChange={handleInputChange} placeholder="Ej: 1h 30min" />

            <h4 className="text-sm font-medium text-textPrimary dark:text-gray-200 pt-2">
              Asociar Subcategorías <span className="text-red-500">*</span>
            </h4>
            <CRSelect
              title="1. Selecciona una Categoría Padre"
              data={categoriasPadreOptions}
              setValue={(selected) => setSelectedCategoriaParaSub(selected?.[0] ?? null)}
              loading={isLoadingCategoriasPadre}
              placeholder="Elige categoría para ver subcategorías"
              keyValue={false} // Los datos ya están en formato {label, value}
              clearable={false} // No permitir limpiar esta selección una vez hecha, para evitar confusión
              // Si se quiere cambiar de categoría padre, se deselecciona y se vuelve a seleccionar otra.
            />

            {selectedCategoriaParaSub && (
              <CRSelect
                title={`2. Subcategorías de "${selectedCategoriaParaSub.label}"`}
                data={subcategoriasOptionsDeCategoriaSeleccionada}
                setValue={handleSubcategoriasChange} // Esta función maneja la lógica de agregar/quitar
                multi
                placeholder="Selecciona una o más subcategorías"
                // Para defaultValue, filtramos las subcategorías seleccionadas que pertenecen a la categoría padre actual
                defaultValue={
                  formValues.subcategorias.map((id) => subcategoriasOptionsDeCategoriaSeleccionada.find((opt) => opt.value === id)).filter(Boolean) // Filtra nulos si algún ID no coincide o no pertenece a esta categoría
                }
                keyValue={false} // Los datos ya están en formato {label, value}
                // No se pone error aquí directamente, el error global de subcategorías se maneja abajo
              />
            )}
            {errors.subcategoriasGlobal && <p className="text-xs text-red-500 dark:text-red-400">{errors.subcategoriasGlobal}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              IDs de subcategorías seleccionadas actualmente: {formValues.subcategorias.join(", ") || "Ninguna"}
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
          if (!toggleActivoDisenioMutation.isPending) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        <p>{confirmModalProps.message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={() => {
              if (!toggleActivoDisenioMutation.isPending) setIsConfirmModalOpen(false);
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={toggleActivoDisenioMutation.isPending}
          />
          <CRButton
            title="Confirmar"
            onClick={confirmModalProps.onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white"
            loading={toggleActivoDisenioMutation.isPending}
            disabled={toggleActivoDisenioMutation.isPending}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default DiseniosAdminPage;
