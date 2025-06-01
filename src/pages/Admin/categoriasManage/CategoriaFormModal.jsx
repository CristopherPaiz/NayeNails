import React, { useState, useEffect, useCallback } from "react";
import CRModal from "../../../components/UI/CRModal";
import CRButton from "../../../components/UI/CRButton";
import CRInput from "../../../components/UI/CRInput";
import IconSelector from "../IconSelector"; // Importar el nuevo componente

const CategoriaFormModal = ({ isOpen, onClose, onSubmit, mode, categoriaToEdit, iconOptions: allIconOptions = [], isLoading }) => {
  const [nombre, setNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("");
  const [errors, setErrors] = useState({});
  const [openIconSelector, setOpenIconSelector] = useState(false);

  const isEditMode = mode === "editParent" || mode === "editChild";
  const isParentMode = mode === "addParent" || mode === "editParent";

  const populateForm = useCallback(() => {
    if (categoriaToEdit) {
      setNombre(categoriaToEdit.nombre ?? "");
      setIconoSeleccionado(categoriaToEdit.icono ?? "");
    } else {
      setNombre("");
      setIconoSeleccionado("");
    }
  }, [categoriaToEdit]);

  useEffect(() => {
    if (isOpen) {
      populateForm();
      setErrors({});
    }
  }, [isOpen, populateForm]);

  const validate = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (nombre.trim().length > 50) newErrors.nombre = "El nombre no puede exceder los 50 caracteres.";
    if (!iconoSeleccionado && isParentMode) newErrors.icono = "El icono es obligatorio para categorías padre.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    const formData = {
      nombre: nombre.trim(),
      icono: iconoSeleccionado || null, // Enviar null si no hay icono (para subcategorías opcionales)
    };

    // El ID y idPadre se manejan en CategoriasPage.jsx al llamar a la mutación
    onSubmit(formData);
  };

  const handleIconSelect = (iconName) => {
    setIconoSeleccionado(iconName);
    // Limpiar error de icono si se selecciona uno
    if (errors.icono && iconName) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.icono;
        return newErrors;
      });
    }
  };

  let modalTitleText = "";
  if (mode === "addParent") modalTitleText = "Añadir Categoría Padre";
  else if (mode === "editParent") modalTitleText = `Editar Categoría: ${categoriaToEdit?.nombre ?? "..."}`;
  else if (mode === "addChild") modalTitleText = "Añadir Subcategoría";
  else if (mode === "editChild") modalTitleText = `Editar Subcategoría: ${categoriaToEdit?.nombre ?? "..."}`;

  return (
    <CRModal
      isOpen={isOpen}
      setIsOpen={onClose}
      title={modalTitleText}
      width={window.innerWidth < 640 ? 90 : 30}
      height={window.innerWidth < 640 ? (openIconSelector ? 65 : 55) : openIconSelector ? 75 : 60}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-2">
        <CRInput
          title={`Nombre de la ${isParentMode ? "Categoría" : "Subcategoría"}`}
          value={nombre}
          setValue={setNombre}
          placeholder={`Ej: ${isParentMode ? "Uñas Acrílicas" : "Diseño Francés"}`}
          maxLength={50}
          error={errors.nombre}
          autoComplete="off"
          id="cat-nombre-form"
        />

        {/* Solo mostrar IconSelector si tenemos iconos disponibles */}
        {Array.isArray(allIconOptions) && allIconOptions.length > 0 ? (
          <>
            <IconSelector
              allIconOptions={allIconOptions}
              selectedIcon={iconoSeleccionado}
              onSelectIcon={handleIconSelect}
              label="Icono"
              required={isParentMode} // El icono es requerido solo para categorías padre
              setOpenIconSelector={setOpenIconSelector} // No necesitamos abrir un selector externo
            />
            {errors.icono && isParentMode && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.icono}</p>}
          </>
        ) : (
          <div className="space-y-2 mt-24">
            <label className="block text-sm font-medium text-textPrimary dark:text-gray-200">
              Icono {isParentMode && <span className="text-red-500">*</span>}
            </label>
            <div className="p-3 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando iconos disponibles...</p>
            </div>
            {errors.icono && isParentMode && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.icono}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
          <CRButton
            type="button"
            title="Cancelar"
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-textPrimary dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 w-full sm:w-auto"
            disabled={isLoading}
          />
          <CRButton
            type="submit"
            title={isEditMode ? "Guardar Cambios" : "Añadir"}
            className="bg-primary text-white hover:opacity-90 w-full sm:w-auto"
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </form>
    </CRModal>
  );
};

export default CategoriaFormModal;
