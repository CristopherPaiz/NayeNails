// src/pages/Explorar.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DynamicIcon } from "../utils/DynamicIcon";
import { NAV_ITEMS } from "../constants/navbar";

// --- DATOS DE EJEMPLO ---
const todasLasUnas = [
  {
    id: 1,
    nombre: "Manicura Tradicional Roja y Francesa",
    servicios: ["manicura-tradicional", "disenos-personalizados"],
    colores: ["rojo", "blanco-puro"],
    efectos: [],
    imagen: "https://hips.hearstapps.com/hmg-prod/images/saveclip-app-447253732-18266870164224106-8409522755200379066-n-6751e53a212af.jpg",
    descripcion: "Una hermosa combinación clásica con un toque francés elegante.",
    precio: "Q25",
    duracion: "45 min",
  },
  {
    id: 2,
    nombre: "Acrílicas Ojo de Gato Azul y 3D Plata",
    servicios: ["unas-acrilicas"],
    colores: ["azul-profundo", "plata"],
    efectos: ["ojo-de-gato", "3d"],
    imagen: "https://media.glamour.mx/photos/666cbc04486c89a986c40c35/1:1/w_2000,h_2000,c_limit/un%CC%83as-efecto-ojo-de-gato.jpg",
    descripcion: "Impactantes uñas acrílicas con efecto ojo de gato y detalles 3D.",
    precio: "Q55",
    duracion: "1h 30min",
  },
  {
    id: 3,
    nombre: "Polygel Nude con Efecto Sugar",
    servicios: ["polygel"],
    colores: ["tonos-nude"],
    efectos: ["efecto-sugar"],
    imagen: "https://i.pinimg.com/736x/07/6c/03/076c0381824d36e87f338b2b32ab1723.jpg",
    descripcion: "Elegancia sutil con la textura única del efecto sugar.",
    precio: "Q40",
    duracion: "1h",
  },
  {
    id: 4,
    nombre: "Semipermanente Metálico y Glitter",
    servicios: ["esmalte-semipermanente"],
    colores: ["metalicos", "glitters"],
    efectos: [],
    imagen: "https://i.pinimg.com/474x/e3/bd/60/e3bd6091063a98a9ff181cbbc3a1bb9a.jpg",
    descripcion: "Brillo y glamour con acabados metálicos y destellos de glitter.",
    precio: "Q30",
    duracion: "50 min",
  },
  {
    id: 5,
    nombre: "Manicura Rusa Pastel con Diseño Floral",
    servicios: ["manicura-rusa", "disenos-personalizados"],
    colores: ["pasteles"],
    efectos: [],
    imagen: "https://semilac.es/media/catalog/product/cache/67d9e1c93bb19887b3b9eeb5a5253fad/s/t/stylizacja_071.jpg",
    descripcion: "Delicadeza y arte en tus uñas con tonos pastel y diseño floral.",
    precio: "Q35",
    duracion: "1h 15min",
  },
  {
    id: 6,
    nombre: "Uñas en Gel Neón y Clásicas",
    servicios: ["unas-en-gel"],
    colores: ["neon", "clasicos"],
    efectos: [],
    imagen: "https://i.pinimg.com/564x/14/b2/c6/14b2c6d9fa6e74e5f5b24aa8bc29265e.jpg",
    descripcion: "Contraste vibrante de colores neón con la elegancia de los clásicos.",
    precio: "Q45",
    duracion: "1h 10min",
  },
  {
    id: 7,
    nombre: "Polygel Ojo de Gato y Encapsulado Floral",
    servicios: ["polygel"],
    colores: ["negro", "tonos-nude"],
    efectos: ["ojo-de-gato", "encapsulados"],
    imagen: "https://i.pinimg.com/736x/b5/27/25/b527259a05c47960a0826fc7a0e9f581.jpg",
    descripcion: "Profundidad magnética del ojo de gato con delicados encapsulados florales.",
    precio: "Q60",
    duracion: "1h 45min",
  },
];

const ITEMS_PER_PAGE_INITIAL_CATEGORY = 4;

const getAvailableFilterCategories = () => {
  const categories = [];
  const navItemEntries = Object.entries(NAV_ITEMS);
  for (const [key, value] of navItemEntries) {
    if (value.filterType && value.categorías && Array.isArray(value.categorías)) {
      categories.push({
        key: value.filterType,
        label: key,
        icon: value.icon,
        options: value.categorías.map((cat) => ({ nombre: cat.nombre, slug: cat.slug, icon: cat.icon })),
      });
    }
  }
  return categories;
};

const initialVisibleCounts = {};
getAvailableFilterCategories().forEach((cat) => {
  initialVisibleCounts[cat.key] = ITEMS_PER_PAGE_INITIAL_CATEGORY;
});

const Explorar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const availableFilterOptions = useMemo(() => getAvailableFilterCategories(), []);

  const parsedFiltersFromUrl = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    const filters = {};
    if (availableFilterOptions.length > 0) {
      availableFilterOptions.forEach((cat) => {
        filters[cat.key] = queryParams.getAll(cat.key) || [];
      });
    }
    return filters;
  }, [location.search, availableFilterOptions]);

  const displayedNails = useMemo(() => {
    if (Object.keys(parsedFiltersFromUrl).length === 0 || availableFilterOptions.length === 0) {
      return todasLasUnas;
    }
    let filtered = [...todasLasUnas];
    let hasAnyFilterApplied = false;
    availableFilterOptions.forEach((category) => {
      const filterTypeKey = category.key;
      const selectedValues = parsedFiltersFromUrl[filterTypeKey];
      if (selectedValues && selectedValues.length > 0) {
        hasAnyFilterApplied = true;
        filtered = filtered.filter((nail) => {
          const nailValuesForType = nail[filterTypeKey];
          if (!Array.isArray(nailValuesForType) || nailValuesForType.length === 0) return false;
          return selectedValues.every((selectedValue) => nailValuesForType.includes(selectedValue));
        });
      }
    });
    return hasAnyFilterApplied ? filtered : todasLasUnas;
  }, [parsedFiltersFromUrl, availableFilterOptions]);

  const [isFilterPanelOpenMobile, setIsFilterPanelOpenMobile] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const [visibleCountsPerCategory, setVisibleCountsPerCategory] = useState(initialVisibleCounts);

  // --- Funciones para modificar la URL ---
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
    setVisibleCountsPerCategory(initialVisibleCounts);
  }, [navigate, location.pathname]);

  // --- Funciones auxiliares para la UI ---
  const getNombreFiltro = useCallback(
    (tipoKey, slug) => {
      const categoria = availableFilterOptions.find((cat) => cat.key === tipoKey);
      const opcion = categoria?.options.find((opt) => opt.slug === slug);
      return opcion?.nombre || slug.replace(/-/g, " ");
    },
    [availableFilterOptions]
  );

  const totalFiltrosActivosGeneral = useMemo(() => {
    if (Object.keys(parsedFiltersFromUrl).length === 0) return 0;
    return Object.values(parsedFiltersFromUrl).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }, [parsedFiltersFromUrl]);

  const handleGlobalSearchChange = (e) => {
    setGlobalSearchTerm(e.target.value);
  };

  const searchResults = useMemo(() => {
    if (!globalSearchTerm.trim()) return [];
    const normalizedSearch = globalSearchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const results = [];
    availableFilterOptions.forEach((category) => {
      const matchedOptions = category.options.filter((option) =>
        option.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedSearch)
      );
      if (matchedOptions.length > 0) {
        results.push({ ...category, options: matchedOptions });
      }
    });
    return results;
  }, [globalSearchTerm, availableFilterOptions]);

  const toggleShowMoreInCategory = useCallback(
    (categoryKey) => {
      setVisibleCountsPerCategory((prevCounts) => {
        const category = availableFilterOptions.find((cat) => cat.key === categoryKey);
        const categoryOptionsLength = category ? category.options.length : 0;
        const currentCount = prevCounts[categoryKey] || ITEMS_PER_PAGE_INITIAL_CATEGORY;
        return {
          ...prevCounts,
          [categoryKey]: currentCount >= categoryOptionsLength && categoryOptionsLength > 0 ? ITEMS_PER_PAGE_INITIAL_CATEGORY : categoryOptionsLength,
        };
      });
    },
    [availableFilterOptions]
  );

  // --- RENDERIZADO DEL PANEL DE FILTROS ---
  const renderFilterPanel = useCallback(() => {
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
              placeholder="Buscar filtros (ej: rojo, acrílicas...)"
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
                  const filtrosActivosEnEstaCategoria = parsedFiltersFromUrl[categoryResult.key] || [];
                  return (
                    <div key={categoryResult.key} className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3 first:pt-0 first:border-t-0">
                      <h3 className="font-semibold text-textSecondary mb-1.5 flex items-center text-xs uppercase tracking-wider">
                        {categoryResult.icon && <DynamicIcon name={categoryResult.icon} className="w-3.5 h-3.5 mr-1.5 text-gray-500" />}
                        {categoryResult.label}
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
                                  {opcion.nombre}
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
            ) : (
              availableFilterOptions.map((categoria) => {
                const currentVisibleCount = visibleCountsPerCategory[categoria.key] || ITEMS_PER_PAGE_INITIAL_CATEGORY;
                const opcionesAMostrar = categoria.options.slice(0, currentVisibleCount);
                const numFiltrosActivosEnCategoria = (parsedFiltersFromUrl[categoria.key] || []).length;

                return (
                  <div key={categoria.key} className="mb-5 border-t border-gray-200 dark:border-gray-700 pt-4 first:pt-0 first:border-t-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-textSecondary flex items-center text-sm">
                        {categoria.icon && <DynamicIcon name={categoria.icon} className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />}
                        {categoria.label}
                      </h3>
                      {numFiltrosActivosEnCategoria > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-mono">
                          {numFiltrosActivosEnCategoria}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {opcionesAMostrar.map((opcion) => {
                        const isChecked = (parsedFiltersFromUrl[categoria.key] || []).includes(opcion.slug);
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
                                {opcion.nombre}
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
                    {categoria.options.length === 0 && <p className="text-xs text-gray-400 px-1">No hay opciones.</p>}
                  </div>
                );
              })
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
    clearAllFilters,
    handleGlobalSearchChange,
    handleFilterChange,
    toggleShowMoreInCategory,
  ]);

  // --- RENDERIZADO PRINCIPAL DEL COMPONENTE ---
  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8 pt-8 md:pt-24 min-h-screen">
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
          <div className="mb-4 sm:mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm mx-2 md:mx-0">
            {totalFiltrosActivosGeneral > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1.5 items-center">
                <span className="text-xs font-medium mr-1 text-textSecondary">Activos:</span>
                {Object.entries(parsedFiltersFromUrl).map(([tipo, slugs]) =>
                  (slugs || []).map((slug) => (
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
                        <DynamicIcon name="X" size={10} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona filtros para refinar tu búsqueda o explora todos los diseños.</p>
            )}
          </div>

          {/* Lista de Uñas */}
          {displayedNails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 px-2 md:px-0">
              {displayedNails.map((una) => (
                <div
                  key={una.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md bg-background hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <img
                    src={una.imagen || "https://via.placeholder.com/350x250?text=Nail+Art"}
                    alt={una.nombre}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 text-textPrimary">{una.nombre}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <DynamicIcon name="Clock" className="w-3 h-3 inline mr-1" />
                      {una.duracion} | <DynamicIcon name="Tag" className="w-3 h-3 inline mx-1" />
                      {una.precio}
                    </p>
                    <p className="text-xs sm:text-sm text-textSecondary mb-2.5 h-10 overflow-hidden text-ellipsis line-clamp-2">{una.descripcion}</p>

                    <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/50">
                      {una.servicios?.map((s) => (
                        <span
                          key={s}
                          className="text-[0.65rem] sm:text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full"
                        >
                          {getNombreFiltro("servicios", s)}
                        </span>
                      ))}
                      {una.colores?.map((c) => (
                        <span
                          key={c}
                          className="text-[0.65rem] sm:text-xs bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded-full"
                        >
                          {getNombreFiltro("colores", c)}
                        </span>
                      ))}
                      {una.efectos?.map((e) => (
                        <span
                          key={e}
                          className="text-[0.65rem] sm:text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full"
                        >
                          {getNombreFiltro("efectos", e)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
                  : "Prueba con otros filtros o explora todos los diseños."}
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
