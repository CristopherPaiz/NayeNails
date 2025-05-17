
import { capitalizeWords } from "./textUtils"; 

export const getAvailableFilterCategories = (NAV_ITEMS) => {
  const categories = [];
  if (!NAV_ITEMS) return categories;

  const navItemEntries = Object.entries(NAV_ITEMS);
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
      filters[cat.key] = queryParams.getAll(cat.key) || [];
    });
  }
  return filters;
};

export const calculateDisplayedNails = (todasLasUnas, parsedFiltersFromUrl, availableFilterCategories) => {
  if (!todasLasUnas || todasLasUnas.length === 0) {
    return [];
  }
  if (
    !parsedFiltersFromUrl ||
    Object.keys(parsedFiltersFromUrl).length === 0 ||
    !availableFilterCategories ||
    availableFilterCategories.length === 0
  ) {
    return todasLasUnas;
  }

  let filtered = [...todasLasUnas];
  let hasAnyFilterApplied = false;

  availableFilterCategories.forEach((category) => {
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
};

export const getNombreFiltroFromSlug = (availableFilterCategories, tipoKey, slug) => {
  if (!availableFilterCategories) return capitalizeWords(slug);
  const categoria = availableFilterCategories.find((cat) => cat.key === tipoKey);
  const opcion = categoria?.options.find((opt) => opt.slug === slug);
  const baseName = opcion?.nombre || slug;
  return capitalizeWords(baseName);
};

export const calculateTotalFiltrosActivos = (parsedFiltersFromUrl) => {
  if (!parsedFiltersFromUrl || Object.keys(parsedFiltersFromUrl).length === 0) return 0;
  return Object.values(parsedFiltersFromUrl).reduce((sum, arr) => sum + (arr?.length || 0), 0);
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
