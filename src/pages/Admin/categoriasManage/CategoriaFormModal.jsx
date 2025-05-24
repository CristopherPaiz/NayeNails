import React, { useState, useEffect, useCallback, useMemo } from "react";
import CRModal from "../../../components/UI/CRModal";
import CRButton from "../../../components/UI/CRButton";
import { DynamicIcon } from "../../../utils/DynamicIcon";

const CategoriaFormModal = ({ isOpen, onClose, onSubmit, mode, categoriaToEdit, iconOptions: allIconOptions, isLoading }) => {
  const [nombre, setNombre] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState("");
  const [errors, setErrors] = useState({});
  const [searchTermIcono, setSearchTermIcono] = useState("");

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
    setSearchTermIcono(""); // Resetear búsqueda de icono al popular
  }, [categoriaToEdit]);

  useEffect(() => {
    if (isOpen) {
      populateForm();
      setErrors({});
    }
  }, [isOpen, populateForm]);

  const filteredIconOptions = useMemo(() => {
    if (!searchTermIcono.trim()) {
      return allIconOptions;
    }
    const lowerSearchTerm = searchTermIcono.toLowerCase();
    return allIconOptions.filter((option) => option.label.toLowerCase().includes(lowerSearchTerm));
  }, [allIconOptions, searchTermIcono]);

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
      icono: iconoSeleccionado,
    };
    if (mode === "editParent" && categoriaToEdit) {
      formData.id = categoriaToEdit.id;
    } else if (mode === "editChild" && categoriaToEdit) {
      formData.id = categoriaToEdit.id;
      formData.id_categoria_padre = categoriaToEdit.idPadre;
    } else if (mode === "addChild" && categoriaToEdit) {
      formData.idPadre = categoriaToEdit.idPadre;
    }
    onSubmit(formData);
  };

  let modalTitleText = "";
  if (mode === "addParent") modalTitleText = "Añadir Categoría Padre";
  else if (mode === "editParent") modalTitleText = `Editar Categoría: ${categoriaToEdit?.nombre ?? "..."}`;
  else if (mode === "addChild") modalTitleText = "Añadir Subcategoría";
  else if (mode === "editChild") modalTitleText = `Editar Subcategoría: ${categoriaToEdit?.nombre ?? "..."}`;

  const baseInputClass =
    "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-textPrimary dark:text-white";
  const errorInputClass = "border-red-500 dark:border-red-400";

  return (
    <CRModal isOpen={isOpen} setIsOpen={onClose} title={modalTitleText} width={window.innerWidth < 640 ? "90%" : 25}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-2">
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

        <div>
          <label htmlFor="cat-icono-search" className="block text-sm font-medium text-textPrimary dark:text-gray-200">
            Buscar Icono
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="cat-icono-search"
              value={searchTermIcono}
              onChange={(e) => setSearchTermIcono(e.target.value)}
              placeholder="Buscar por nombre (ej: Hand, Sparkle)"
              className={`${baseInputClass} pl-10`}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <DynamicIcon name="Search" size={18} />
            </div>
          </div>

          <label htmlFor="cat-icono-form" className="block text-sm font-medium text-textPrimary dark:text-gray-200 mt-3">
            Icono {isParentMode && <span className="text-red-500">*</span>}
          </label>
          <select
            id="cat-icono-form"
            value={iconoSeleccionado}
            onChange={(e) => setIconoSeleccionado(e.target.value)}
            className={`${baseInputClass} ${errors.icono && isParentMode ? errorInputClass : ""}`}
            size={filteredIconOptions.length > 5 ? 5 : filteredIconOptions.length + 1} // Mostrar algunas opciones si hay pocas
          >
            <option value="">{isParentMode ? "Selecciona un icono..." : "Selecciona un icono (opcional)..."}</option>
            {filteredIconOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {/* No se puede renderizar HTML (como un icono) directamente en <option> de forma estándar */}
                {option.label}
              </option>
            ))}
            {filteredIconOptions.length === 0 && searchTermIcono && <option disabled>No hay iconos para "{searchTermIcono}"</option>}
          </select>
          {errors.icono && isParentMode && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.icono}</p>}

          {iconoSeleccionado && (
            <div className="mt-2 flex items-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded">
              <span className="mr-2 text-sm text-textSecondary dark:text-slate-300">Vista previa:</span>
              <DynamicIcon name={iconoSeleccionado} className="w-6 h-6 text-primary" />
              <span className="ml-2 text-sm font-mono text-textSecondary dark:text-slate-400">{iconoSeleccionado}</span>
            </div>
          )}
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
