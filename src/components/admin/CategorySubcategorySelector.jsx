import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DynamicIcon } from "../../utils/DynamicIcon";

const CategorySubcategorySelector = ({ categoriasPadreOptions = [], initialSelectedSubcategoryIds = [], onChange, onError }) => {
  // Estados para tracking de selecciones
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Función para determinar qué categorías están seleccionadas
  const getSelectedParentIds = (subcategoryIds) => {
    const parentIds = [];
    categoriasPadreOptions.forEach((parent) => {
      const hasSelectedSub = parent.subcategorias?.some((sub) => subcategoryIds.includes(sub.value));
      if (hasSelectedSub) {
        parentIds.push(parent.value);
      }
    });
    return parentIds;
  };

  // Inicializar el estado con los valores proporcionados
  useEffect(() => {
    if (categoriasPadreOptions.length > 0) {
      const initialIds = (initialSelectedSubcategoryIds || []).map(Number);
      const initialExpanded = {};

      // Expandir categorías que tienen subcategorías seleccionadas
      categoriasPadreOptions.forEach((parent) => {
        const hasSelectedSub = parent.subcategorias?.some((sub) => initialIds.includes(sub.value));
        if (hasSelectedSub) {
          initialExpanded[parent.value] = true;
        }
      });

      setSelectedSubcategories(initialIds);
      setExpandedCategories(initialExpanded);
      validateSelections(initialIds);
    }
  }, [categoriasPadreOptions, initialSelectedSubcategoryIds]);

  // Validar que cada categoría seleccionada tenga al menos una subcategoría
  const validateSelections = (subcategoryIds) => {
    const errors = {};
    let globalError = null;
    const selectedParentIds = getSelectedParentIds(subcategoryIds);

    // Validar solo las categorías que tienen check activo
    selectedParentIds.forEach((parentId) => {
      const parent = categoriasPadreOptions.find((p) => p.value === parentId);
      if (!parent) return;

      const hasSelectedSubcategory = parent.subcategorias?.some((sub) => subcategoryIds.includes(sub.value));

      if (!hasSelectedSubcategory) {
        errors[parentId] = `Selecciona al menos una subcategoría`;
        globalError = `Todas las categorías deben tener al menos una subcategoría seleccionada`;
      }
    });

    setValidationErrors(errors);
    if (onError) onError(Object.keys(errors).length > 0 ? globalError : null);

    return Object.keys(errors).length === 0;
  };

  // Manejar expansión/contracción de categoría
  const toggleExpand = (parentId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // Manejar activación/desactivación de una categoría padre
  const toggleCategory = (parentId) => {
    const isCurrentlySelected = getSelectedParentIds(selectedSubcategories).includes(parentId);
    let newSubcategories = [...selectedSubcategories];

    // Si está seleccionada, desactivamos quitando todas sus subcategorías
    if (isCurrentlySelected) {
      const parent = categoriasPadreOptions.find((p) => p.value === parentId);
      if (parent?.subcategorias) {
        parent.subcategorias.forEach((sub) => {
          newSubcategories = newSubcategories.filter((id) => id !== sub.value);
        });
      }
    } else {
      // Si no está seleccionada, expandimos la categoría
      setExpandedCategories((prev) => ({
        ...prev,
        [parentId]: true,
      }));
    }

    setSelectedSubcategories(newSubcategories);
    validateSelections(newSubcategories);
    onChange(newSubcategories);
  };

  // Manejar selección de subcategoría
  const handleSubcategoryToggle = (subcategoryId) => {
    let newSubcategories = [...selectedSubcategories];

    if (newSubcategories.includes(subcategoryId)) {
      newSubcategories = newSubcategories.filter((id) => id !== subcategoryId);
    } else {
      newSubcategories.push(subcategoryId);
    }

    setSelectedSubcategories(newSubcategories);
    validateSelections(newSubcategories);
    onChange(newSubcategories);
  };

  // Seleccionar todas las subcategorías de un padre
  const selectAllSubcategories = (parentId) => {
    const parent = categoriasPadreOptions.find((p) => p.value === parentId);
    if (!parent?.subcategorias) return;

    const newSubcategories = [...selectedSubcategories];
    parent.subcategorias.forEach((sub) => {
      if (!newSubcategories.includes(sub.value)) {
        newSubcategories.push(sub.value);
      }
    });

    setSelectedSubcategories(newSubcategories);
    validateSelections(newSubcategories);
    onChange(newSubcategories);
  };

  // Deseleccionar todas las subcategorías de un padre
  const deselectAllSubcategories = (parentId) => {
    const parent = categoriasPadreOptions.find((p) => p.value === parentId);
    if (!parent?.subcategorias) return;

    const newSubcategories = selectedSubcategories.filter((id) => !parent.subcategorias.some((sub) => sub.value === id));

    setSelectedSubcategories(newSubcategories);
    validateSelections(newSubcategories);
    onChange(newSubcategories);
  };

  // Determinar qué categorías padre están seleccionadas (tienen al menos una subcategoría)
  const selectedParentIds = getSelectedParentIds(selectedSubcategories);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-textPrimary dark:text-white">Categorías y Subcategorías</h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {selectedParentIds.length} categorías | {selectedSubcategories.length} subcategorías
          </span>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {categoriasPadreOptions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No hay categorías disponibles</div>
        ) : (
          <ul>
            {categoriasPadreOptions.map((parent) => {
              const isSelected = selectedParentIds.includes(parent.value);
              const isExpanded = !!expandedCategories[parent.value];
              const hasSubcategories = parent.subcategorias?.length > 0;
              const selectedSubcategoriesCount = parent.subcategorias?.filter((sub) => selectedSubcategories.includes(sub.value)).length || 0;
              const hasError = validationErrors[parent.value];

              return (
                <li
                  key={parent.value}
                  className={`border-b border-gray-200 dark:border-slate-700 last:border-b-0 ${isSelected ? "bg-blue-50 dark:bg-slate-700" : ""}`}
                >
                  <div className={`flex items-center p-3 ${hasError ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                    <div className="flex items-center flex-grow cursor-pointer" onClick={() => toggleExpand(parent.value)}>
                      {/* Switch nativo para activar/desactivar categoría */}
                      <label className="inline-flex items-center mr-3 cursor-pointer">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleCategory(parent.value)} className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                      <span className="font-medium text-textPrimary dark:text-white">{parent.label}</span>
                      {isSelected && selectedSubcategoriesCount > 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">({selectedSubcategoriesCount} subcategorías)</span>
                      )}
                    </div>

                    {hasSubcategories && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(parent.value)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full"
                      >
                        <DynamicIcon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Error de validación */}
                  {hasError && (
                    <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
                      <DynamicIcon name="AlertTriangle" className="inline-block h-3 w-3 mr-1" />
                      {hasError}
                    </div>
                  )}

                  {/* Panel de subcategorías */}
                  {isExpanded && hasSubcategories && (
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-textPrimary dark:text-white">Subcategorías</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => selectAllSubcategories(parent.value)}
                            className="text-xs text-primary dark:text-primary-light hover:underline"
                          >
                            Seleccionar todas
                          </button>
                          <button
                            type="button"
                            onClick={() => deselectAllSubcategories(parent.value)}
                            className="text-xs text-red-500 dark:text-red-400 hover:underline"
                          >
                            Deseleccionar todas
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {parent.subcategorias.map((sub) => (
                          <div
                            key={sub.value}
                            className={`
                              flex items-center rounded-md p-2
                              ${
                                selectedSubcategories.includes(sub.value)
                                  ? "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30"
                                  : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
                              }
                            `}
                          >
                            <label className="inline-flex items-center cursor-pointer flex-grow">
                              <input
                                type="checkbox"
                                checked={selectedSubcategories.includes(sub.value)}
                                onChange={() => handleSubcategoryToggle(sub.value)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-light mr-2"
                              />
                              <span className="text-sm text-textPrimary dark:text-white truncate">{sub.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

CategorySubcategorySelector.propTypes = {
  categoriasPadreOptions: PropTypes.array.isRequired,
  initialSelectedSubcategoryIds: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

export default CategorySubcategorySelector;
