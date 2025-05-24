export const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const toSlug = (name) => {
  // Añadir export aquí
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "");
};
