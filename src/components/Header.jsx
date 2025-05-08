// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// Asegúrate de importar CATALOGO_BASE_PATH
import { BUSINESS_NAME, NAV_ITEMS, CATALOGO_BASE_PATH } from "../constants/navbar.jsx";
import CRButton from "./UI/CRButton.jsx";
import { useTheme } from "../context/ThemeProvider.jsx";
import { DynamicIcon } from "../utils/DynamicIcon.jsx";
import useExampleStore from "../store/store.js";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRefs = useRef({});
  const hoverTimeoutRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const setMessage = useExampleStore((state) => state.setMessage);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest("header")) {
        setIsOpen(false);
      }
      // Cierra el dropdown si se hace clic fuera de él
      let clickedInsideDropdown = false;
      if (activeDropdown) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && dropdownElement.contains(event.target)) {
          clickedInsideDropdown = true;
        }
        // También verifica el botón que abre el dropdown
        const buttonElement = document.querySelector(`[data-dropdown-key="${activeDropdown}"] > button`);
        if (buttonElement && buttonElement.contains(event.target)) {
          clickedInsideDropdown = true;
        }
      }

      if (activeDropdown && !clickedInsideDropdown && !event.target.closest(`[data-dropdown-key="${activeDropdown}"]`)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, activeDropdown]);

  useEffect(() => () => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current), []);

  const handleToggleDropdown = (key) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleMouseEnter = (key) => {
    if (!isMobile) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setActiveDropdown(key);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimeoutRef.current = setTimeout(() => {
        // Verifica si el foco está dentro de alguno de los contenidos del dropdown
        // Esta lógica es un poco compleja y puede necesitar ajustes dependiendo
        // de cómo se maneje el foco exactamente en tus dropdowns.
        // Por ahora, si el mouse sale, cerramos tras un delay.
        // Si el usuario mueve el mouse rápidamente a un subitem, el mouseenter del subitem debería cancelar este timeout
        // o el mouseenter del dropdown padre lo reabrirá.
        let isFocusInsideAnyDropdownContent = false;
        Object.values(dropdownRefs.current).forEach((ref) => {
          // Chequeamos el div que contiene los links, no el div padre completo
          const dropdownContent = ref?.querySelector('div[role="menu"], div.py-1'); // Ajusta el selector si es necesario
          if (dropdownContent?.contains(document.activeElement)) {
            isFocusInsideAnyDropdownContent = true;
          }
        });
        if (!isFocusInsideAnyDropdownContent) {
          setActiveDropdown(null);
        }
      }, 200); // Un pequeño delay para permitir moverse a los subitems
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false); // Cierra el menú hamburguesa si está abierto
    setActiveDropdown(null); // Cierra cualquier dropdown abierto
    setMessage(`Navegaste a las ${new Date().toLocaleTimeString()}`);
  };

  return (
    <header className="w-full bg-background shadow-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-2 sm:py-2 sm:pl-8 flex items-center justify-between relative">
        <Link to="/" className="flex items-center" onClick={handleLinkClick}>
          <h1 className="text-primary text-xl sm:text-2xl font-bold tracking-tight">{BUSINESS_NAME}</h1>
        </Link>
        <button
          className={
            "md:hidden flex items-center justify-center p-2 rounded-md text-primary " +
            "hover:text-primary hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          }
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <DynamicIcon name={isOpen ? "X" : "Menu"} size={24} />
        </button>
        <nav
          id="mobile-menu"
          className={
            "absolute md:static top-full left-0 w-full md:w-auto " +
            "bg-background md:bg-transparent shadow-md md:shadow-none " +
            "flex flex-col md:flex-row items-stretch md:items-center gap-y-0 md:gap-x-2 " +
            "px-4 py-2 sm:p-0 z-40 " +
            "origin-top duration-200 ease-in-out " +
            (isOpen
              ? "opacity-100 scale-y-100 translate-y-0"
              : "opacity-0 scale-y-0 -translate-y-4 md:opacity-100 md:scale-y-100 md:translate-y-0 h-0 md:h-auto overflow-hidden md:overflow-visible")
          }
        >
          {Object.entries(NAV_ITEMS).map(([key, value]) => {
            const isFilterDropdown = value.categorías && Array.isArray(value.categorías) && value.filterType;
            const isActive = activeDropdown === key;

            if (isFilterDropdown) {
              return (
                <div
                  key={key}
                  ref={(el) => (dropdownRefs.current[key] = el)}
                  data-dropdown-key={key}
                  className="relative w-full md:w-auto mt-1 md:mt-0"
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={
                      "flex items-center justify-between md:justify-center w-full md:w-auto " +
                      "px-3 py-2 rounded-md text-textPrimary dark:text-textPrimary hover:text-primary text-base sm:text-sm font-medium transition-colors duration-200 " +
                      (isActive ? "text-primary dark:text-primary bg-accent md:bg-accent" : "") // bg-accent para móvil y hover desktop
                    }
                    onClick={() => handleToggleDropdown(key)}
                    aria-expanded={isActive}
                    aria-haspopup="true"
                    aria-controls={`dropdown-menu-${key}`}
                  >
                    <span className="flex items-center">
                      {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <DynamicIcon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    id={`dropdown-menu-${key}`}
                    role="menu"
                    className={
                      "md:mt-2 md:absolute left-0 md:left-1/2 md:-translate-x-1/2 " +
                      "bg-background rounded-lg shadow-lg py-0 md:py-2 min-w-max md:min-w-[12rem] " + // Asegura un ancho mínimo en desktop
                      "transition-all duration-200 overflow-hidden " +
                      (isActive
                        ? "opacity-100 max-h-96 scale-100 " + (isMobile ? "pb-2 mb-2 mt-1" : "") // Añade mt-1 en móvil para separar del botón
                        : "opacity-0 max-h-0 md:max-h-0 scale-95 pointer-events-none")
                    }
                  >
                    {/* Flecha del dropdown en desktop */}
                    {!isMobile && isActive && (
                      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-[-1]">
                        <div className="w-4 h-4 bg-background transform rotate-45 border-t border-l border-border dark:border-border shadow-sm"></div>
                      </div>
                    )}
                    <div className="relative bg-background rounded-lg md:shadow-lg py-1 md:py-0">
                      {" "}
                      {/* Contenedor interno para asegurar que los bordes redondeados se apliquen correctamente */}
                      {value.categorías.map((sub) => {
                        const filterQuery = `${value.filterType}=${sub.slug}`;
                        const fullLink = `${CATALOGO_BASE_PATH}?${filterQuery}`;
                        return (
                          <Link
                            key={sub.slug}
                            to={fullLink}
                            onClick={handleLinkClick} // Esto cerrará el dropdown al hacer clic en un link
                            role="menuitem"
                            className={
                              "block px-4 py-1.5 text-base sm:text-sm text-textPrimary hover:text-primary hover:bg-accent " +
                              "transition-colors duration-150 whitespace-nowrap flex items-center"
                            }
                          >
                            {sub.icon && <DynamicIcon name={sub.icon} className="w-4 h-4 mr-2 text-textTertiary" />}
                            {sub.nombre}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            // Para links directos como "Agendar Cita", "Ubicacion", etc.
            if (value.link) {
              return (
                <Link
                  key={value.link}
                  to={value.link}
                  onClick={handleLinkClick}
                  className={
                    "w-full md:w-auto hover:text-primary px-3 py-2 text-base sm:text-sm font-medium text-textPrimary text-nowrap " +
                    "flex items-center rounded-md transition-colors duration-200 hover:bg-accent" // hover:bg-accent para consistencia
                  }
                >
                  {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Link>
              );
            }
            return null;
          })}

          <div className="flex items-center sm:ml-10 sm:-mr-3 w-full justify-end py-3 sm:py-0">
            <p className="mr-2 flex sm:hidden text-textPrimary dark:text-white">Cambiar tema</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                checked={theme === "dark"}
              />
              <div className="w-12 h-6 rounded-full bg-gradient-to-r from-yellow-600 to-seconda peer-checked:from-purple-800 peer-checked:to-background transition-all duration-500 after:content-['☀️'] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:flex after:items-center after:justify-center after:transition-all after:duration-500 peer-checked:after:translate-x-6 peer-checked:after:content-['🌙'] after:shadow-md after:text-xs"></div>
            </label>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
