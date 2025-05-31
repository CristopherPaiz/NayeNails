export const BUSINESS_NAME = "Naye Nails";
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
      { nombre: "Citas", slug: "/admin/citas", icon: "CalendarCheck" }, // NUEVO ENLACE CITAS
      { nombre: "Imágenes Sitio", slug: "/admin/config", icon: "Image" },
      { nombre: "Textos y Colores", slug: "/admin/textos-colores", icon: "Palette" },
      { nombre: "Perfil", slug: "/admin/perfil", icon: "User" },
    ],
    icon: "Settings",
  },
};
