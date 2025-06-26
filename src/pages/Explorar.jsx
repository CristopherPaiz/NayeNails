import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DynamicIcon } from "../utils/DynamicIcon";
import useStoreNails from "../store/store";
import CRLoader from "../components/UI/CRLoader";
import Paginador from "../components/UI/Paginador";
import useApiRequest from "../hooks/useApiRequest";
import CRInput from "../components/UI/CRInput";
import CRButton from "../components/UI/CRButton";
import CRModal from "../components/UI/CRModal";
import CRAlert from "../components/UI/CRAlert";

import { capitalizeWords } from "../utils/textUtils";
import {
  getInitialVisibleCounts,
  parseFiltersFromUrl,
  getNombreFiltroFromSlug,
  calculateTotalFiltrosActivos,
  performGlobalFilterSearch,
} from "../utils/filterUtils";
import useScrollToTop from "../hooks/useScrollToTop";

const ITEMS_PER_PAGE_INITIAL_CATEGORY = 4;
const MAX_VISIBLE_TAGS_ON_CARD = 3;
const ITEMS_PER_PAGE_EXPLORAR = 12;
const TUTORIAL_LOCAL_STORAGE_KEY = "explorarTutorialShownCount";
const MAX_TUTORIAL_SHOWS = 1;

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
  useScrollToTop();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const { TAG_COLORS, dynamicNavItems, isLoadingDynamicNav: isLoadingNavItemsStore, errorDynamicNav, fetchDynamicNavItems } = useStoreNails();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isFakeLoadingSearch, setIsFakeLoadingSearch] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNailForModal, setSelectedNailForModal] = useState(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobileForTutorial, setIsMobileForTutorial] = useState(false);
  const tutorialTimerRef = useRef(null);
  const tutorialVisibilityTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => window.innerWidth < 768;
    setIsMobileForTutorial(checkMobile());
    const handleResize = () => {
      const mobileStatus = checkMobile();
      setIsMobileForTutorial(mobileStatus);
      if (!mobileStatus && showTutorial) {
        setShowTutorial(false);
        if (tutorialTimerRef.current) clearTimeout(tutorialTimerRef.current);
        if (tutorialVisibilityTimerRef.current) clearTimeout(tutorialVisibilityTimerRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showTutorial]);

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
    url: "/disenios",
    method: "GET",
    config: {
      params: {
        page: currentPage,
        limit: ITEMS_PER_PAGE_EXPLORAR,
        search: debouncedSearchTerm,
        ...parsedFiltersFromUrl,
      },
    },
    queryKey: ["diseniosExplorar", currentPage, debouncedSearchTerm, JSON.stringify(parsedFiltersFromUrl)],
    options: { enabled: !isLoadingNavItemsStore },
    notificationEnabled: false,
  });

  const diseniosFromApi = apiData?.disenios ?? [];
  const totalPagesApi = apiData?.totalPages ?? 1;
  const displayedNails = diseniosFromApi;

  const openDetailModal = (nailDesign) => {
    if (!nailDesign) return;
    console.log("Abriendo modal de detalle, navegando a URL con ID");
    navigate(`/explorar-unas/${nailDesign.id}${location.search}`);
    setSelectedNailForModal(nailDesign);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    console.log("Cerrando modal de detalle");
    // Detectamos si venimos de una URL directa o si hay historial
    const hasHistory = window.history.length > 1;
    console.log("¿Hay historial anterior?", hasHistory);

    if (hasHistory) {
      const baseUrl = `/explorar-unas${location.search}`;
      console.log("Navegando a URL base:", baseUrl);
      navigate(baseUrl, { replace: true });
    } else {
      // Si es una URL directa sin historial, usamos replace para evitar salir
      console.log("URL directa sin historial, reemplazando URL");
      navigate("/explorar-unas", { replace: true });
    }

    setIsDetailModalOpen(false);
    setSelectedNailForModal(null);
  };

  // Y en el efecto que observa cambios en urlId
  useEffect(() => {
    console.log("urlId cambió:", urlId);
    console.log("Longitud del historial:", window.history.length);

    if (urlId) {
      const nailToOpen = displayedNails.find((n) => n.id.toString() === urlId);
      if (nailToOpen) {
        console.log("Encontrado diseño para ID en URL, abriendo modal");
        setSelectedNailForModal(nailToOpen);
        setIsDetailModalOpen(true);
      } else if (displayedNails.length > 0) {
        console.log("ID en URL no encontrado, redirigiendo a URL base");
        navigate(`/explorar-unas${location.search}`, { replace: true });
      }
    } else {
      console.log("No hay ID en URL, cerrando modal si estaba abierto");
      setIsDetailModalOpen(false);
    }
  }, [urlId, displayedNails, navigate, location.search]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tutorialTimerRef.current) clearTimeout(tutorialTimerRef.current);
    if (tutorialVisibilityTimerRef.current) clearTimeout(tutorialVisibilityTimerRef.current);

    const tutorialCount = parseInt(localStorage.getItem(TUTORIAL_LOCAL_STORAGE_KEY) || "0", 10);

    if (
      isMobileForTutorial &&
      tutorialCount < MAX_TUTORIAL_SHOWS &&
      displayedNails &&
      displayedNails.length > 0 &&
      !isLoadingApiDisenios &&
      !showTutorial
    ) {
      tutorialTimerRef.current = setTimeout(() => {
        setShowTutorial(true);
        localStorage.setItem(TUTORIAL_LOCAL_STORAGE_KEY, (tutorialCount + 1).toString());
        tutorialVisibilityTimerRef.current = setTimeout(() => {
          setShowTutorial(false);
        }, 2000);
      }, 300);
    }

    return () => {
      if (tutorialTimerRef.current) clearTimeout(tutorialTimerRef.current);
      if (tutorialVisibilityTimerRef.current) clearTimeout(tutorialVisibilityTimerRef.current);
    };
  }, [isMobileForTutorial, displayedNails, isLoadingApiDisenios, showTutorial]);

  const [isFilterPanelOpenMobile, setIsFilterPanelOpenMobile] = useState(false);
  const [globalSearchTermFilters, setGlobalSearchTermFilters] = useState("");
  const [visibleCountsPerCategory, setVisibleCountsPerCategory] = useState(initialVisibleCountsCalculated);
  const [expandedTags, setExpandedTags] = useState({});

  useEffect(() => {
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
  }, [initialVisibleCountsCalculated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, location.search]);

  useEffect(() => {
    if (!isLoadingApiDisenios && apiData) {
      if (totalPagesApi === 0 && currentPage !== 1) {
        setCurrentPage(1);
      } else if (currentPage > totalPagesApi && totalPagesApi > 0) {
        setCurrentPage(1);
      }
    }
  }, [apiData, isLoadingApiDisenios, currentPage, totalPagesApi]);

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
      const newSearch = currentParams.toString();
      const newPath = urlId ? `/explorar-unas/${urlId}` : "/explorar-unas";
      navigate(`${newPath}?${newSearch}`, { replace: true });
    },
    [navigate, location.search, urlId]
  );

  const clearAllFilters = useCallback(() => {
    navigate("/explorar-unas", { replace: true });
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setGlobalSearchTermFilters("");
    setVisibleCountsPerCategory(initialVisibleCountsCalculated);
    setExpandedTags({});
    setCurrentPage(1);
    setIsFilterPanelOpenMobile(false);
  }, [navigate, initialVisibleCountsCalculated]);

  const getNombreFiltro = useCallback((tipoKey, slug) => getNombreFiltroFromSlug(availableFilterOptions, tipoKey, slug), [availableFilterOptions]);
  const totalFiltrosActivosGeneral = useMemo(() => calculateTotalFiltrosActivos(parsedFiltersFromUrl), [parsedFiltersFromUrl]);
  const handleGlobalSearchFiltersChange = (e) => setGlobalSearchTermFilters(e.target.value);
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
  const toggleCardTags = useCallback((cardId) => setExpandedTags((prev) => ({ ...prev, [cardId]: !prev[cardId] })), []);
  const handleCardTagClick = useCallback(
    (filterTypeKey, filterValueSlug) => {
      const newParams = new URLSearchParams();
      newParams.append(filterTypeKey, filterValueSlug);
      navigate(`/explorar-unas?${newParams.toString()}`, { replace: true });
      setIsFilterPanelOpenMobile(false);
      window.scrollTo(0, 0);
    },
    [navigate]
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderFilterPanelContent = useCallback(() => {
    if (isLoadingNavItemsStore && availableFilterOptions.length === 0) {
      return <CRLoader text="Cargando filtros..." style="nailPaint" size="md" />;
    }
    if (errorDynamicNav && availableFilterOptions.length === 0) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
          <DynamicIcon name="AlertTriangle" className="mx-auto text-red-500 w-8 h-8 mb-2" />
          <p className="text-sm text-red-700 dark:text-red-300">Error al cargar filtros.</p>
          <CRButton title="Reintentar" onClick={fetchDynamicNavItems} className="mt-2 !bg-red-500 !text-white text-xs py-1 px-2" />
        </div>
      );
    }
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white flex items-center">
            <DynamicIcon name="SlidersHorizontal" className="w-5 h-5 mr-2 text-primary" />
            Filtros
          </h2>
          <div className="flex items-center gap-2">
            {totalFiltrosActivosGeneral > 0 && (
              <button onClick={clearAllFilters} className="text-xs font-medium text-primary hover:underline">
                Limpiar
              </button>
            )}
            <button onClick={() => setIsFilterPanelOpenMobile(false)} className="md:hidden text-textPrimary dark:text-white">
              <DynamicIcon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar filtros..."
            value={globalSearchTermFilters}
            onChange={handleGlobalSearchFiltersChange}
            className="w-full pl-8 pr-2 py-2 text-sm border-black dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-background dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <DynamicIcon name="Search" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="overflow-y-auto pr-1">
          {globalSearchTermFilters.trim() ? (
            searchResultsFilters.length > 0 ? (
              searchResultsFilters.map((categoryResult) => {
                const filtrosActivosEnEstaCategoria = parsedFiltersFromUrl[categoryResult.key] ?? [];
                return (
                  <div key={categoryResult.key} className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3 first:pt-0 first:border-t-0">
                    <h3 className="font-semibold text-textSecondary dark:text-gray-300 mb-1.5 flex items-center text-xs uppercase tracking-wider">
                      {categoryResult.icon && (
                        <DynamicIcon name={categoryResult.icon} className="w-3.5 h-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                      )}
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
                              <span
                                className={`text-xs ${
                                  isChecked ? "font-medium text-primary" : "text-textPrimary dark:text-gray-200 group-hover:text-primary"
                                }`}
                              >
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
              <p className="text-xs text-gray-400 dark:text-gray-500 italic px-1 py-2">No se encontraron filtros para "{globalSearchTermFilters}".</p>
            )
          ) : availableFilterOptions.length > 0 ? (
            availableFilterOptions.map((categoria) => {
              const currentVisibleCount = visibleCountsPerCategory[categoria.key] ?? ITEMS_PER_PAGE_INITIAL_CATEGORY;
              const opcionesAMostrar = categoria.options.slice(0, currentVisibleCount);
              const numFiltrosActivosEnCategoria = (parsedFiltersFromUrl[categoria.key] ?? []).length;

              return (
                <div key={categoria.key} className="mb-5 border-t border-gray-200 dark:border-gray-700 pt-4 first:pt-0 first:border-t-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-textSecondary dark:text-gray-300 flex items-center text-sm">
                      {categoria.icon && <DynamicIcon name={categoria.icon} className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />}
                      {capitalizeWords(categoria.label)}
                    </h3>
                    {numFiltrosActivosEnCategoria > 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono">{numFiltrosActivosEnCategoria}</span>
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
                            <span
                              className={`text-xs ${
                                isChecked ? "font-medium text-primary" : "text-textPrimary dark:text-gray-200 group-hover:text-primary"
                              }`}
                            >
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
                    <button onClick={() => toggleShowMoreInCategory(categoria.key)} className="text-xs text-primary hover:underline mt-1.5 px-1 ml-2">
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
      </>
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
    <>
      {showTutorial && isMobileForTutorial && displayedNails.length > 0 && <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" />}
      <div className="container mx-auto px-7 sm:px-6 pb-16 sm:pb-0 pt-6 sm:pt-0 bg-backgroundSecondary dark:bg-background">
        <div
          className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ease-in-out ${
            isFilterPanelOpenMobile ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsFilterPanelOpenMobile(false)}
          aria-hidden="true"
        ></div>

        <aside
          className={`fixed top-0 mt-16 sm:mt-0 left-0 w-72 h-full bg-backgroundSecondary pb-20 dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden p-4 overflow-y-auto ${
            isFilterPanelOpenMobile ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderFilterPanelContent()}
        </aside>

        <div className="flex justify-start items-start">
          <aside className="hidden md:block mr-8 max-h-[900px] overflow-auto">
            <div className="p-4 bg-background dark:bg-gray-800 rounded-xl shadow-xl sticky top-20 border border-gray-200 dark:border-gray-700">
              {renderFilterPanelContent()}
            </div>
          </aside>

          <main className="flex-1 md:pl-4 lg:pl-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary dark:text-white text-center md:text-left px-2 md:px-0">
              Nuestros Diseños
            </h1>

            <div className="mb-2 px-2 md:px-0">
              <CRInput
                title="Busca diseños por nombre o descripción..."
                type="text"
                placeholder="Ej: Flores, Ojo de gato, Acrílicas"
                value={searchTerm}
                setValue={handleSearchInputChange}
                className="text-sm py-2.5 !pr-10 bg-background dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              {isFakeLoadingSearch && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-[5px]">
                  <DynamicIcon name="Loader2" className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="md:hidden mb-3 px-2">
              <button
                onClick={() => setIsFilterPanelOpenMobile((prev) => !prev)}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-textPrimary dark:text-white bg-background dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <DynamicIcon name="Filter" className="w-5 h-5 mr-2" />
                {isFilterPanelOpenMobile
                  ? "Ocultar Filtros"
                  : `Mostrar Filtros ${totalFiltrosActivosGeneral > 0 ? `(${totalFiltrosActivosGeneral})` : ""}`}
              </button>
            </div>
            <div className="mb-2 px-1">
              {totalFiltrosActivosGeneral > 0 ? (
                <div>
                  <p className="font-bold text-primary ml-3 sm:ml-2 mb-1">FILTROS ACTIVOS</p>
                  <div className="flex flex-wrap sm:w-fit w-content gap-x-2 gap-y-1.5 items-center bg-background dark:bg-gray-800 rounded-lg shadow-md mx-2 md:mx-0 border border-gray-200 dark:border-gray-700 p-3">
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
                </div>
              ) : isLoadingNavItemsStore && availableFilterOptions.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Cargando opciones de filtro...</p>
              ) : null}
            </div>

            {isLoadingApiDisenios && !apiData ? (
              <CRLoader text="Cargando diseños..." fullScreen={false} style="nailPaint" size="lg" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-0">
                  {displayedNails.map((una, index) => {
                    const areTagsExpanded = !!expandedTags[una.id];
                    const allCardTagsWithType = [];
                    availableFilterOptions.forEach((filterCat) => {
                      const unaPropertyKey = filterCat.key;
                      if (una[unaPropertyKey] && Array.isArray(una[unaPropertyKey])) {
                        una[unaPropertyKey].forEach((tagSlug) => {
                          const subCategoriaOriginal = filterCat.options.find((opt) => opt.slug === tagSlug);
                          if (subCategoriaOriginal) {
                            allCardTagsWithType.push({ type: unaPropertyKey, slug: tagSlug, text: capitalizeWords(subCategoriaOriginal.nombre) });
                          }
                        });
                      }
                    });
                    const tagsToDisplay = areTagsExpanded ? allCardTagsWithType : allCardTagsWithType.slice(0, MAX_VISIBLE_TAGS_ON_CARD);
                    const hiddenCardTagsCount = allCardTagsWithType.length - tagsToDisplay.length;
                    const hasOffer = una.oferta && una.oferta.toString().trim() !== "";
                    const isTutorialTarget = showTutorial && isMobileForTutorial && index === 0;

                    return (
                      <div
                        key={una.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800 shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/20 transition-all duration-300 flex flex-col group overflow-hidden"
                      >
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={
                              una.imagen_url ?? "https://res.cloudinary.com/drdkb6gjx/image/upload/v1748887602/naye_nails/i6btbj3vnaevlbzigaju.svg"
                            }
                            alt={una.nombre}
                            className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 cursor-pointer ${
                              isTutorialTarget ? "relative z-[51]" : ""
                            }`}
                            onClick={() => openDetailModal(una)}
                          />
                          {hasOffer && (
                            <div
                              className={`absolute top-2 right-2 bg-primary text-white text-lg sm:text-sm font-bold px-2.5 py-1 rounded-full shadow-md flex items-center animate-pulse ${
                                isTutorialTarget ? "z-[51]" : ""
                              }`}
                            >
                              <DynamicIcon name="Percent" className="inline-block w-3.5 h-3.5 mr-1" />
                              OFERTA
                            </div>
                          )}

                          {isTutorialTarget && (
                            <div
                              className="absolute inset-0 z-[52] cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTutorial(false);
                                if (tutorialTimerRef.current) clearTimeout(tutorialTimerRef.current);
                                if (tutorialVisibilityTimerRef.current) clearTimeout(tutorialVisibilityTimerRef.current);
                              }}
                            >
                              <div className="absolute bottom-12 sm:bottom-0  top-15 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-1rem)] px-2 py-1 sm:px-3 sm:py-1.5 text-white text-[10px] sm:text-xs rounded-md shadow-lg z-[53] text-center pointer-events-none">
                                <DynamicIcon
                                  name="LucidePointer"
                                  className="w-8 h-8 inset-0 sm:w-10 sm:h-10 text-white drop-shadow-lg animate-finger-press"
                                />
                              </div>
                              <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-1rem)] px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-800 bg-opacity-90 text-white text-sm rounded-md shadow-lg z-[53] text-center pointer-events-none">
                                Toca la imagen para ver más detalles
                              </div>
                            </div>
                          )}

                          {!isTutorialTarget && (
                            <button
                              type="button"
                              onClick={() => openDetailModal(una)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                              aria-label={`Ver detalles de ${una.nombre}`}
                            >
                              <DynamicIcon name="Eye" className="w-10 h-10 text-white/80" />
                            </button>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <h3
                            className="text-lg font-bold leading-tight text-textPrimary dark:text-white group-hover:text-primary transition-colors cursor-pointer mb-1 truncate"
                            onClick={() => {
                              if (!(isTutorialTarget && showTutorial)) {
                                openDetailModal(una);
                              }
                            }}
                            title={capitalizeWords(una.nombre)}
                          >
                            {capitalizeWords(una.nombre)}
                          </h3>

                          <div className="flex items-center justify-between">
                            {una.duracion && (
                              <div className="flex items-center text-xs text-textTertiary dark:text-gray-400">
                                <DynamicIcon name="Clock" className="w-3.5 h-3.5 mr-1 opacity-80" />
                                <span>{una.duracion}</span>
                              </div>
                            )}
                            <div className="text-right">
                              {hasOffer ? (
                                <>
                                  <p className="text-lg font-bold text-red-500 dark:text-red-400">{`Q${parseFloat(una.oferta).toFixed(2)}`}</p>
                                  <p className="text-xs line-through text-textTertiary dark:text-gray-500 -mt-1">{`Q${parseFloat(una.precio).toFixed(
                                    2
                                  )}`}</p>
                                </>
                              ) : una.precio ? (
                                <p className="text-lg font-bold text-primary dark:text-primary-light">{`Q${parseFloat(una.precio).toFixed(2)}`}</p>
                              ) : (
                                <p className="text-xs text-textTertiary italic"></p>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-textSecondary dark:text-gray-300 line-clamp-2 leading-relaxed flex-grow min-h-[2.5rem]">
                            {una.descripcion || "Un diseño espectacular para lucir uñas increíbles."}
                          </p>

                          {allCardTagsWithType.length > 0 && (
                            <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
                              <div className="flex flex-wrap gap-1 items-center">
                                {tagsToDisplay.map((tag, idx) => {
                                  const tagStyle = TAG_COLORS[tag.type] ?? TAG_COLORS.default;
                                  return (
                                    <button
                                      key={`${una.id}-tag-${tag.slug}-${idx}`}
                                      onClick={() => handleCardTagClick(tag.type, tag.slug)}
                                      title={`Filtrar por ${tag.text}`}
                                      className={`cursor-pointer text-[0.6rem] font-medium px-1.5 py-0.5 rounded-md transition-all duration-200 hover:brightness-110 ${tagStyle.bg} ${tagStyle.text}`}
                                    >
                                      {tag.text}
                                    </button>
                                  );
                                })}
                                {!areTagsExpanded && hiddenCardTagsCount > 0 && (
                                  <button
                                    onClick={() => toggleCardTags(una.id)}
                                    title="Mostrar más etiquetas"
                                    className={`cursor-pointer text-[0.6rem] font-medium px-1.5 py-0.5 rounded-md transition-all duration-200 hover:brightness-110 ${TAG_COLORS.default.bg} ${TAG_COLORS.default.text}`}
                                  >
                                    +{hiddenCardTagsCount}
                                  </button>
                                )}
                                {areTagsExpanded && allCardTagsWithType.length > MAX_VISIBLE_TAGS_ON_CARD && (
                                  <button
                                    onClick={() => toggleCardTags(una.id)}
                                    title="Mostrar menos etiquetas"
                                    className={`text-[0.6rem] font-medium px-1.5 py-0.5 rounded-md transition-all duration-200 hover:brightness-110 ${TAG_COLORS.default.bg} ${TAG_COLORS.default.text}`}
                                  >
                                    Menos
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
                <Paginador currentPage={currentPage} totalPages={totalPagesApi} onPageChange={handlePageChange} />
              </>
            ) : (
              <div className="text-center py-12 px-2 md:px-0">
                <DynamicIcon name="SearchX" size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-xl text-gray-500 dark:text-gray-400">No se encontraron diseños.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
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

        {selectedNailForModal && (
          <CRModal
            isOpen={isDetailModalOpen}
            setIsOpen={setIsDetailModalOpen}
            onClose={closeDetailModal}
            title={
              <span className="flex items-center">
                <DynamicIcon name="Sparkles" className="w-5 h-5 mr-2 text-primary" />
                {capitalizeWords(selectedNailForModal.nombre)}
              </span>
            }
            modifiesURL={true}
            width={typeof window !== "undefined" && window.innerWidth < 768 ? 95 : 60}
          >
            <div className="p-1 sm:p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <img
                  src={selectedNailForModal.imagen_url}
                  alt={selectedNailForModal.nombre}
                  className="w-full aspect-square object-cover rounded-lg shadow-lg"
                />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-textPrimary dark:text-white mb-1">{capitalizeWords(selectedNailForModal.nombre)}</h3>
                    <p className="text-textSecondary dark:text-gray-300 text-sm leading-relaxed">
                      {selectedNailForModal.descripcion || "Descripción detallada no disponible."}
                    </p>
                  </div>

                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2.5 pr-3 font-medium text-textTertiary dark:text-gray-400 w-1/3">
                          <DynamicIcon name="CircleDollarSign" className="inline w-4 h-4 mr-2 opacity-70" />
                          Precio:
                        </td>
                        <td className="py-2.5 text-textPrimary dark:text-white">
                          {selectedNailForModal.precio ? (
                            `Q${parseFloat(selectedNailForModal.precio).toFixed(2)}`
                          ) : (
                            <span className="italic">Consultar</span>
                          )}
                        </td>
                      </tr>
                      {selectedNailForModal.oferta && selectedNailForModal.oferta.toString().trim() !== "" && (
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-2.5 pr-3 font-medium text-textTertiary dark:text-gray-400">
                            <DynamicIcon name="BadgePercent" className="inline w-4 h-4 mr-2 text-red-500" />
                            Oferta:
                          </td>
                          <td className="py-2.5 text-red-500 dark:text-red-400 font-bold">
                            {`Q${parseFloat(selectedNailForModal.oferta).toFixed(2)}`}
                          </td>
                        </tr>
                      )}
                      {selectedNailForModal.duracion && (
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-2.5 pr-3 font-medium text-textTertiary dark:text-gray-400">
                            <DynamicIcon name="Clock" className="inline w-4 h-4 mr-2 opacity-70" />
                            Duración:
                          </td>
                          <td className="py-2.5 text-textPrimary dark:text-white">{selectedNailForModal.duracion}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2.5 pr-3 font-medium text-textTertiary dark:text-gray-400 align-top">
                          <DynamicIcon name="Tags" className="inline w-4 h-4 mr-2 opacity-70 mt-0.5" />
                          Etiquetas:
                        </td>
                        <td className="py-2.5 text-textPrimary dark:text-white">
                          <div className="flex flex-wrap gap-1.5">
                            {availableFilterOptions.map((filterCat) => {
                              const unaPropertyKey = filterCat.key;
                              if (selectedNailForModal[unaPropertyKey] && Array.isArray(selectedNailForModal[unaPropertyKey])) {
                                return selectedNailForModal[unaPropertyKey].map((tagSlug) => {
                                  const subCategoriaOriginal = filterCat.options.find((opt) => opt.slug === tagSlug);
                                  if (subCategoriaOriginal) {
                                    const tagStyle = TAG_COLORS[filterCat.key] ?? TAG_COLORS.default;
                                    return (
                                      <span
                                        key={`${filterCat.key}-${tagSlug}-modal-detail`}
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagStyle.bg} ${tagStyle.text}`}
                                      >
                                        {capitalizeWords(subCategoriaOriginal.nombre)}
                                      </span>
                                    );
                                  }
                                  return null;
                                });
                              }
                              return null;
                            })}
                            {availableFilterOptions.every((fc) => !selectedNailForModal[fc.key] || selectedNailForModal[fc.key].length === 0) && (
                              <span className="text-xs italic text-textTertiary dark:text-gray-500">Sin etiquetas adicionales.</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CRModal>
        )}
      </div>
    </>
  );
};

export default Explorar;
