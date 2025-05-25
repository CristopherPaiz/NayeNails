import React, { useState, useMemo, useCallback, memo } from "react";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRInput from "../../components/UI/CRInput";

const IconSelector = ({ allIconOptions = [], selectedIcon, onSelectIcon, label, required = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50); // Solo mostrar 50 iconos inicialmente

  const filteredIcons = useMemo(() => {
    if (!Array.isArray(allIconOptions) || allIconOptions.length === 0) {
      return [];
    }

    if (!searchTerm.trim()) {
      return allIconOptions;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allIconOptions.filter((option) => option?.label?.toLowerCase().includes(lowerSearchTerm));
  }, [allIconOptions, searchTerm]);

  // Solo mostrar una cantidad limitada de iconos
  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const handleIconClick = useCallback(
    (iconName) => {
      onSelectIcon(iconName);
      setShowList(false);
      setSearchTerm("");
      setVisibleCount(50); // Reset al cerrar
    },
    [onSelectIcon]
  );

  const loadMoreIcons = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 50, filteredIcons.length));
  }, [filteredIcons.length]);

  const handleShowList = useCallback(() => {
    setShowList(!showList);
    if (!showList) {
      setVisibleCount(50); // Reset cuando se abre
    }
  }, [showList]);

  // Componente para renderizar cada icono de forma segura
  const IconItem = memo(({ icon }) => (
    <div
      key={icon.value}
      onClick={() => handleIconClick(icon.value)}
      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer"
    >
      <DynamicIcon
        name={icon.value}
        className="w-5 h-5 mr-3 text-textPrimary dark:text-slate-200"
        fallback={<div className="w-5 h-5 mr-3 bg-gray-200 dark:bg-gray-600 rounded" />}
      />
      <span className="text-sm text-textPrimary dark:text-slate-200">{icon.label}</span>
    </div>
  ));

  IconItem.displayName = "IconItem";

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">
        {label || "Icono"} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className="flex items-center p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 cursor-pointer"
        onClick={handleShowList}
      >
        {selectedIcon ? (
          <>
            <DynamicIcon
              name={selectedIcon}
              className="w-5 h-5 mr-2 text-primary"
              fallback={<div className="w-5 h-5 mr-2 bg-gray-200 dark:bg-gray-600 rounded" />}
            />
            <span className="text-textPrimary dark:text-white">{selectedIcon}</span>
          </>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">Selecciona un icono...</span>
        )}
        <DynamicIcon
          name={showList ? "ChevronUp" : "ChevronDown"}
          className="w-4 h-4 ml-auto text-gray-400"
          fallback={<div className="w-4 h-4 ml-auto bg-gray-200 dark:bg-gray-600 rounded" />}
        />
      </div>

      {showList && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto p-2">
          <CRInput
            type="text"
            placeholder="Buscar icono por nombre..."
            value={searchTerm}
            setValue={setSearchTerm}
            className="mb-2 text-sm"
            autoFocus
          />

          {visibleIcons.length > 0 ? (
            <>
              {visibleIcons.map((icon) => (
                <IconItem key={icon.value} icon={icon} />
              ))}

              {/* Botón para cargar más iconos */}
              {visibleCount < filteredIcons.length && (
                <button onClick={loadMoreIcons} className="w-full p-2 mt-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                  Cargar más iconos ({filteredIcons.length - visibleCount} restantes)
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 p-2">No se encontraron iconos.</p>
          )}
        </div>
      )}

      <div className="w-full flex justify-end mt-1">
        <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          Ver lista completa de iconos
        </a>
      </div>
    </div>
  );
};

export default IconSelector;
