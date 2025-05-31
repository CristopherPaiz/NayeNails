export const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const toSlug = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Reemplaza espacios con -
    .normalize("NFD") // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
    .replace(/[^\w-]+/g, "") // Elimina caracteres no alfanuméricos excepto -
    .replace(/--+/g, "-") // Reemplaza múltiples - con uno solo
    .replace(/^-+|-+$/g, ""); // Elimina - al inicio o final
};
