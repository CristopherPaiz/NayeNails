import { capitalizeWords } from "./textUtils";

// Aviso: La función getAvailableFilterCategories no se usa en ningún lado y ha sido eliminada.
// Explorar.jsx tiene su propia getDynamicFilterCategories.

export const getInitialVisibleCounts = (availableFilterCategories, itemsPerPage) => {
  const initialCounts = {};
  if (!availableFilterCategories || !Array.isArray(availableFilterCategories)) return initialCounts;

  availableFilterCategories.forEach((cat) => {
    initialCounts[cat.key] = itemsPerPage;
  });
  return initialCounts;
};

export const parseFiltersFromUrl = (locationSearch, availableFilterCategories) => {
  const queryParams = new URLSearchParams(locationSearch);
  const filters = {};
  if (availableFilterCategories && availableFilterCategories.length > 0) {
    availableFilterCategories.forEach((cat) => {
      // cat.key es el slug de la CategoriaPadre (ej: "servicios", "colores")
      filters[cat.key] = queryParams.getAll(cat.key) || [];
    });
  }
  return filters;
};

export const calculateDisplayedNails = (todasLasUnas, parsedFiltersFromUrl, availableFilterCategories) => {
  if (!todasLasUnas || todasLasUnas.length === 0) {
    return [];
  }

  const activeFilterKeys = Object.keys(parsedFiltersFromUrl).filter((key) => parsedFiltersFromUrl[key]?.length > 0);

  if (activeFilterKeys.length === 0 || !availableFilterCategories || availableFilterCategories.length === 0) {
    return todasLasUnas;
  }

  let filtered = [...todasLasUnas];

  availableFilterCategories.forEach((category) => {
    const filterTypeKey = category.key; // ej: "servicios", "colores" (slug de CategoriaPadre)
    const selectedValues = parsedFiltersFromUrl[filterTypeKey]; // ej: ["manicura-tradicional", "unas-acrilicas"] (slugs de Subcategorias)

    if (selectedValues && selectedValues.length > 0) {
      filtered = filtered.filter((nail) => {
        // nail[filterTypeKey] debe ser un array de slugs de subcategorías asociadas a ese diseño para esa categoría padre
        // ej: nail.servicios = ["manicura-tradicional", "pedicura"]
        const nailValuesForType = nail[filterTypeKey];
        if (!Array.isArray(nailValuesForType) || nailValuesForType.length === 0) return false;

        // El diseño debe tener TODAS las subcategorías seleccionadas DENTRO de esta categoría padre.
        return selectedValues.every((selectedValue) => nailValuesForType.includes(selectedValue));
      });
    }
  });
  return filtered;
};

export const getNombreFiltroFromSlug = (availableFilterCategories, tipoKey, slug) => {
  if (!availableFilterCategories) return capitalizeWords(slug);
  const categoria = availableFilterCategories.find((cat) => cat.key === tipoKey);
  const opcion = categoria?.options.find((opt) => opt.slug === slug);
  const baseName = opcion?.nombre ?? slug; // Usar slug como fallback si no se encuentra nombre
  return capitalizeWords(baseName);
};

export const calculateTotalFiltrosActivos = (parsedFiltersFromUrl) => {
  if (!parsedFiltersFromUrl || Object.keys(parsedFiltersFromUrl).length === 0) return 0;
  return Object.values(parsedFiltersFromUrl).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
};

export const performGlobalFilterSearch = (searchTerm, availableFilterCategories) => {
  if (!searchTerm.trim() || !availableFilterCategories) return [];
  const normalizedSearch = searchTerm
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const results = [];

  availableFilterCategories.forEach((category) => {
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
};
