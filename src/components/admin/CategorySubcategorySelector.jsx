import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { DynamicIcon } from "../../utils/DynamicIcon";

const CategorySubcategorySelector = ({ categoriasPadreOptions = [], initialSelectedSubcategoryIds = [], onChange, onError }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Referencia para mantener la posición del scroll
  const contenedorRef = useRef(null);

  // Función para preservar la posición del scroll durante actualizaciones de estado
  const preservarScroll = (callback) => {
    // Guardar posición actual
    const scrollPos = contenedorRef.current?.scrollTop;

    // Ejecutar la función que actualiza el estado
    callback();

    // Restaurar la posición después de la actualización
    requestAnimationFrame(() => {
      if (contenedorRef.current && scrollPos !== undefined) {
        contenedorRef.current.scrollTop = scrollPos;
      }
    });
  };

  // Función para identificar qué categorías padre están seleccionadas
  const getSelectedParentIds = useCallback(
    (subcategoryIds) => {
      return categoriasPadreOptions
        .filter((parent) => parent.subcategorias?.some((sub) => subcategoryIds.includes(sub.value)))
        .map((parent) => parent.value);
    },
    [categoriasPadreOptions]
  );

  // Validar selecciones
  const validateSelections = useCallback(
    (subcategoryIds) => {
      const errors = {};
      const selectedParentIds = getSelectedParentIds(subcategoryIds);

      selectedParentIds.forEach((parentId) => {
        const parent = categoriasPadreOptions.find((p) => p.value === parentId);
        if (parent && !parent.subcategorias?.some((sub) => subcategoryIds.includes(sub.value))) {
          errors[parentId] = `Selecciona al menos una subcategoría`;
        }
      });

      setValidationErrors(errors);
      if (onError) {
        onError(Object.keys(errors).length > 0 ? `Todas las categorías deben tener al menos una subcategoría seleccionada` : null);
      }
      return Object.keys(errors).length === 0;
    },
    [categoriasPadreOptions, getSelectedParentIds, onError]
  );

  // Inicializar estado
  useEffect(() => {
    if (categoriasPadreOptions.length > 0) {
      const initialIds = (initialSelectedSubcategoryIds || []).map(Number);

      setSelectedSubcategories((prevSelected) => {
        if (JSON.stringify([...prevSelected].sort()) === JSON.stringify([...initialIds].sort())) {
          return prevSelected;
        }
        return initialIds;
      });

      // Auto-expandir categorías con subcategorías seleccionadas
      const initialExpanded = {};
      categoriasPadreOptions.forEach((parent) => {
        if (parent.subcategorias?.some((sub) => initialIds.includes(sub.value))) {
          initialExpanded[parent.value] = true;
        }
      });

      setExpandedCategories((prevExpanded) => {
        if (JSON.stringify(prevExpanded) === JSON.stringify(initialExpanded)) {
          return prevExpanded;
        }
        return initialExpanded;
      });

      validateSelections(initialIds);
    }
  }, [categoriasPadreOptions, initialSelectedSubcategoryIds, validateSelections]);

  // Expandir/contraer una categoría
  const toggleExpand = useCallback((parentId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    preservarScroll(() => {
      setExpandedCategories((prev) => ({
        ...prev,
        [parentId]: !prev[parentId],
      }));
    });
  }, []);

  // Activar/desactivar una categoría
  const toggleCategory = useCallback(
    (parentId, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      preservarScroll(() => {
        const isSelected = getSelectedParentIds(selectedSubcategories).includes(parentId);
        const parent = categoriasPadreOptions.find((p) => p.value === parentId);

        let newSubcategories = [...selectedSubcategories];

        if (isSelected) {
          // Remover todas las subcategorías de esta categoría
          newSubcategories = newSubcategories.filter((id) => !parent.subcategorias?.some((sub) => sub.value === id));
        } else {
          // Expandir automáticamente al activar
          setExpandedCategories((prev) => ({ ...prev, [parentId]: true }));
        }

        setSelectedSubcategories(newSubcategories);
        validateSelections(newSubcategories);
        onChange(newSubcategories);
      });
    },
    [selectedSubcategories, getSelectedParentIds, categoriasPadreOptions, validateSelections, onChange]
  );

  // Seleccionar/deseleccionar una subcategoría
  const toggleSubcategory = useCallback(
    (subcategoryId, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      preservarScroll(() => {
        const newSubcategories = selectedSubcategories.includes(subcategoryId)
          ? selectedSubcategories.filter((id) => id !== subcategoryId)
          : [...selectedSubcategories, subcategoryId];

        setSelectedSubcategories(newSubcategories);
        validateSelections(newSubcategories);
        onChange(newSubcategories);
      });
    },
    [selectedSubcategories, validateSelections, onChange]
  );

  // Seleccionar todas o ninguna subcategoría
  const toggleAllSubcategories = useCallback(
    (parentId, selectAll, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      preservarScroll(() => {
        const parent = categoriasPadreOptions.find((p) => p.value === parentId);
        if (!parent?.subcategorias) return;

        let newSubcategories = [...selectedSubcategories];

        if (selectAll) {
          // Agregar todas las subcategorías que no están seleccionadas
          parent.subcategorias.forEach((sub) => {
            if (!newSubcategories.includes(sub.value)) {
              newSubcategories.push(sub.value);
            }
          });
        } else {
          // Quitar todas las subcategorías de esta categoría
          newSubcategories = newSubcategories.filter((id) => !parent.subcategorias.some((sub) => sub.value === id));
        }

        setSelectedSubcategories(newSubcategories);
        validateSelections(newSubcategories);
        onChange(newSubcategories);
      });
    },
    [selectedSubcategories, categoriasPadreOptions, validateSelections, onChange]
  );

  // Calcular IDs de categorías padre seleccionadas
  const selectedParentIds = useMemo(() => getSelectedParentIds(selectedSubcategories), [getSelectedParentIds, selectedSubcategories]);

  // Componente de subcategoría
  const SubcategoryItem = React.memo(({ sub, isSubSelected, onToggle }) => (
    <label
      className={`
        flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
        ${
          isSubSelected
            ? "bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40"
            : "bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500"
        }
      `}
      onClick={(e) => onToggle(sub.value, e)}
    >
      <input
        type="checkbox"
        checked={isSubSelected}
        onChange={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-3"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="text-sm text-textPrimary dark:text-white">{sub.label}</span>
    </label>
  ));

  // Componente de categoría
  const CategoryItem = React.memo(({ parent }) => {
    const isSelected = selectedParentIds.includes(parent.value);
    const isExpanded = expandedCategories[parent.value];
    const hasSubcategories = parent.subcategorias?.length > 0;
    const selectedCount = parent.subcategorias?.filter((sub) => selectedSubcategories.includes(sub.value)).length || 0;
    const hasError = validationErrors[parent.value];

    return (
      <div className={`${isSelected ? "bg-blue-50 dark:bg-slate-700/50" : ""}`}>
        {/* Header de categoría */}
        <div className={`flex items-center ${hasError ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
          {/* Toggle switch */}
          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isSelected} onChange={(e) => toggleCategory(parent.value, e)} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Área expandible */}
          <div
            className={`flex-1 flex items-center justify-between p-4 pl-0 ${
              hasSubcategories ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30" : ""
            } transition-colors`}
            onClick={(e) => (hasSubcategories ? toggleExpand(parent.value, e) : undefined)}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-textPrimary dark:text-white">{parent.label}</span>
              {isSelected && selectedCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  {selectedCount}
                </span>
              )}
            </div>

            {hasSubcategories && (
              <DynamicIcon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="h-5 w-5 text-gray-500 dark:text-slate-400" />
            )}
          </div>
        </div>

        {/* Error */}
        {hasError && (
          <div className="mx-4 mb-3 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md">
            <div className="flex items-center gap-2">
              <DynamicIcon name="AlertTriangle" className="h-4 w-4 flex-shrink-0" />
              <span>{hasError}</span>
            </div>
          </div>
        )}

        {/* Subcategorías */}
        {isExpanded && hasSubcategories && (
          <div className="bg-gray-50 dark:bg-slate-800/30">
            {/* Header subcategorías */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
              <span className="text-sm font-medium text-textPrimary dark:text-white">Subcategorías ({parent.subcategorias.length})</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => toggleAllSubcategories(parent.value, true, e)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleAllSubcategories(parent.value, false, e)}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Ninguna
                </button>
              </div>
            </div>

            {/* Grid subcategorías */}
            <div className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {parent.subcategorias.map((sub) => (
                  <SubcategoryItem key={sub.value} sub={sub} isSubSelected={selectedSubcategories.includes(sub.value)} onToggle={toggleSubcategory} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-textPrimary dark:text-white">Categorías y Subcategorías</h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {selectedParentIds.length} categorías | {selectedSubcategories.length} subcategorías
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div ref={contenedorRef} className="overflow-y-auto max-h-[400px]" style={{ scrollBehavior: "smooth" }}>
        {categoriasPadreOptions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No hay categorías disponibles</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {categoriasPadreOptions.map((parent) => (
              <CategoryItem key={parent.value} parent={parent} />
            ))}
          </div>
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
