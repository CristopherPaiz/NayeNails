import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DynamicIcon } from "../utils/DynamicIcon";
import useStoreNails from "../store/store";
import CRLoader from "../components/UI/CRLoader";

import { capitalizeWords } from "../utils/textUtils";
import {
  getInitialVisibleCounts,
  parseFiltersFromUrl,
  calculateDisplayedNails,
  getNombreFiltroFromSlug,
  calculateTotalFiltrosActivos,
  performGlobalFilterSearch,
} from "../utils/filterUtils";

const ITEMS_PER_PAGE_INITIAL_CATEGORY = 4;
const MAX_VISIBLE_TAGS_ON_CARD = 3;

const getDynamicFilterCategories = (dynamicNavItems) => {
  const categories = [];
  if (!dynamicNavItems || typeof dynamicNavItems !== "object") return categories;

  const navItemEntries = Object.entries(dynamicNavItems);
  for (const [key, value] of navItemEntries) {
    if (value.filterType && value.categorías && Array.isArray(value.categorías)) {
      categories.push({
        key: value.filterType,
        label: key,
        icon: value.icon,
        options: value.categorías.map((cat) => ({
          nombre: cat.nombre,
          slug: cat.slug,
          icon: cat.icon,
        })),
      });
    }
  }
  return categories;
};

const Explorar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { todasLasUnas, TAG_COLORS, dynamicNavItems, isLoadingDynamicNav, errorDynamicNav, fetchDynamicNavItems } = useStoreNails();

  const availableFilterOptions = useMemo(() => getDynamicFilterCategories(dynamicNavItems), [dynamicNavItems]);

  const initialVisibleCountsCalculated = useMemo(
    () => getInitialVisibleCounts(availableFilterOptions, ITEMS_PER_PAGE_INITIAL_CATEGORY),
    [availableFilterOptions]
  );

  const parsedFiltersFromUrl = useMemo(() => parseFiltersFromUrl(location.search, availableFilterOptions), [location.search, availableFilterOptions]);

  const displayedNails = useMemo(
    () => calculateDisplayedNails(todasLasUnas, parsedFiltersFromUrl, availableFilterOptions),
    [todasLasUnas, parsedFiltersFromUrl, availableFilterOptions]
  );

  const [isFilterPanelOpenMobile, setIsFilterPanelOpenMobile] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [visibleCountsPerCategory, setVisibleCountsPerCategory] = useState(initialVisibleCountsCalculated);
  const [expandedTags, setExpandedTags] = useState({});

  useEffect(() => {
    if (errorDynamicNav && availableFilterOptions.length === 0) {
      // Podrías añadir un botón para reintentar o un reintento automático limitado
      // fetchDynamicNavItems(); // Cuidado con bucles infinitos aquí
    }
  }, [errorDynamicNav, availableFilterOptions.length, fetchDynamicNavItems]);

  useEffect(() => {
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
  }, [initialVisibleCountsCalculated]);

  const handleFilterChange = useCallback(
    (filterTypeKey, filterValueSlug) => {
      const currentParams = new URLSearchParams(location.search);
      const currentValuesForType = currentParams.getAll(filterTypeKey);
      const newValuesForType = currentValuesForType.includes(filterValueSlug)
        ? currentValuesForType.filter((v) => v !== filterValueSlug)
        : [...currentValuesForType, filterValueSlug];

      currentParams.delete(filterTypeKey);
      newValuesForType.forEach((val) => currentParams.append(filterTypeKey, val));
      navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
    },
    [navigate, location.pathname, location.search]
  );

  const clearAllFilters = useCallback(() => {
    navigate(location.pathname, { replace: true });
    setGlobalSearchTerm("");
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
    setExpandedTags({});
  }, [navigate, location.pathname, initialVisibleCountsCalculated]);

  const getNombreFiltro = useCallback(
    (tipoKey, slug) => {
      return getNombreFiltroFromSlug(availableFilterOptions, tipoKey, slug);
    },
    [availableFilterOptions]
  );

  const totalFiltrosActivosGeneral = useMemo(() => calculateTotalFiltrosActivos(parsedFiltersFromUrl), [parsedFiltersFromUrl]);

  const handleGlobalSearchChange = (e) => {
    setGlobalSearchTerm(e.target.value);
  };

  const searchResults = useMemo(
    () => performGlobalFilterSearch(globalSearchTerm, availableFilterOptions),
    [globalSearchTerm, availableFilterOptions]
  );

  const toggleShowMoreInCategory = useCallback(
    (categoryKey) => {
      setVisibleCountsPerCategory((prevCounts) => {
        const category = availableFilterOptions.find((cat) => cat.key === categoryKey);
        const categoryOptionsLength = category ? category.options.length : 0;
        const currentCount = prevCounts[categoryKey] ?? ITEMS_PER_PAGE_INITIAL_CATEGORY;
        return {
          ...prevCounts,
          [categoryKey]: currentCount >= categoryOptionsLength && categoryOptionsLength > 0 ? ITEMS_PER_PAGE_INITIAL_CATEGORY : categoryOptionsLength,
        };
      });
    },
    [availableFilterOptions]
  );

  const toggleCardTags = useCallback((cardId) => {
    setExpandedTags((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const handleCardTagClick = useCallback(
    (filterTypeKey, filterValueSlug) => {
      const newParams = new URLSearchParams();
      newParams.append(filterTypeKey, filterValueSlug);
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
      setIsFilterPanelOpenMobile(false);
      window.scrollTo(0, 0);
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderFilterPanel = useCallback(() => {
    if (isLoadingDynamicNav && availableFilterOptions.length === 0) {
      return (
        <aside className="w-full md:w-64 lg:w-72 md:mr-6 lg:mr-8 mb-6 md:mb-0 flex-shrink-0">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow sticky top-20">
            <CRLoader text="Cargando filtros..." style="dots" size="md" />
          </div>
        </aside>
      );
    }
    if (errorDynamicNav && availableFilterOptions.length === 0) {
      return (
        <aside className="w-full md:w-64 lg:w-72 md:mr-6 lg:mr-8 mb-6 md:mb-0 flex-shrink-0">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow sticky top-20 text-center">
            <DynamicIcon name="AlertTriangle" className="mx-auto text-red-500 w-8 h-8 mb-2" />
            <p className="text-sm text-red-700 dark:text-red-300">Error al cargar filtros.</p>
            <CRButton title="Reintentar" onClick={fetchDynamicNavItems} className="mt-2 !bg-red-500 !text-white text-xs py-1 px-2" />
          </div>
        </aside>
      );
    }

    return (
      <aside className="w-full md:w-64 lg:w-72 md:mr-6 lg:mr-8 mb-6 md:mb-0 flex-shrink-0">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow sticky top-20">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-textPrimary flex items-center">
              <DynamicIcon name="SlidersHorizontal" className="w-5 h-5 mr-2 text-primary" />
              Filtros
            </h2>
            {totalFiltrosActivosGeneral > 0 && (
              <button onClick={clearAllFilters} className="text-xs font-medium text-primary hover:underline">
                Limpiar Todo
              </button>
            )}
          </div>

          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Buscar filtros (ej: Rojo, Acrílicas...)"
              value={globalSearchTerm}
              onChange={handleGlobalSearchChange}
              className="w-full pl-8 pr-2 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-background dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <DynamicIcon name="Search" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            {globalSearchTerm.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map((categoryResult) => {
                  const filtrosActivosEnEstaCategoria = parsedFiltersFromUrl[categoryResult.key] ?? [];
                  return (
                    <div key={categoryResult.key} className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3 first:pt-0 first:border-t-0">
                      <h3 className="font-semibold text-textSecondary mb-1.5 flex items-center text-xs uppercase tracking-wider">
                        {categoryResult.icon && <DynamicIcon name={categoryResult.icon} className="w-3.5 h-3.5 mr-1.5 text-gray-500" />}
                        {capitalizeWords(categoryResult.label)}
                        {filtrosActivosEnEstaCategoria.length > 0 && (
                          <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono">
                            {filtrosActivosEnEstaCategoria.length}
                          </span>
                        )}
                      </h3>
                      <ul className="space-y-0.5">
                        {categoryResult.options.map((opcion) => {
                          const isChecked = filtrosActivosEnEstaCategoria.includes(opcion.slug);
                          return (
                            <li key={`${categoryResult.key}-${opcion.slug}`}>
                              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-md group">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-3.5 w-3.5 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-offset-0 dark:focus:ring-offset-gray-800 bg-transparent"
                                  checked={isChecked}
                                  onChange={() => handleFilterChange(categoryResult.key, opcion.slug)}
                                />
                                <span className={`text-xs ${isChecked ? "font-medium text-primary" : "text-textPrimary group-hover:text-primary"}`}>
                                  {getNombreFiltro(categoryResult.key, opcion.slug)}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1 py-2">No se encontraron filtros para "{globalSearchTerm}".</p>
              )
            ) : availableFilterOptions.length > 0 ? (
              availableFilterOptions.map((categoria) => {
                const currentVisibleCount = visibleCountsPerCategory[categoria.key] ?? ITEMS_PER_PAGE_INITIAL_CATEGORY;
                const opcionesAMostrar = categoria.options.slice(0, currentVisibleCount);
                const numFiltrosActivosEnCategoria = (parsedFiltersFromUrl[categoria.key] ?? []).length;

                return (
                  <div key={categoria.key} className="mb-5 border-t border-gray-200 dark:border-gray-700 pt-4 first:pt-0 first:border-t-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-textSecondary flex items-center text-sm">
                        {categoria.icon && <DynamicIcon name={categoria.icon} className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />}
                        {capitalizeWords(categoria.label)}
                      </h3>
                      {numFiltrosActivosEnCategoria > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono">
                          {numFiltrosActivosEnCategoria}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {opcionesAMostrar.map((opcion) => {
                        const isChecked = (parsedFiltersFromUrl[categoria.key] ?? []).includes(opcion.slug);
                        return (
                          <li key={opcion.slug}>
                            <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded-md group">
                              <input
                                type="checkbox"
                                className="form-checkbox h-3.5 w-3.5 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-offset-0 dark:focus:ring-offset-gray-800 bg-transparent"
                                checked={isChecked}
                                onChange={() => handleFilterChange(categoria.key, opcion.slug)}
                              />
                              <span className={`text-xs ${isChecked ? "font-medium text-primary" : "text-textPrimary group-hover:text-primary"}`}>
                                {getNombreFiltro(categoria.key, opcion.slug)}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {categoria.options.length > currentVisibleCount && (
                      <button onClick={() => toggleShowMoreInCategory(categoria.key)} className="text-xs text-primary hover:underline mt-1.5 px-1">
                        {`Mostrar ${categoria.options.length - currentVisibleCount} más`}
                      </button>
                    )}
                    {currentVisibleCount > ITEMS_PER_PAGE_INITIAL_CATEGORY && categoria.options.length >= ITEMS_PER_PAGE_INITIAL_CATEGORY && (
                      <button
                        onClick={() => toggleShowMoreInCategory(categoria.key)}
                        className="text-xs text-primary hover:underline mt-1.5 px-1 ml-2"
                      >
                        Mostrar menos
                      </button>
                    )}
                    {categoria.options.length === 0 && <p className="text-xs text-gray-400 px-1 italic">No hay opciones en esta categoría.</p>}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1 py-2">No hay categorías de filtro disponibles en este momento.</p>
            )}
          </div>
        </div>
      </aside>
    );
  }, [
    availableFilterOptions,
    parsedFiltersFromUrl,
    globalSearchTerm,
    searchResults,
    visibleCountsPerCategory,
    totalFiltrosActivosGeneral,
    isLoadingDynamicNav, // Nueva dependencia
    errorDynamicNav, // Nueva dependencia
    fetchDynamicNavItems, // Nueva dependencia
    clearAllFilters,
    handleGlobalSearchChange,
    handleFilterChange,
    toggleShowMoreInCategory,
    getNombreFiltro,
  ]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8 pt-8 md:pt-8 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="md:hidden mb-4 px-2">
        <button
          onClick={() => setIsFilterPanelOpenMobile((prev) => !prev)}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-textPrimary bg-background hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <DynamicIcon name="Filter" className="w-5 h-5 mr-2" />
          {isFilterPanelOpenMobile ? "Ocultar Filtros" : `Mostrar Filtros ${totalFiltrosActivosGeneral > 0 ? `(${totalFiltrosActivosGeneral})` : ""}`}
        </button>
      </div>

      {isFilterPanelOpenMobile && <div className="md:hidden mb-6 px-2">{renderFilterPanel()}</div>}

      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block">{renderFilterPanel()}</div>

        <main className="flex-1 md:pl-4 lg:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-textPrimary text-center md:text-left px-2 md:px-0">
            Explora Nuestros Diseños
          </h1>
          <div className="mb-4 sm:mb-6 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mx-2 md:mx-0">
            {totalFiltrosActivosGeneral > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1.5 items-center">
                <span className="text-xs font-medium mr-1 text-textSecondary">Activos:</span>
                {Object.entries(parsedFiltersFromUrl).map(([tipo, slugs]) =>
                  (slugs ?? []).map((slug) => (
                    <span
                      key={`${tipo}-${slug}`}
                      className="flex items-center bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-[0.7rem] font-semibold px-2 py-0.5 rounded-full"
                    >
                      {getNombreFiltro(tipo, slug)}
                      <button
                        onClick={() => handleFilterChange(tipo, slug)}
                        className="ml-1 -mr-0.5 p-0.5 rounded-full hover:bg-primary/30 dark:hover:bg-primary/40"
                        aria-label={`Remover filtro ${getNombreFiltro(tipo, slug)}`}
                      >
                        <DynamicIcon name="X" className="sm:size-3 size-4 cursor-pointer" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            ) : isLoadingDynamicNav && availableFilterOptions.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Cargando opciones de filtro...</p>
            ) : !isLoadingDynamicNav && availableFilterOptions.length > 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona filtros para refinar tu búsqueda o explora todos los diseños.</p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No hay filtros disponibles o error al cargarlos. Explora todos nuestros diseños.
              </p>
            )}
          </div>

          {!todasLasUnas || todasLasUnas.length === 0 ? (
            <div className="text-center py-12 px-2 md:px-0">
              <DynamicIcon name="PackageOpen" size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary mb-2">Aún no hay diseños disponibles</h2>
              <p className="text-base text-gray-500 dark:text-gray-400">
                Estamos trabajando para añadir nuevo contenido. ¡Por favor, vuelve más tarde!
              </p>
            </div>
          ) : displayedNails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 sm:gap-6 px-2 md:px-0">
              {displayedNails.map((una) => {
                const areTagsExpanded = !!expandedTags[una.id];
                const allCardTagsWithType = [];

                // Generar tags para la tarjeta basados en availableFilterOptions (que ahora es dinámico)
                // y las propiedades del objeto 'una' (ej. una.servicios, una.colores)
                availableFilterOptions.forEach((filterCat) => {
                  const unaPropertyKey = filterCat.key; // ej: "servicios", "colores"
                  if (una[unaPropertyKey] && Array.isArray(una[unaPropertyKey])) {
                    una[unaPropertyKey].forEach((tagSlug) => {
                      // Encontrar el nombre original de la subcategoría para mostrar
                      const subCategoriaOriginal = filterCat.options.find((opt) => opt.slug === tagSlug);
                      if (subCategoriaOriginal) {
                        allCardTagsWithType.push({
                          type: unaPropertyKey, // El filterTypeKey, ej: "servicios"
                          slug: tagSlug, // El slug de la subcategoría, ej: "manicura-tradicional"
                          text: capitalizeWords(subCategoriaOriginal.nombre), // Nombre capitalizado de la subcategoría
                        });
                      }
                    });
                  }
                });

                const tagsToDisplay = areTagsExpanded ? allCardTagsWithType : allCardTagsWithType.slice(0, MAX_VISIBLE_TAGS_ON_CARD);
                const hiddenCardTagsCount = allCardTagsWithType.length - tagsToDisplay.length;

                return (
                  <div
                    key={una.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-2xl"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={una.imagen ?? "https://via.placeholder.com/350x250?text=Nail+Art"}
                        alt={una.nombre}
                        className="w-full h-64 sm:h-56 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                    </div>

                    <div className="px-4 pb-6 pt-4 flex flex-col flex-grow">
                      <div className="w-full flex flex-row">
                        <div className="flex-grow flex">
                          <h3 className="font-semibold text-lg text-pretty text-gray-900 dark:text-white mb-1.5 group-hover:text-primary transition-colors duration-300">
                            {capitalizeWords(una.nombre)}
                          </h3>
                        </div>

                        <div className="w-40 -mr-2 flex flex-col items-end text-gray-500 dark:text-gray-400 mb-2 pr-2">
                          {una.oferta && una.oferta.trim() !== "" ? (
                            <>
                              <span className="text-sm line-through text-gray-400 dark:text-gray-500">{una.precio}</span>
                              <span className="text-xl font-bold text-primary flex items-center">
                                {una.oferta}
                                <DynamicIcon name="Tag" className="size-4 ml-1 text-red-500 dark:text-red-400" />
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-medium text-primary dark:text-primary-light flex items-center">
                              {una.precio}
                              <DynamicIcon name="Tag" className="size-4 sm:size-3 inline ml-2 opacity-70" />
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                            {una.duracion}
                            <DynamicIcon name="Clock" className="size-3.5 inline ml-1.5 opacity-70" />
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">{una.descripcion}</p>

                      {allCardTagsWithType.length > 0 && (
                        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700/60">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {tagsToDisplay.map((tag, index) => {
                              const tagStyle = TAG_COLORS[tag.type] ?? TAG_COLORS.default;
                              return (
                                <button
                                  key={`${una.id}-tag-${tag.slug}-${index}`}
                                  onClick={() => handleCardTagClick(tag.type, tag.slug)}
                                  title={`Filtrar por ${tag.text}`}
                                  className={`cursor-pointer text-[0.7rem] sm:text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${tagStyle.bg} ${tagStyle.text} ${tagStyle.hoverBg}`}
                                >
                                  {tag.text}
                                </button>
                              );
                            })}
                            {!areTagsExpanded && hiddenCardTagsCount > 0 && (
                              <button
                                onClick={() => toggleCardTags(una.id)}
                                title="Mostrar más etiquetas"
                                className={`cursor-pointer text-[0.7rem] sm:text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${TAG_COLORS.default.bg} ${TAG_COLORS.default.text} ${TAG_COLORS.default.hoverBg}`}
                              >
                                +{hiddenCardTagsCount} más
                              </button>
                            )}
                            {areTagsExpanded && allCardTagsWithType.length > MAX_VISIBLE_TAGS_ON_CARD && (
                              <button
                                onClick={() => toggleCardTags(una.id)}
                                title="Mostrar menos etiquetas"
                                className={`text-[0.7rem] sm:text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${TAG_COLORS.default.bg} ${TAG_COLORS.default.text} ${TAG_COLORS.default.hoverBg}`}
                              >
                                Mostrar menos
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-2 md:px-0">
              <DynamicIcon name="Inbox" size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">No se encontraron diseños.</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1.5">
                {globalSearchTerm
                  ? `Prueba con otro término de búsqueda o revisa los filtros activos.`
                  : totalFiltrosActivosGeneral > 0
                  ? "Intenta ajustar tus filtros o "
                  : "Parece que no hay diseños que coincidan. ¡Explora otras opciones!"}
                {totalFiltrosActivosGeneral > 0 && (
                  <button onClick={clearAllFilters} className="text-primary underline">
                    limpia todos los filtros
                  </button>
                )}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Explorar;
