// src/constants/navbar.jsx
export const BUSINESS_NAME = "Naye Nails";

const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/ /g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const NAV_ITEMS = {
  Servicios: {
    icon: "LayoutGrid",
    categorías: [
      { nombre: "Manicura Tradicional", link: `/${toSlug("Manicura Tradicional")}`, icon: "Hand" },
      { nombre: "Manicura Rusa", link: `/${toSlug("Manicura Rusa")}`, icon: "Hand" },
      { nombre: "Uñas Acrílicas", link: `/${toSlug("Uñas Acrílicas")}`, icon: "Sparkles" },
      { nombre: "Uñas en Gel", link: `/${toSlug("Uñas en Gel")}`, icon: "Gem" },
      { nombre: "Polygel", link: `/${toSlug("Polygel")}`, icon: "Gem" },
      { nombre: "Esmalte Semipermanente", link: `/${toSlug("Esmalte Semipermanente")}`, icon: "Brush" },
      { nombre: "Retiro de Material", link: `/${toSlug("Retiro de Material")}`, icon: "Undo" },
      { nombre: "Diseños Personalizados", link: `/${toSlug("Diseños Personalizados")}`, icon: "Paintbrush" },
    ],
  },
  Efectos: {
    icon: "Sparkle",
    categorías: [
      { nombre: "Ojo de Gato", link: `/${toSlug("Ojo de Gato")}`, icon: "Eye" },
      { nombre: "Efecto Sugar", link: `/${toSlug("Efecto Sugar")}`, icon: "Candy" },
      { nombre: "Efecto Espejo", link: `/${toSlug("Efecto Espejo")}`, icon: "Airplay" },
      { nombre: "Efecto Aurora", link: `/${toSlug("Efecto Aurora")}`, icon: "Sun" },
      { nombre: "Encapsulados", link: `/${toSlug("Encapsulados")}`, icon: "Gem" },
      { nombre: "Tercera Dimensión", link: `/${toSlug("3d")}`, icon: "Layers" },
    ],
  },
  Colores: {
    icon: "Palette",
    categorías: [
      { nombre: "Tonos Nude", link: `/${toSlug("Tonos Nude")}`, icon: "Palette" },
      { nombre: "Pasteles", link: `/${toSlug("Pasteles")}`, icon: "Palette" },
      { nombre: "Neón", link: `/${toSlug("Neón")}`, icon: "Palette" },
      { nombre: "Metálicos", link: `/${toSlug("Metálicos")}`, icon: "Palette" },
      { nombre: "Glitters", link: `/${toSlug("Glitters")}`, icon: "Stars" },
      { nombre: "Clásicos", link: `/${toSlug("Clásicos")}`, icon: "Palette" },
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
