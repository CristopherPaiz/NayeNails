import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRInput from "../../components/UI/CRInput";

const IconSelector = ({ allIconOptions = [], selectedIcon, onSelectIcon, label, required = false, setOpenIconSelector }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const ICONS_PER_PAGE = 50;
  const MAX_VISIBLE_ICONS = 100;

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

  const { visibleIcons, canLoadPrevious, canLoadNext, currentRange } = useMemo(() => {
    const endIndex = Math.min(startIndex + MAX_VISIBLE_ICONS, filteredIcons.length);
    const visible = filteredIcons.slice(startIndex, endIndex);

    return {
      visibleIcons: visible,
      canLoadPrevious: startIndex > 0,
      canLoadNext: endIndex < filteredIcons.length,
      currentRange: {
        start: startIndex + 1,
        end: endIndex,
        total: filteredIcons.length,
      },
    };
  }, [filteredIcons, startIndex]);

  // Resetear paginación cuando cambia la búsqueda
  useEffect(() => {
    setStartIndex(0);
  }, [searchTerm]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false);
        setOpenIconSelector(false);
        setSearchTerm("");
        setStartIndex(0);
      }
    };

    if (showList) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showList]);

  const handleIconClick = useCallback(
    (iconName) => {
      onSelectIcon(iconName);
      setShowList(false);
      setOpenIconSelector(false);
      setSearchTerm("");
      setStartIndex(0);
    },
    [onSelectIcon]
  );

  const loadPreviousIcons = useCallback((event) => {
    event.stopPropagation();
    setStartIndex((prev) => Math.max(0, prev - ICONS_PER_PAGE));

    // Scroll al top del dropdown después de cargar iconos anteriores
    setTimeout(() => {
      if (dropdownRef.current) {
        dropdownRef.current.scrollTop = 0;
      }
    }, 0);
  }, []);

  const loadNextIcons = useCallback(
    (event) => {
      event.stopPropagation();
      setStartIndex((prev) => Math.min(prev + ICONS_PER_PAGE, filteredIcons.length - MAX_VISIBLE_ICONS));
    },
    [filteredIcons.length]
  );

  const handleShowList = useCallback(() => {
    setShowList(!showList);
    setOpenIconSelector(!showList);
    if (!showList) {
      setStartIndex(0);
    }
  }, [showList]);

  // Prevenir que el dropdown cierre cuando se interactúa dentro de él
  const handleDropdownClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

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
    <div className="relative" ref={containerRef}>
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
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto p-2"
          onClick={handleDropdownClick}
        >
          {/* Buscador */}
          <div
            onClick={handleDropdownClick}
            className="sticky -top-3 bg-white dark:bg-slate-800 pb-2 mb-2 border-b border-gray-200 dark:border-slate-600"
          >
            <CRInput
              type="text"
              placeholder="Buscar icono por nombre..."
              value={searchTerm}
              setValue={setSearchTerm}
              className="mb-2 text-sm"
              autoFocus
            />

            {/* Información de rango y navegación superior */}
            {filteredIcons.length > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>
                  Mostrando {currentRange.start}-{currentRange.end} de {currentRange.total}
                </span>
                {canLoadPrevious && (
                  <button
                    type="button"
                    onClick={loadPreviousIcons}
                    className="px-2 py-1 text-xs text-blue-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                  >
                    ← Anteriores
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lista de iconos */}
          {visibleIcons.length > 0 ? (
            <>
              {visibleIcons.map((icon) => (
                <IconItem key={icon.value} icon={icon} />
              ))}

              {/* Botón cargar más (inferior) */}
              {canLoadNext && (
                <button
                  type="button"
                  onClick={loadNextIcons}
                  className="w-full p-2 mt-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  Cargar más iconos → (siguientes {Math.min(ICONS_PER_PAGE, filteredIcons.length - currentRange.end)})
                </button>
              )}

              {/* Información adicional si llegamos al final */}
              {!canLoadNext && filteredIcons.length > MAX_VISIBLE_ICONS && (
                <div className="text-center p-2 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-600 mt-2">
                  Fin de la lista - {filteredIcons.length} iconos encontrados
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 p-2">
              {searchTerm ? "No se encontraron iconos con ese término." : "No hay iconos disponibles."}
            </p>
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
