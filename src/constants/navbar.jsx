// src/constants/navbar.jsx
export const BUSINESS_NAME = "Naye Nails";

const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/ /g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// NUEVA RUTA BASE PARA EL CATÁLOGO DE UÑAS
export const CATALOGO_BASE_PATH = "/explorar-unas";

export const NAV_ITEMS = {
  Servicios: {
    icon: "LayoutGrid",
    filterType: "servicios",
    categorías: [
      { nombre: "Manicura Tradicional", slug: toSlug("Manicura Tradicional"), icon: "Hand" },
      { nombre: "Manicura Rusa", slug: toSlug("Manicura Rusa"), icon: "Hand" },
      { nombre: "Uñas Acrílicas", slug: toSlug("Uñas Acrílicas"), icon: "Sparkles" },
      { nombre: "Uñas en Gel", slug: toSlug("Uñas en Gel"), icon: "Gem" },
      { nombre: "Polygel", slug: toSlug("Polygel"), icon: "Gem" },
      { nombre: "Esmalte Semipermanente", slug: toSlug("Esmalte Semipermanente"), icon: "Brush" },
      { nombre: "Retiro de Material", slug: toSlug("Retiro de Material"), icon: "Undo" },
      { nombre: "Diseños Personalizados", slug: toSlug("Diseños Personalizados"), icon: "Paintbrush" },
    ],
  },
  Efectos: {
    icon: "Sparkle",
    filterType: "efectos",
    categorías: [
      { nombre: "Ojo de Gato", slug: toSlug("Ojo de Gato"), icon: "Eye" },
      { nombre: "Efecto Sugar", slug: toSlug("Efecto Sugar"), icon: "Candy" },
      { nombre: "Efecto Espejo", slug: toSlug("Efecto Espejo"), icon: "Airplay" },
      { nombre: "Efecto Aurora", slug: toSlug("Efecto Aurora"), icon: "Sun" },
      { nombre: "Encapsulados", slug: toSlug("Encapsulados"), icon: "Gem" },
      { nombre: "Tercera Dimensión", slug: toSlug("3d"), icon: "Layers" },
    ],
  },
  Colores: {
    icon: "Palette",
    filterType: "colores",
    categorías: [
      { nombre: "Tonos Nude", slug: toSlug("Tonos Nude"), icon: "Palette" },
      { nombre: "Pasteles", slug: toSlug("Pasteles"), icon: "Palette" },
      { nombre: "Neón", slug: toSlug("Neón"), icon: "Palette" },
      { nombre: "Metálicos", slug: toSlug("Metálicos"), icon: "Palette" },
      { nombre: "Glitters", slug: toSlug("Glitters"), icon: "Stars" },
      { nombre: "Clásicos", slug: toSlug("Clásicos"), icon: "Palette" },
    ],
  },
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
      { nombre: "Configuraciones", slug: "/admin/config", icon: "Settings" },
      { nombre: "Perfil", slug: "/admin/perfil", icon: "User" },
    ],
    icon: "Settings",
  },
};
