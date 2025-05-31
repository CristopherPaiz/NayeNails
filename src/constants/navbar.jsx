export const BUSINESS_NAME = "Naye Nails"; // Este será sobrescrito por la config de BD
export const CATALOGO_BASE_PATH = "/explorar-unas";

export const STATIC_NAV_ITEMS = {
  "Agendar Cita": {
    link: "/agendar-cita",
    icon: "Calendar",
  },
  Ubicacion: {
    link: "/ubicacion",
    icon: "MapPin",
  },
  Contacto: {
    link: "/contacto",
    icon: "Mail",
  },
};

export const ADMIN_ITEMS = {
  administracion: {
    categorías: [
      { nombre: "Categorías", slug: "/admin/categorias", icon: "ListTree" },
      { nombre: "Diseños", slug: "/admin/disenios", icon: "Paintbrush" },
      { nombre: "Imágenes Sitio", slug: "/admin/config", icon: "Image" }, // Renombrado para claridad
      { nombre: "Textos y Colores", slug: "/admin/textos-colores", icon: "Palette" }, // NUEVA SECCIÓN
      { nombre: "Perfil", slug: "/admin/perfil", icon: "User" },
    ],
    icon: "Settings", // Icono general para el dropdown de Administración
  },
};
