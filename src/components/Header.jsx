
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BUSINESS_NAME, NAV_ITEMS, CATALOGO_BASE_PATH, ADMIN_ITEMS } from "../constants/navbar.jsx";
import CRButton from "./UI/CRButton.jsx";
import { useTheme } from "../context/ThemeProvider.jsx";
import { DynamicIcon } from "../utils/DynamicIcon.jsx";
import useExampleStore from "../store/store.js";
import useAuthStore from "../store/authStore.js";
import { LogIn, LogOut } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRefs = useRef({});
  const hoverTimeoutRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const setMessage = useExampleStore((state) => state.setMessage);

  const { isAuthenticated, logout: authLogoutAction } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsOpen(false);
    await authLogoutAction();
    navigate("/");
  };

  const handleLoginNav = () => {
    setIsOpen(false);
  };

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
      let clickedInsideDropdown = false;
      if (activeDropdown) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && dropdownElement.contains(event.target)) {
          clickedInsideDropdown = true;
        }
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
        let isFocusInsideAnyDropdownContent = false;
        Object.values(dropdownRefs.current).forEach((ref) => {
          const dropdownContent = ref?.querySelector('div[role="menu"], div.py-1');
          if (dropdownContent?.contains(document.activeElement)) {
            isFocusInsideAnyDropdownContent = true;
          }
        });
        if (!isFocusInsideAnyDropdownContent) {
          setActiveDropdown(null);
        }
      }, 200);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMessage(`Navegaste a las ${new Date().toLocaleTimeString()}`);
  };

  const AuthButton = ({ forMobile = false }) => {
    if (isAuthenticated) {
      return (
        <CRButton
          onClick={handleLogout}
          title="Salir"
          externalIcon={<LogOut className={forMobile ? "w-5 h-5" : "w-4 h-4"} />}
          iconPosition="left"
          className={
            forMobile
              ? "bg-transparent text-textPrimary hover:text-primary w-full justify-start !my-0 px-0 py-2"
              : "bg-transparent text-textPrimary hover:text-primary !my-0 px-2 py-1 text-sm"
          }
          position={forMobile ? "left" : undefined}
        />
      );
    }
    return (
      <Link to="/login" onClick={handleLoginNav} className={forMobile ? "w-full block" : "block"}>
        <CRButton
          title="Login"
          externalIcon={<LogIn className={forMobile ? "w-5 h-5" : "w-4 h-4"} />}
          iconPosition="left"
          className={
            forMobile
              ? "bg-transparent text-textPrimary hover:text-primary w-full justify-start !my-0 px-0 py-2"
              : "border border-border text-textPrimary hover:border-primary hover:text-primary !my-0 px-2 py-1 text-sm"
          }
          onClick={undefined}
          position={forMobile ? "left" : undefined}
        />
      </Link>
    );
  };

  const renderNavItems = (items, isAdminMenu = false) => {
    return Object.entries(items).map(([key, value]) => {
      const isFilterDropdown = value.categorías && Array.isArray(value.categorías) && (value.filterType || isAdminMenu);
      const isActive = activeDropdown === key;

      if (isFilterDropdown) {
        return (
          <div
            key={key}
            ref={(el) => (dropdownRefs.current[key] = el)}
            data-dropdown-key={key}
            className="relative w-auto mt-0"
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={
                "flex items-center justify-center w-auto " +
                "px-3 py-2 rounded-md text-textPrimary dark:text-textPrimary hover:text-primary text-sm font-medium transition-colors duration-200 " +
                (isActive ? "text-primary dark:text-primary bg-accent" : "")
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
                "mt-2 absolute left-1/2 -translate-x-1/2 " +
                "bg-background rounded-lg shadow-lg py-2 min-w-[12rem] " +
                "transition-all duration-200 overflow-hidden " +
                (isActive ? "opacity-100 max-h-96 scale-100 " : "opacity-0 max-h-0 scale-95 pointer-events-none")
              }
            >
              {!isMobile && isActive && (
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-[-1]">
                  <div className="w-4 h-4 bg-background transform rotate-45 border-t border-l border-border dark:border-border shadow-sm"></div>
                </div>
              )}
              <div className="relative bg-background rounded-lg md:shadow-lg py-0">
                {value.categorías.map((sub) => {
                  let linkTo;
                  if (isAdminMenu) {
                    linkTo = sub.slug;
                  } else {
                    const filterQuery = `${value.filterType}=${sub.slug}`;
                    linkTo = `${CATALOGO_BASE_PATH}?${filterQuery}`;
                  }
                  return (
                    <Link
                      key={sub.slug}
                      to={linkTo}
                      onClick={handleLinkClick}
                      role="menuitem"
                      className={
                        "block px-4 py-1.5 text-sm text-textPrimary hover:text-primary hover:bg-accent " +
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
      if (value.link) {
        return (
          <Link
            key={value.link}
            to={value.link}
            onClick={handleLinkClick}
            className={
              "w-auto hover:text-primary px-3 py-2 text-sm font-medium text-textPrimary text-nowrap " +
              "flex items-center rounded-md transition-colors duration-200 hover:bg-accent"
            }
          >
            {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Link>
        );
      }
      return null;
    });
  };

  const renderMobileNavItems = (items, isAdminMenu = false) => {
    return Object.entries(items).map(([key, value]) => {
      const isFilterDropdown = value.categorías && Array.isArray(value.categorías) && (value.filterType || isAdminMenu);
      const isActive = activeDropdown === key;

      if (isFilterDropdown) {
        return (
          <div key={key} ref={(el) => (dropdownRefs.current[key] = el)} data-dropdown-key={key} className="relative w-full mt-1">
            <button
              className={
                "flex items-center justify-between w-full " +
                "px-4 py-2 rounded-md text-textPrimary dark:text-textPrimary hover:text-primary text-base font-medium transition-colors duration-200 " +
                (isActive ? "text-primary dark:text-primary bg-accent" : "")
              }
              onClick={() => handleToggleDropdown(key)}
              aria-expanded={isActive}
              aria-haspopup="true"
              aria-controls={`dropdown-menu-${key}-mobile`}
            >
              <span className="flex items-center">
                {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <DynamicIcon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
            </button>
            <div
              id={`dropdown-menu-${key}-mobile`}
              role="menu"
              className={
                "mt-1 bg-background rounded-lg shadow-lg py-0 min-w-max " +
                "transition-all duration-200 overflow-hidden " +
                (isActive ? "opacity-100 max-h-96 scale-100 pb-2 mb-2" : "opacity-0 max-h-0 scale-95 pointer-events-none")
              }
            >
              <div className="relative bg-background rounded-lg py-1">
                {value.categorías.map((sub) => {
                  let linkTo;
                  if (isAdminMenu) {
                    linkTo = sub.slug;
                  } else {
                    const filterQuery = `${value.filterType}=${sub.slug}`;
                    linkTo = `${CATALOGO_BASE_PATH}?${filterQuery}`;
                  }
                  return (
                    <Link
                      key={sub.slug}
                      to={linkTo}
                      onClick={handleLinkClick}
                      role="menuitem"
                      className={
                        "block px-4 py-1.5 text-base text-textPrimary hover:text-primary hover:bg-accent " +
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
      if (value.link) {
        return (
          <Link
            key={value.link}
            to={value.link}
            onClick={handleLinkClick}
            className={
              "w-full hover:text-primary px-4 py-2 text-base font-medium text-textPrimary text-nowrap " +
              "flex items-center rounded-md transition-colors duration-200 hover:bg-accent"
            }
          >
            {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Link>
        );
      }
      return null;
    });
  };

  return (
    <header className="w-full sm:px-8 bg-background shadow-md sticky top-0 z-50">
      {/* Contenedor principal del Header con max-w y centrado */}
      <div className="mx-auto px-4 sm:px-0 py-2 sm:py-2 sm:pl-8 flex items-center justify-between relative h-16">
        {/* IZQUIERDA: Logo / Título del Negocio */}
        <div className="flex-shrink-0">
          {" "}
          {/* Evita que el logo se encoja demasiado */}
          <Link to="/" className="flex items-center" onClick={handleLinkClick}>
            <h1 className="text-primary text-xl sm:text-2xl font-bold tracking-tight">{BUSINESS_NAME}</h1>
          </Link>
        </div>

        {/* CENTRO: Navegación Principal (solo en desktop) */}
        <nav className="hidden md:flex flex-grow justify-center items-center gap-x-1 lg:gap-x-2">
          {" "}
          {/* flex-grow y justify-center */}
          {renderNavItems(NAV_ITEMS)}
          {isAuthenticated && renderNavItems(ADMIN_ITEMS, true)}
        </nav>

        {/* DERECHA: Theme Switcher y Botón de Auth (solo en desktop) */}
        <div className="hidden md:flex items-center flex-shrink-0 ml-auto">
          {" "}
          {/* ml-auto para empujar a la derecha, flex-shrink-0 */}
          <div className="flex items-center">
            {/* <p className="mr-2 hidden text-textPrimary dark:text-white">Cambiar tema</p> */} {/* Ocultado por simplicidad */}
            <label className="relative inline-flex items-center cursor-pointer mr-4">
              {" "}
              {/* Margen a la derecha */}
              <input
                className="sr-only peer"
                type="checkbox"
                onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                checked={theme === "dark"}
              />
              <div className="w-12 h-6 rounded-full bg-gradient-to-r from-yellow-600 to-seconda peer-checked:from-purple-800 peer-checked:to-background transition-all duration-500 after:content-['☀️'] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:flex after:items-center after:justify-center after:transition-all after:duration-500 peer-checked:after:translate-x-6 peer-checked:after:content-['🌙'] after:shadow-md after:text-xs"></div>
            </label>
          </div>
          <AuthButton forMobile={false} />
        </div>

        {/* DERECHA (MOBILE): Botón Hamburguesa */}
        <div className="md:hidden flex-shrink-0">
          {" "}
          {/* Contenedor para el botón hamburguesa en mobile */}
          <button
            className={
              "flex items-center justify-center p-2 rounded-md text-primary " +
              "hover:text-primary hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            }
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <DynamicIcon name={isOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* NAVEGACIÓN MÓVIL (Menú Hamburguesa Desplegable) */}
        <nav
          id="mobile-menu"
          className={
            "absolute md:hidden top-full left-0 right-0 w-full " +
            "bg-background shadow-md " +
            "flex flex-col items-stretch gap-y-0 " +
            "px-4 py-2 z-40 " +
            "origin-top duration-200 ease-in-out " +
            (isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-0 -translate-y-4 h-0 overflow-hidden")
          }
        >
          {renderMobileNavItems(NAV_ITEMS)}
          {isAuthenticated && renderMobileNavItems(ADMIN_ITEMS, true)}

          <div className="flex items-center justify-between w-full py-3 border-t border-border mt-2">
            <div className="flex-shrink-0">
              <AuthButton forMobile={true} />
            </div>
            <div className="flex items-center">
              <p className="mr-2 flex text-textPrimary dark:text-white">Tema</p> {/* Simplificado */}
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
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
