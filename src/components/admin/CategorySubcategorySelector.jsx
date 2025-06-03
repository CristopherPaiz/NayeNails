import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, Search, X } from "lucide-react";
import { DynamicIcon } from "../../utils/DynamicIcon";

const normalize = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const CategorySelector = ({ categoriasPadreOptions = [], initialSelectedSubcategoryIds = [], onChange, onError }) => {
  // state for selections, expanded nodes and search
  const [selectedSubcategories, setSelectedSubcategories] = useState(() => new Set(initialSelectedSubcategoryIds.map(Number)));
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const toExpand = new Set();
    const initSet = new Set(initialSelectedSubcategoryIds.map(Number));
    categoriasPadreOptions.forEach((parent) => {
      if (parent.subcategorias?.some((s) => initSet.has(s.value))) {
        toExpand.add(parent.value);
      }
    });
    return toExpand;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // track previous search to detect transitions
  const prevSearchRef = useRef("");

  // when first typing into search, auto-expand filtered categories;
  // when clearing search, collapse all
  const filteredCategories = useMemo(() => {
    if (!normalize(searchTerm)) {
      return categoriasPadreOptions;
    }
    return categoriasPadreOptions
      .map((cat) => {
        const matched = cat.subcategorias?.filter((sub) => normalize(sub.label).includes(normalize(searchTerm)));
        if (matched && matched.length > 0) {
          return { ...cat, subcategorias: matched };
        }
        return null;
      })
      .filter((c) => c);
  }, [categoriasPadreOptions, searchTerm]);

  useEffect(() => {
    const prev = prevSearchRef.current;
    const curr = searchTerm;
    if (!prev && curr) {
      // first time entering a search term
      setExpandedCategories((prevSet) => {
        const next = new Set(prevSet);
        filteredCategories.forEach((cat) => next.add(cat.value));
        return next;
      });
    } else if (prev && !curr) {
      // search cleared
      setExpandedCategories(new Set());
    }
    prevSearchRef.current = curr;
  }, [searchTerm, filteredCategories]);

  // notify parent of changes
  const notifyChanges = useCallback(
    (selectedSet) => {
      const arr = Array.from(selectedSet);
      onChange?.(arr);
      onError?.(arr.length === 0 ? "Selecciona al menos una subcategoría" : null);
    },
    [onChange, onError]
  );

  // toggle one subcategory
  const handleSubcategoryToggle = useCallback(
    (subcategoryId) => {
      setSelectedSubcategories((prev) => {
        const next = new Set(prev);
        if (next.has(subcategoryId)) next.delete(subcategoryId);
        else next.add(subcategoryId);
        setTimeout(() => notifyChanges(next), 0);
        return next;
      });
    },
    [notifyChanges]
  );

  // expand/collapse parent
  const toggleCategory = useCallback((catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  // select/deselect all in a parent
  const selectAllInCategory = useCallback(
    (category) => {
      setSelectedSubcategories((prev) => {
        const next = new Set(prev);
        category.subcategorias?.forEach((s) => next.add(s.value));
        setTimeout(() => notifyChanges(next), 0);
        return next;
      });
    },
    [notifyChanges]
  );
  const deselectAllInCategory = useCallback(
    (category) => {
      setSelectedSubcategories((prev) => {
        const next = new Set(prev);
        category.subcategorias?.forEach((s) => next.delete(s.value));
        setTimeout(() => notifyChanges(next), 0);
        return next;
      });
    },
    [notifyChanges]
  );

  const getSelectedCountInCategory = useCallback(
    (category) => category.subcategorias?.filter((s) => selectedSubcategories.has(s.value)).length || 0,
    [selectedSubcategories]
  );

  // clear search and selections
  const clearSearch = useCallback(() => setSearchTerm(""), []);
  const clearAllSelections = useCallback(() => {
    const empty = new Set();
    setSelectedSubcategories(empty);
    setTimeout(() => notifyChanges(empty), 0);
  }, [notifyChanges]);

  return (
    <div className="w-full bg-background dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      {/* search bar */}
      <div className="p-3 border-b border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textTertiary dark:text-slate-400" />
          <input
            type="text"
            placeholder="Buscar subcategorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-background dark:bg-slate-700 text-textPrimary dark:text-white placeholder-textTertiary dark:placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textTertiary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* list */}
      <div className="h-64 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-textSecondary dark:text-slate-400 text-sm">
            {searchTerm ? "No se encontraron subcategorías" : "No hay categorías disponibles"}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const totalSub = category.subcategorias?.length || 0;
            const isExpanded = expandedCategories.has(category.value);
            const selectedCount = getSelectedCountInCategory(category);

            return (
              <div key={category.value} className="border-b border-gray-100 dark:border-slate-700 last:border-b-0">
                {/* parent header */}
                <div
                  onClick={() => (totalSub > 0 ? toggleCategory(category.value) : null)}
                  className={`flex items-center justify-between p-3 ${
                    totalSub > 0 ? "cursor-pointer hover:bg-accent/50 dark:hover:bg-slate-700/70 transition-colors" : ""
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1 space-x-2">
                    {totalSub > 0 ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-textTertiary dark:text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-textTertiary dark:text-slate-500" />
                      )
                    ) : null}
                    {category.icono && <DynamicIcon name={category.icono} className="w-4 h-4 text-textTertiary dark:text-slate-500" />}
                    <span className="font-medium text-textPrimary dark:text-white text-sm truncate">{category.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <span className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light text-xs px-2 py-1 rounded-full">
                        {selectedCount}
                      </span>
                    )}
                    {totalSub > 0 && isExpanded && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllInCategory(category);
                          }}
                          className="text-xs text-primary dark:text-primary-light hover:underline px-1"
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deselectAllInCategory(category);
                          }}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline px-1"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* subcategories */}
                {isExpanded && totalSub > 0 && (
                  <div className="bg-accent/30 dark:bg-slate-700/30">
                    {category.subcategorias.map((sub) => {
                      const isSelected = selectedSubcategories.has(sub.value);
                      return (
                        <div
                          key={sub.value}
                          onClick={() => handleSubcategoryToggle(sub.value)}
                          className="flex items-center p-2 pl-6 cursor-pointer hover:bg-accent/60 dark:hover:bg-slate-600/60 transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                              isSelected ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-slate-500"
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          {sub.icono && <DynamicIcon name={sub.icono} className="w-4 h-4 text-textSecondary dark:text-slate-200 mr-2" />}
                          <span className="text-textSecondary dark:text-slate-200 text-sm truncate">{sub.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* footer */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/70">
        <div className="flex justify-between items-center text-sm text-textSecondary dark:text-slate-400">
          <span>
            {selectedSubcategories.size} seleccionada
            {selectedSubcategories.size !== 1 && "s"}
          </span>
          {selectedSubcategories.size > 0 && (
            <button onClick={clearAllSelections} className="text-red-600 dark:text-red-400 hover:underline text-xs">
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
