import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DynamicIcon } from "../utils/DynamicIcon";
import useStoreNails from "../store/store";
import CRLoader from "../components/UI/CRLoader";
import Paginador from "../components/UI/Paginador";
import useApiRequest from "../hooks/useApiRequest";
import CRInput from "../components/UI/CRInput";
import CRButton from "../components/UI/CRButton";

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
const ITEMS_PER_PAGE_EXPLORAR = 9; // Diseños por página en explorar

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
  const { TAG_COLORS, dynamicNavItems, isLoadingDynamicNav: isLoadingNavItemsStore, errorDynamicNav, fetchDynamicNavItems } = useStoreNails();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Para el input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Para la API
  const [isFakeLoadingSearch, setIsFakeLoadingSearch] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const availableFilterOptions = useMemo(() => getDynamicFilterCategories(dynamicNavItems), [dynamicNavItems]);
  const initialVisibleCountsCalculated = useMemo(
    () => getInitialVisibleCounts(availableFilterOptions, ITEMS_PER_PAGE_INITIAL_CATEGORY),
    [availableFilterOptions]
  );

  const parsedFiltersFromUrl = useMemo(() => parseFiltersFromUrl(location.search, availableFilterOptions), [location.search, availableFilterOptions]);

  const {
    data: apiData,
    isLoading: isLoadingApiDisenios,
    error: errorApiDisenios,
    refetch: refetchApiDisenios,
  } = useApiRequest({
    // queryKey se genera dinámicamente en useApiRequest basado en url y params
    url: "/disenios",
    method: "GET",
    config: {
      params: {
        page: currentPage,
        limit: ITEMS_PER_PAGE_EXPLORAR,
        search: debouncedSearchTerm,
        ...parsedFiltersFromUrl, // Enviar filtros al backend
      },
    },
    options: {
      keepPreviousData: true, // Para una mejor UX en paginación
      enabled: !isLoadingNavItemsStore, // No hacer fetch hasta que los nav items (filtros) estén listos
    },
    notificationEnabled: false,
  });

  const diseniosFromApi = apiData?.disenios ?? [];
  const totalPages = apiData?.totalPages ?? 1;

  // Los filtros de categoría se aplican en el frontend sobre los datos ya paginados/buscados por el backend
  const displayedNails = useMemo(
    () => calculateDisplayedNails(diseniosFromApi, parsedFiltersFromUrl, availableFilterOptions),
    [diseniosFromApi, parsedFiltersFromUrl, availableFilterOptions]
  );

  const [isFilterPanelOpenMobile, setIsFilterPanelOpenMobile] = useState(false);
  const [globalSearchTermFilters, setGlobalSearchTermFilters] = useState(""); // Para el buscador de filtros
  const [visibleCountsPerCategory, setVisibleCountsPerCategory] = useState(initialVisibleCountsCalculated);
  const [expandedTags, setExpandedTags] = useState({});

  useEffect(() => {
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
  }, [initialVisibleCountsCalculated]);

  useEffect(() => {
    // Cuando cambian los filtros o el término de búsqueda, volver a la página 1
    setCurrentPage(1);
  }, [debouncedSearchTerm, location.search]);

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    setIsFakeLoadingSearch(true);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setIsFakeLoadingSearch(false);
    }, 500);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

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
    setSearchTerm(""); // Limpiar input de búsqueda principal
    setDebouncedSearchTerm(""); // Limpiar término de búsqueda para API
    setGlobalSearchTermFilters(""); // Limpiar input de búsqueda de filtros
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
    setExpandedTags({});
    setCurrentPage(1);
  }, [navigate, location.pathname, initialVisibleCountsCalculated]);

  const getNombreFiltro = useCallback((tipoKey, slug) => getNombreFiltroFromSlug(availableFilterOptions, tipoKey, slug), [availableFilterOptions]);

  const totalFiltrosActivosGeneral = useMemo(() => calculateTotalFiltrosActivos(parsedFiltersFromUrl), [parsedFiltersFromUrl]);

  const handleGlobalSearchFiltersChange = (e) => {
    setGlobalSearchTermFilters(e.target.value);
  };

  const searchResultsFilters = useMemo(
    () => performGlobalFilterSearch(globalSearchTermFilters, availableFilterOptions),
    [globalSearchTermFilters, availableFilterOptions]
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
    if (isLoadingNavItemsStore && availableFilterOptions.length === 0) {
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
              value={globalSearchTermFilters}
              onChange={handleGlobalSearchFiltersChange}
              className="w-full pl-8 pr-2 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-background dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <DynamicIcon name="Search" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            {globalSearchTermFilters.trim() ? (
              searchResultsFilters.length > 0 ? (
                searchResultsFilters.map((categoryResult) => {
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
                <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1 py-2">
                  No se encontraron filtros para "{globalSearchTermFilters}".
                </p>
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
    globalSearchTermFilters,
    searchResultsFilters,
    visibleCountsPerCategory,
    totalFiltrosActivosGeneral,
    isLoadingNavItemsStore,
    errorDynamicNav,
    fetchDynamicNavItems,
    clearAllFilters,
    handleGlobalSearchFiltersChange,
    handleFilterChange,
    toggleShowMoreInCategory,
    getNombreFiltro,
  ]);

  return (
    <div className="container mx-auto px-2 sm:px-4  min-h-screen bg-gray-100 dark:bg-gray-900">
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
          <div className="mb-4 sm:mb-3 p-3 bg-white/50 dark:bg-gray-800 rounded-lg shadow-sm mx-2 md:mx-0">
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
            ) : isLoadingNavItemsStore && availableFilterOptions.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Cargando opciones de filtro...</p>
            ) : !isLoadingNavItemsStore && availableFilterOptions.length > 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Prueba seleccionando un filtro o también puedes usar el buscador.</p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No hay filtros disponibles o error al cargarlos. Explora todos nuestros diseños.
              </p>
            )}
          </div>
          <div className="mb-6 px-2 md:px-0">
            <CRInput
              title="Busca diseños por algún nombre o descripción"
              type="text"
              placeholder="Ej. Flores, Ojo de gato, Acrílicas..."
              value={searchTerm}
              setValue={handleSearchInputChange}
              className="text-sm py-2.5 !pr-10"
            />
            {isFakeLoadingSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-[11px]">
                <DynamicIcon name="Loader2" className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          {isLoadingApiDisenios && !apiData ? (
            <CRLoader text="Cargando diseños..." fullScreen={false} style="circle" size="lg" />
          ) : errorApiDisenios ? (
            <div className="text-center py-12 px-2 md:px-0">
              <DynamicIcon name="ServerCrash" size={48} className="mx-auto text-red-500 dark:text-red-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-300 mb-2">Error al Cargar Diseños</h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
                {errorApiDisenios.message || "No se pudieron obtener los diseños del servidor."}
              </p>
              <CRButton title="Reintentar" onClick={refetchApiDisenios} className="!bg-red-500 !text-white" />
            </div>
          ) : displayedNails.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 sm:gap-6 px-2 md:px-0">
                {displayedNails.map((una) => {
                  const areTagsExpanded = !!expandedTags[una.id];
                  const allCardTagsWithType = [];
                  availableFilterOptions.forEach((filterCat) => {
                    const unaPropertyKey = filterCat.key;
                    if (una[unaPropertyKey] && Array.isArray(una[unaPropertyKey])) {
                      una[unaPropertyKey].forEach((tagSlug) => {
                        const subCategoriaOriginal = filterCat.options.find((opt) => opt.slug === tagSlug);
                        if (subCategoriaOriginal) {
                          allCardTagsWithType.push({
                            type: unaPropertyKey,
                            slug: tagSlug,
                            text: capitalizeWords(subCategoriaOriginal.nombre),
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
                          src={una.imagen_url ?? "https://via.placeholder.com/350x250?text=Nail+Art"}
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
                            {una.oferta && una.oferta.toString().trim() !== "" ? (
                              <>
                                <span className="text-sm line-through text-gray-400 dark:text-gray-500">{`Q${parseFloat(una.precio).toFixed(
                                  2
                                )}`}</span>
                                <span className="text-xl font-bold text-primary flex items-center">
                                  {`Q${parseFloat(una.oferta).toFixed(2)}`}
                                  <DynamicIcon name="Tag" className="size-4 ml-1 text-red-500 dark:text-red-400" />
                                </span>
                              </>
                            ) : una.precio ? (
                              <span className="text-xl font-medium text-primary dark:text-primary-light flex items-center">
                                {`Q${parseFloat(una.precio).toFixed(2)}`}
                                <DynamicIcon name="Tag" className="size-4 sm:size-3 inline ml-2 opacity-70" />
                              </span>
                            ) : null}
                            {una.duracion && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                {una.duracion}
                                <DynamicIcon name="Clock" className="size-3.5 inline ml-1.5 opacity-70" />
                              </span>
                            )}
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
              <Paginador currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="text-center py-12 px-2 md:px-0">
              <DynamicIcon name="Inbox" size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">No se encontraron diseños.</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1.5">
                {searchTerm
                  ? `Prueba con otro término de búsqueda o revisa los filtros activos.`
                  : totalFiltrosActivosGeneral > 0
                  ? "Intenta ajustar tus filtros o "
                  : "Parece que no hay diseños que coincidan. ¡Explora otras opciones!"}
                {totalFiltrosActivosGeneral > 0 && (
                  <button onClick={clearAllFilters} className="text-primary underline ml-1">
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
