import { create } from "zustand";
import apiClient from "../api/axios.js";
import { toSlug } from "../utils/textUtils.js";
import CRAlert from "../components/UI/CRAlert.jsx";

const fallbackPrincipal = [
  { url: "https://via.placeholder.com/1920x1080.png?text=Principal+1", legend: "" },
  { url: "https://via.placeholder.com/1920x1080.png?text=Principal+2", legend: "" },
  { url: "https://via.placeholder.com/1920x1080.png?text=Principal+3", legend: "" },
];
const fallbackGaleria = Array.from({ length: 10 }, (_, i) => ({
  id: `gal-fallback-${i + 1}`,
  src: `https://via.placeholder.com/800x600.png?text=Galería+${i + 1}`,
  thumb: `https://via.placeholder.com/400x300.png?text=Galería+${i + 1}`,
  alt: `Imagen de galería ${i + 1}`,
}));

const useStoreNails = create((set, get) => ({
  message: "Hola Mundo desde Zustand!",
  imagenesInicio: fallbackPrincipal, // Fallback inicial
  imagenesGaleria: fallbackGaleria, // Fallback inicial
  imagenesCarouselSecundario: fallbackPrincipal, // Fallback inicial (usando el mismo que principal por ahora)

  todasLasUnas: [],
  isLoadingTodasLasUnas: true,
  errorTodasLasUnas: null,

  TAG_COLORS: {
    servicios: {
      bg: "bg-blue-100 dark:bg-blue-500/30",
      text: "text-blue-700 dark:text-blue-300",
      hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-500/50",
    },
    colores: {
      bg: "bg-pink-100 dark:bg-pink-500/30",
      text: "text-pink-700 dark:text-pink-300",
      hoverBg: "hover:bg-pink-200 dark:hover:bg-pink-500/50",
    },
    efectos: {
      bg: "bg-green-100 dark:bg-green-500/30",
      text: "text-green-700 dark:text-green-300",
      hoverBg: "hover:bg-green-200 dark:hover:bg-green-500/50",
    },
    default: {
      bg: "bg-gray-200 dark:bg-gray-600",
      text: "text-gray-700 dark:text-gray-200",
      hoverBg: "hover:bg-gray-300 dark:hover:bg-gray-500",
    },
  },

  dynamicNavItems: {},
  isLoadingDynamicNav: true,
  errorDynamicNav: null,

  adminSidebarOpen: false,
  toggleAdminSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
  setAdminSidebarOpen: (isOpen) => set({ adminSidebarOpen: isOpen }),

  fetchDynamicNavItems: async () => {
    if (!get().isLoadingDynamicNav) set({ isLoadingDynamicNav: true });
    set({ errorDynamicNav: null });
    try {
      const response = await apiClient.get("/categorias");
      const activeCategoriasPadre = response.data?.filter((cp) => cp.activo) ?? [];

      const newDynamicNavItems = {};
      const newTagColors = { ...get().TAG_COLORS };
      const colorPalette = [
        "purple",
        "red",
        "orange",
        "cyan",
        "teal",
        "green",
        "blue",
        "yellow",
        "sky",
        "violet",
        "indigo",
        "rose",
        "lime",
        "amber",
        "emerald",
        "fuchsia",
        "pink",
      ];
      let colorIndex = 0;
      const existingColorKeys = Object.keys(newTagColors).filter((k) => k !== "default");

      activeCategoriasPadre.forEach((catPadre) => {
        const filterTypeKey = toSlug(catPadre.nombre);
        newDynamicNavItems[catPadre.nombre] = {
          icon: catPadre.icono ?? "List",
          filterType: filterTypeKey,
          categorías: (catPadre.subcategorias?.filter((sub) => sub.activo) ?? []).map((sub) => ({
            nombre: sub.nombre,
            slug: toSlug(sub.nombre),
            icon: sub.icono ?? "ChevronRight",
          })),
        };

        if (!newTagColors[filterTypeKey]) {
          let assignedColor = false;
          while (!assignedColor && colorIndex < colorPalette.length * 2) {
            const colorName = colorPalette[colorIndex % colorPalette.length];
            if (!existingColorKeys.includes(colorName) && !Object.values(newTagColors).some((tc) => tc.bg.includes(colorName))) {
              newTagColors[filterTypeKey] = {
                bg: `bg-${colorName}-100 dark:bg-${colorName}-500/30`,
                text: `text-${colorName}-700 dark:text-${colorName}-300`,
                hoverBg: `hover:bg-${colorName}-200 dark:hover:bg-${colorName}-500/50`,
              };
              existingColorKeys.push(filterTypeKey);
              assignedColor = true;
            }
            colorIndex++;
          }
          if (!assignedColor) {
            newTagColors[filterTypeKey] = { ...newTagColors.default };
          }
        }
      });
      set({ dynamicNavItems: newDynamicNavItems, TAG_COLORS: newTagColors, isLoadingDynamicNav: false });
    } catch (error) {
      console.error("Error fetching dynamic nav items:", error);
      set({
        errorDynamicNav: error.response?.data?.message ?? error.message ?? "Error al cargar categorías para navegación",
        isLoadingDynamicNav: false,
      });
    }
  },

  fetchTodasLasUnas: async () => {
    if (!get().isLoadingTodasLasUnas) set({ isLoadingTodasLasUnas: true });
    set({ errorTodasLasUnas: null });
    try {
      const response = await apiClient.get("/disenios");
      const apiDisenios = response.data ?? [];
      set({ todasLasUnas: apiDisenios, isLoadingTodasLasUnas: false });
    } catch (error) {
      console.error("Error fetching todas las unas:", error);
      CRAlert.alert({ title: "Error de Carga", message: "No se pudieron cargar los diseños desde el servidor.", type: "error" });
      set({
        errorTodasLasUnas: error.response?.data?.message ?? error.message ?? "Error al cargar diseños",
        isLoadingTodasLasUnas: false,
        todasLasUnas: [],
      });
    }
  },

  fetchConfiguracionesSitio: async () => {
    try {
      const response = await apiClient.get("/configuraciones-sitio");
      const configs = response.data ?? [];

      const parseConfigValue = (clave, fallbackValue) => {
        const config = configs.find((c) => c.clave === clave);
        if (config?.valor) {
          try {
            const parsedValue = JSON.parse(config.valor);
            // Validar que sea un array y que los elementos tengan al menos 'url'
            if (
              Array.isArray(parsedValue) &&
              parsedValue.every((item) => typeof item === "object" && item !== null && typeof item.url === "string")
            ) {
              return parsedValue.length > 0 ? parsedValue : fallbackValue;
            }
            console.warn(`Valor de configuración para '${clave}' no es un array de objetos con URL válido o está vacío. Usando fallback.`);
            return fallbackValue;
          } catch (e) {
            console.error(`Error parsing JSON para la clave '${clave}':`, e, "Valor recibido:", config.valor);
            return fallbackValue;
          }
        }
        return fallbackValue;
      };

      // Mapear las imágenes de la galería para que coincidan con la estructura esperada por LightGallery/Masonry
      const galeriaTransformada = (galeriaItems) => {
        if (!Array.isArray(galeriaItems)) return fallbackGaleria;
        return galeriaItems.map((item, index) => ({
          id: item.public_id || `gal-${index}-${Date.now()}`,
          src: item.url,
          thumb: item.url, // Usar la misma URL para thumb por simplicidad, o generar thumbs en Cloudinary
          alt: item.alt || `Imagen de galería ${index + 1}`,
          // lgSize: "1920-1080" // Podría obtenerse de Cloudinary si se guarda, o dejarlo opcional
        }));
      };

      set({
        imagenesInicio: parseConfigValue("carousel_principal_imagenes", get().imagenesInicio),
        imagenesCarouselSecundario: parseConfigValue("carousel_secundario_imagenes", get().imagenesCarouselSecundario),
        imagenesGaleria: galeriaTransformada(parseConfigValue("galeria_inicial_imagenes", [])), // Usar [] como fallback antes de transformar
      });
    } catch (error) {
      console.error("Error fetching site configurations:", error);
      // Mantener los fallbacks si la carga falla
      set({
        imagenesInicio: get().imagenesInicio.length > 0 ? get().imagenesInicio : fallbackPrincipal,
        imagenesCarouselSecundario: get().imagenesCarouselSecundario.length > 0 ? get().imagenesCarouselSecundario : fallbackPrincipal,
        imagenesGaleria: get().imagenesGaleria.length > 0 ? get().imagenesGaleria : fallbackGaleria,
      });
    }
  },

  setMessage: (newMessage) => set({ message: newMessage }),
}));

export default useStoreNails;
