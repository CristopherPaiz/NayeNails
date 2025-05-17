import React, { useState, useEffect, useCallback } from "react";
import CRModal from "../../../components/UI/CRModal";
import CRInput from "../../../components/UI/CRInput";
import CRButton from "../../../components/UI/CRButton";
import CRSelect from "../../../components/UI/CRSelect";
import { DynamicIcon } from "../../../utils/DynamicIcon";

const CategoriaFormModal = ({ isOpen, onClose, onSubmit, mode, categoriaToEdit, iconOptions }) => {
  const [nombre, setNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState(""); // Guardará el string del valor del icono
  const [errors, setErrors] = useState({});

  const isEditMode = mode === "editParent" || mode === "editChild";
  const isParentMode = mode === "addParent" || mode === "editParent";

  const populateForm = useCallback(() => {
    if (isEditMode && categoriaToEdit) {
      setNombre(categoriaToEdit.nombre || "");
      setIconoSeleccionado(categoriaToEdit.icono || ""); // Directamente el string del icono
    } else {
      setNombre("");
      setIconoSeleccionado("");
    }
  }, [isEditMode, categoriaToEdit]);

  useEffect(() => {
    if (isOpen) {
      populateForm();
    } else {
      setErrors({});
    }
  }, [isOpen, populateForm]);

  useEffect(() => {
    if (isOpen && isEditMode) {
      populateForm();
    }
  }, [isOpen, isEditMode, categoriaToEdit, populateForm]);

  const validate = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (nombre.trim().length > 50) newErrors.nombre = "El nombre no puede exceder los 50 caracteres.";
    if (!iconoSeleccionado) newErrors.icono = "El icono es obligatorio."; // Validar el string
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const formData = {
      nombre,
      icono: iconoSeleccionado,
    };

    if (mode === "editParent") {
      formData.id = categoriaToEdit.id;
    } else if (mode === "editChild") {
      formData.id = categoriaToEdit.id;
      formData.idPadre = categoriaToEdit.idPadre;
    } else if (mode === "addChild") {
      formData.idPadre = categoriaToEdit.idPadre;
    }
    onSubmit(formData);
  };

  let modalTitleText = "";
  if (mode === "addParent") modalTitleText = "Añadir Categoría Padre";
  else if (mode === "editParent") modalTitleText = `Editar Categoría: ${categoriaToEdit?.nombre || "..."}`;
  else if (mode === "addChild") modalTitleText = "Añadir Subcategoría";
  else if (mode === "editChild") modalTitleText = `Editar Subcategoría: ${categoriaToEdit?.nombre || "..."}`;

  const baseInputClass =
    "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-textPrimary dark:text-white";
  const errorInputClass = "border-red-500 dark:border-red-400";

  return (
    <CRModal isOpen={isOpen} setIsOpen={onClose} title={modalTitleText} width={window.innerWidth < 640 ? "90%" : 25}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-2">
        {/* Input de Nombre Nativo */}
        <div>
          <label htmlFor="cat-nombre-form" className="block text-sm font-medium text-textPrimary dark:text-gray-200">
            Nombre de la {isParentMode ? "Categoría" : "Subcategoría"} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cat-nombre-form"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Ej: ${isParentMode ? "Uñas Acrílicas" : "Diseño Francés"}`}
            maxLength={50}
            className={`${baseInputClass} ${errors.nombre ? errorInputClass : ""}`}
            autoComplete="off"
          />
          {errors.nombre && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.nombre}</p>}
        </div>

        {/* Select de Icono Nativo */}
        <div>
          <label htmlFor="cat-icono-form" className="block text-sm font-medium text-textPrimary dark:text-gray-200">
            Icono <span className="text-red-500">*</span>
          </label>
          <select
            id="cat-icono-form"
            value={iconoSeleccionado}
            onChange={(e) => setIconoSeleccionado(e.target.value)}
            className={`${baseInputClass} ${errors.icono ? errorInputClass : ""}`}
          >
            <option value="">Selecciona un icono...</option>
            {iconOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.icono && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.icono}</p>}

          {iconoSeleccionado && (
            <div className="mt-2 flex items-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded">
              <span className="mr-2 text-sm text-textSecondary dark:text-slate-300">Vista previa:</span>
              <DynamicIcon name={iconoSeleccionado} className="w-6 h-6 text-primary" />
              <span className="ml-2 text-sm font-mono text-textSecondary dark:text-slate-400">{iconoSeleccionado}</span>
            </div>
          )}
          {/* Link para ver la lista de iconos */}
          <div className="w-full flex justify-end">
            <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1">
              Ver lista de iconos
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
          <CRButton
            type="button"
            title="Cancelar"
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-textPrimary dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 w-full sm:w-auto"
          />
          <CRButton
            type="submit"
            title={isEditMode ? "Guardar Cambios" : "Añadir"}
            className="bg-primary text-white hover:opacity-90 w-full sm:w-auto"
          />
        </div>
      </form>
    </CRModal>
  );
};

export default CategoriaFormModal;
