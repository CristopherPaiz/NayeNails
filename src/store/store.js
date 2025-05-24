import { create } from "zustand";
import apiClient from "../api/axios.js";
import { toSlug } from "../utils/textUtils.js";
import CRAlert from "../components/UI/CRAlert.jsx";

const useStoreNails = create((set, get) => ({
  message: "Hola Mundo desde Zustand!",
  imagenesInicio: [
    { url: "https://torridnails.it/cdn/shop/articles/Buy_your_kit_d05f3ce0-e86a-4845-b23b-4038f9160196.jpg", legend: "" },
    { url: "https://media.vogue.es/photos/5e46dd6814cc4800084d7613/16:9/w_1280,c_limit/VOGUE-Manicura-Bolsos5332-copia.jpg", legend: "" },
    {
      url: "https://estaticosgn-cdn.deia.eus/clip/c20bfc11-6149-4868-8833-194cbeab1ed9_16-9-discover-aspect-ratio_default_0_x1480y2480.jpg",
      legend: "",
    },
  ],
  imagenesGaleria: [
    { id: "img-1", src: "/pics/1.jpg", thumb: "/pics/1.jpg", alt: "Imagen 1", lgSize: "1920-1280" },
    { id: "img-2", src: "/pics/2.jpg", thumb: "/pics/2.jpg", alt: "Imagen 2", lgSize: "1024-768" },
    { id: "img-3", src: "/pics/3.jpg", thumb: "/pics/3.jpg", alt: "Imagen 3", lgSize: "1600-1200" },
    { id: "img-4", src: "/pics/4.jpg", thumb: "/pics/4.jpg", alt: "Imagen 4", lgSize: "1280-853" },
    { id: "img-5", src: "/pics/5.jpg", thumb: "/pics/5.jpg", alt: "Imagen 5", lgSize: "1920-1080" },
    { id: "img-6", src: "/pics/6.jpg", thumb: "/pics/6.jpg", alt: "Imagen 6", lgSize: "1000-667" },
    { id: "img-7", src: "/pics/7.jpg", thumb: "/pics/7.jpg", alt: "Imagen 7", lgSize: "1400-933" },
    { id: "img-8", src: "/pics/8.jpg", thumb: "/pics/8.jpg", alt: "Imagen 8", lgSize: "900-600" },
    { id: "img-9", src: "/pics/9.jpg", thumb: "/pics/9.jpg", alt: "Imagen 9", lgSize: "2048-1365" },
    { id: "img-10", src: "/pics/10.jpg", thumb: "/pics/10.jpg", alt: "Imagen 10", lgSize: "1600-1067" },
  ],
  imagenesCarouselObjetivo: [],

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
          // Asegurar que no se repitan colores ya usados por las claves base (servicios, colores, efectos)
          let assignedColor = false;
          while (!assignedColor && colorIndex < colorPalette.length * 2) {
            // Iterar más para encontrar uno no usado
            const colorName = colorPalette[colorIndex % colorPalette.length];
            if (!existingColorKeys.includes(colorName) && !Object.values(newTagColors).some((tc) => tc.bg.includes(colorName))) {
              newTagColors[filterTypeKey] = {
                bg: `bg-${colorName}-100 dark:bg-${colorName}-500/30`,
                text: `text-${colorName}-700 dark:text-${colorName}-300`,
                hoverBg: `hover:bg-${colorName}-200 dark:hover:bg-${colorName}-500/50`,
              };
              existingColorKeys.push(filterTypeKey); // Marcar como usado para futuras asignaciones dinámicas
              assignedColor = true;
            }
            colorIndex++;
          }
          if (!assignedColor) {
            // Fallback si todos los colores de la paleta están "usados"
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

      const parseConfigValue = (clave, fallback) => {
        const config = configs.find((c) => c.clave === clave);
        if (config?.valor) {
          try {
            const parsedValue = JSON.parse(config.valor);
            if (
              Array.isArray(parsedValue) &&
              parsedValue.every((item) => typeof item === "object" && item !== null && typeof item.url === "string")
            ) {
              return parsedValue;
            }
            console.warn(`Valor de configuración para '${clave}' no es un array de objetos con URL válido. Usando fallback.`);
            return fallback;
          } catch (e) {
            console.error(`Error parsing JSON para la clave '${clave}':`, e, "Valor recibido:", config.valor);
            return fallback;
          }
        }
        return fallback;
      };

      set({
        imagenesInicio: parseConfigValue("carousel_principal_imagenes", get().imagenesInicio),
        imagenesGaleria: parseConfigValue("galeria_inicial_imagenes", get().imagenesGaleria),
        imagenesCarouselObjetivo: parseConfigValue(
          "carousel_objetivo_imagenes",
          get().imagenesCarouselObjetivo.length > 0 ? get().imagenesCarouselObjetivo : []
        ),
      });
    } catch (error) {
      console.error("Error fetching site configurations:", error);
      // No se muestra alerta global aquí, se usarán los valores por defecto del store.
    }
  },

  setMessage: (newMessage) => set({ message: newMessage }),
}));

export default useStoreNails;
