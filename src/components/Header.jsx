import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BUSINESS_NAME, STATIC_NAV_ITEMS, CATALOGO_BASE_PATH, ADMIN_ITEMS } from "../constants/navbar.jsx";
import CRButton from "./UI/CRButton.jsx";
import { useTheme } from "../context/ThemeProvider.jsx";
import { DynamicIcon } from "../utils/DynamicIcon.jsx";
import useStoreNails from "../store/store.js";
import useAuthStore from "../store/authStore.js";
import { LogIn, LogOut, AlertTriangle, Loader2 } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false); // Para el menú principal del header en móvil
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRefs = useRef({});
  const hoverTimeoutRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { dynamicNavItems, isLoadingDynamicNav, errorDynamicNav, fetchDynamicNavItems, adminSidebarOpen, toggleAdminSidebar } = useStoreNails();
  const { isAuthenticated, logout: authLogoutAction, user } = useAuthStore();

  const combinedNavItems = useMemo(() => {
    const safeDynamicNavItems = typeof dynamicNavItems === "object" && dynamicNavItems !== null ? dynamicNavItems : {};
    return { ...safeDynamicNavItems, ...STATIC_NAV_ITEMS };
  }, [dynamicNavItems]);

  const closeAllMenus = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const handleLogout = async () => {
    closeAllMenus();
    await authLogoutAction();
    navigate("/");
  };

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setActiveDropdown(null);
        }
      }

      const mobileMenuButton = document.getElementById("mobile-header-menu-button");
      const mobileMenuContent = document.getElementById("mobile-menu-content");

      if (isOpen && mobileMenuContent && !mobileMenuContent.contains(event.target) && mobileMenuButton && !mobileMenuButton.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, activeDropdown]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
        setActiveDropdown(null);
      }, 200);
    }
  };

  const handleDropdownLinkClick = (to, event) => {
    event.preventDefault();
    event.stopPropagation();
    closeAllMenus();
    setTimeout(() => {
      navigate(to);
    }, 0);
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
      <Link to="/login" onClick={closeAllMenus}>
        <CRButton
          title="Login"
          externalIcon={<LogIn className={forMobile ? "w-5 h-5" : "w-4 h-4"} />}
          iconPosition="left"
          className={
            forMobile
              ? "bg-transparent text-textPrimary hover:text-primary w-full justify-start !my-0 px-0 py-2"
              : "border border-border text-textPrimary hover:border-primary hover:text-primary !my-0 px-2 py-1 text-sm"
          }
          position={forMobile ? "left" : undefined}
        />
      </Link>
    );
  };

  const DropdownItem = ({ sub, linkTo, isMobileVersion = false }) => (
    <a
      href={linkTo}
      onClick={(e) => handleDropdownLinkClick(linkTo, e)}
      role="menuitem"
      className={
        `block px-4 py-1.5 ${isMobileVersion ? "text-base" : "text-sm"} text-textPrimary hover:text-primary hover:bg-accent ` +
        "transition-colors duration-150 whitespace-nowrap flex items-center cursor-pointer"
      }
    >
      {sub.icon && <DynamicIcon name={sub.icon} className="w-4 h-4 mr-2 text-textTertiary" />}
      {sub.nombre}
    </a>
  );

  const renderNavItems = (itemsToRender, isAdminMenu = false) => {
    const safeItemsToRender = typeof itemsToRender === "object" && itemsToRender !== null ? itemsToRender : {};

    if (isLoadingDynamicNav && !isAdminMenu && Object.keys(dynamicNavItems).length === 0) {
      return (
        <div className="flex items-center justify-center px-3 py-2 text-sm text-textPrimary">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Cargando categorías...
        </div>
      );
    }
    if (errorDynamicNav && !isAdminMenu && Object.keys(dynamicNavItems).length === 0) {
      return (
        <div className="flex items-center justify-center px-3 py-2 text-sm text-red-600 dark:text-red-400" title={errorDynamicNav ?? undefined}>
          <AlertTriangle className="w-5 h-5 mr-2" />
          Error al cargar
          <button onClick={fetchDynamicNavItems} className="ml-2 text-xs underline hover:text-red-800 dark:hover:text-red-300">
            (Reintentar)
          </button>
        </div>
      );
    }

    return Object.entries(safeItemsToRender).map(([key, value]) => {
      if (!value) return null;

      if (!value.categorías && !value.link && !isAdminMenu && isLoadingDynamicNav) {
        return null;
      }
      if (value.filterType && (!value.categorías || value.categorías.length === 0) && !isAdminMenu) {
        return null;
      }

      const isFilterDropdown =
        value.categorías && Array.isArray(value.categorías) && value.categorías.length > 0 && (value.filterType || isAdminMenu);
      const isActive = activeDropdown === key;

      if (isFilterDropdown) {
        return (
          <div
            key={key}
            ref={(el) => (dropdownRefs.current[key] = el)}
            className="relative"
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={
                "flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 " +
                (isActive ? "text-primary bg-accent" : "text-textPrimary hover:text-primary")
              }
              onClick={() => handleToggleDropdown(key)}
              aria-expanded={isActive}
              aria-haspopup="true"
            >
              <span className="flex items-center">
                {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <DynamicIcon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
            </button>

            {isActive && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-background rounded-lg shadow-lg py-2 min-w-[12rem] z-50 border border-border">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-background border-l border-t border-border rotate-45"></div>
                {value.categorías.map((sub) => {
                  let linkTo;
                  if (isAdminMenu) {
                    linkTo = sub.slug;
                  } else {
                    const filterQuery = `${value.filterType}=${sub.slug}`;
                    linkTo = `${CATALOGO_BASE_PATH}?${filterQuery}`;
                  }
                  return <DropdownItem key={sub.slug + linkTo} sub={sub} linkTo={linkTo} isAdminMenu={isAdminMenu} isMobileVersion={false} />;
                })}
              </div>
            )}
          </div>
        );
      }

      if (value.link) {
        return (
          <Link
            key={value.link}
            to={value.link}
            onClick={closeAllMenus}
            className="px-3 py-2 text-sm font-medium text-textPrimary hover:text-primary flex items-center rounded-md transition-colors duration-200 hover:bg-accent"
          >
            {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Link>
        );
      }
      return null;
    });
  };

  const renderMobileNavItems = (itemsToRender, isAdminMenu = false) => {
    const safeItemsToRender = typeof itemsToRender === "object" && itemsToRender !== null ? itemsToRender : {};

    if (isLoadingDynamicNav && !isAdminMenu && Object.keys(dynamicNavItems).length === 0) {
      return (
        <div className="flex items-center justify-center px-4 py-2 text-base text-textPrimary">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Cargando categorías...
        </div>
      );
    }
    if (errorDynamicNav && !isAdminMenu && Object.keys(dynamicNavItems).length === 0) {
      return (
        <div className="flex items-center justify-center px-4 py-2 text-base text-red-600 dark:text-red-400" title={errorDynamicNav ?? undefined}>
          <AlertTriangle className="w-5 h-5 mr-2" />
          Error al cargar
          <button onClick={fetchDynamicNavItems} className="ml-2 text-xs underline hover:text-red-800 dark:hover:text-red-300">
            (Reintentar)
          </button>
        </div>
      );
    }

    return Object.entries(safeItemsToRender).map(([key, value]) => {
      if (!value) return null;

      if (!value.categorías && !value.link && !isAdminMenu && isLoadingDynamicNav) {
        return null;
      }
      if (value.filterType && (!value.categorías || value.categorías.length === 0) && !isAdminMenu) {
        return null;
      }

      const isFilterDropdown =
        value.categorías && Array.isArray(value.categorías) && value.categorías.length > 0 && (value.filterType || isAdminMenu);
      const isActive = activeDropdown === key;

      if (isFilterDropdown) {
        return (
          <div key={key} ref={(el) => (dropdownRefs.current[key] = el)} className="w-full mt-1">
            <button
              type="button"
              className={
                "flex items-center justify-between w-full px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 " +
                (isActive ? "text-primary bg-accent" : "text-textPrimary hover:text-primary")
              }
              onClick={() => handleToggleDropdown(key)}
              aria-expanded={isActive}
              aria-haspopup="true"
            >
              <span className="flex items-center">
                {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <DynamicIcon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
            </button>

            {isActive && (
              <div className="mt-1 bg-background rounded-lg shadow-lg py-1 border border-border">
                {value.categorías.map((sub) => {
                  let linkTo;
                  if (isAdminMenu) {
                    linkTo = sub.slug;
                  } else {
                    const filterQuery = `${value.filterType}=${sub.slug}`;
                    linkTo = `${CATALOGO_BASE_PATH}?${filterQuery}`;
                  }
                  return <DropdownItem key={sub.slug + linkTo} sub={sub} linkTo={linkTo} isAdminMenu={isAdminMenu} isMobileVersion={true} />;
                })}
              </div>
            )}
          </div>
        );
      }

      if (value.link) {
        return (
          <Link
            key={value.link}
            to={value.link}
            onClick={closeAllMenus}
            className="w-full px-4 py-2 text-base font-medium text-textPrimary hover:text-primary flex items-center rounded-md transition-colors duration-200 hover:bg-accent"
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
    <header className="w-full bg-background shadow-md sticky top-0 z-50">
      {/* Header con z-50 */}
      <div className="mx-auto px-4 flex items-center justify-between h-16 relative">
        {/* ---- Sección Izquierda ---- */}
        <div className="flex-shrink-0 w-auto min-w-[40px]">
          {/* Asegura un ancho mínimo para el botón */}
          {isAuthenticated && isMobile ? (
            <button
              type="button"
              onClick={toggleAdminSidebar}
              className="p-2 rounded-md text-primary hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={adminSidebarOpen ? "Cerrar panel de administrador" : "Abrir panel de administrador"}
            >
              <DynamicIcon name={adminSidebarOpen ? "X" : "PanelLeftOpen"} size={24} />
            </button>
          ) : !isMobile ? (
            <Link to="/" className="flex items-center" onClick={closeAllMenus}>
              <img src="/nayeNails.svg" alt={BUSINESS_NAME} className="h-8 w-auto mr-2 dark:invert" />
              <h1 className="text-primary text-xl sm:text-2xl font-bold tracking-tight">{BUSINESS_NAME}</h1>
            </Link>
          ) : (
            <div className="w-10 h-10"></div>
          )}
        </div>

        {/* ---- Sección Central (Título) ---- */}
        <div
          className={`
          ${
            (isAuthenticated && isMobile) || (!isAuthenticated && isMobile) /* Siempre visible en móvil */
              ? "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center"
              : "hidden" /* Oculto en desktop ya que el título está a la izquierda */
          }
        `}
        >
          <Link to="/" className="flex items-center" onClick={closeAllMenus}>
            <h1 className="text-primary text-xl sm:text-2xl font-bold tracking-tight">{BUSINESS_NAME}</h1>
          </Link>
        </div>

        {/* ---- Sección Derecha ---- */}
        <div className="flex-shrink-0 min-w-[40px]">
          {" "}
          {/* Asegura un ancho mínimo */}
          {isMobile ? (
            <button
              id="mobile-header-menu-button"
              type="button"
              className="p-2 rounded-md text-primary hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu-content"
              aria-label={isOpen ? "Cerrar menú principal" : "Abrir menú principal"}
            >
              <DynamicIcon name={isOpen ? "X" : "Menu"} size={24} />
            </button>
          ) : (
            <div className="flex items-center">
              <nav className="flex items-center gap-x-1 lg:gap-x-2">
                {renderNavItems(combinedNavItems)}
                {isAuthenticated && user && renderNavItems(ADMIN_ITEMS, true)}
              </nav>
              <div className="flex items-center ml-4">
                <label className="relative inline-flex items-center cursor-pointer mr-4">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                    checked={theme === "dark"}
                  />
                  <div className="w-12 h-6 rounded-full bg-gradient-to-r from-yellow-600 to-seconda peer-checked:from-purple-800 peer-checked:to-background transition-all duration-500 after:content-['☀️'] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:flex after:items-center after:justify-center after:transition-all after:duration-500 peer-checked:after:translate-x-6 peer-checked:after:content-['🌙'] after:shadow-md after:text-xs"></div>
                </label>
                <AuthButton forMobile={false} />
              </div>
            </div>
          )}
        </div>
      </div>
      {isOpen && isMobile && (
        <nav
          id="mobile-menu-content"
          className="absolute md:hidden top-full left-0 right-0 w-full bg-background shadow-lg flex flex-col items-stretch gap-y-0 px-4 py-2 z-40 border-t border-border" // z-40 para el menú principal
        >
          {renderMobileNavItems(combinedNavItems)}
          {isAuthenticated && user && renderMobileNavItems(ADMIN_ITEMS, true)}
          <div className="flex items-center justify-between w-full py-3 border-t border-border mt-2">
            <div className="flex-shrink-0">
              <AuthButton forMobile={true} />
            </div>
            <div className="flex items-center">
              <p className="mr-2 flex text-textPrimary">Tema</p>
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
      )}
    </header>
  );
};

export default Header;
