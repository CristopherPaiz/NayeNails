import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Estado inicial para el contexto del tema.
 * @typedef {Object} InitialState
 * @property {string} theme - El tema actual, puede ser "light", "dark" o "system".
 * @property {Function} setTheme - Función para actualizar el tema.
 */
const initialState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

/**
 * Proveedor de tema para la aplicación.
 *
 * Este componente proporciona el contexto para manejar el tema (claro, oscuro o sistema).
 *
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que estarán envueltos por el proveedor.
 * @param {"light"| "dark"| "system"} [props.defaultTheme="system"] - Tema por defecto ("light", "dark" o "system").
 * @param {string} [props.storageKey="theme"] - Clave de almacenamiento en localStorage para guardar el tema.
 * @returns {JSX.Element} El proveedor de contexto para el tema.
 *
 * @example
 * <ThemeProvider defaultTheme="light">
 *   <App />
 * </ThemeProvider>
 *
 * @example
 * const { theme, setTheme } = useTheme();
 * console.log(theme); // "light" | "dark" | "system"
 * <button className="right-0" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *   {theme === "light" ? "🌙" : "☀️"}
 * </button>
 */
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme", ...props }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

  /**
   * Efecto para aplicar la clase de tema al elemento raíz del documento.
   */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  /**
   * Valor del contexto que se proporcionará a los consumidores del ThemeProvider.
   * @type {Object}
   * @property {string} theme - El tema actual.
   * @property {Function} setTheme - Función para actualizar el tema y almacenarlo en localStorage.
   */
  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del tema.
 *
 * @returns {Object} Contexto del tema.
 * @throws {Error} Si el hook es utilizado fuera del ThemeProvider.
 *
 * @example
 * const { theme, setTheme } = useTheme();
 * console.log(theme); // "light" | "dark" | "system"
 * <button className="right-0" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *   {theme === "light" ? "🌙" : "☀️"}
 * </button>
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// PropTypes para ThemeProvider
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.string,
  storageKey: PropTypes.string,
};
