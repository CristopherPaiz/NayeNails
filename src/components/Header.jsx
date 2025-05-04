// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Importa Link
import { BUSINESS_NAME, NAV_ITEMS } from "../constants/navbar.jsx";
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
      if (activeDropdown && !event.target.closest(`[data-dropdown-key="${activeDropdown}"]`)) {
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
        let isFocusInsideAnyDropdown = false;
        Object.values(dropdownRefs.current).forEach((ref) => {
          if (ref?.contains(document.activeElement)) {
            isFocusInsideAnyDropdown = true;
          }
        });
        if (!isFocusInsideAnyDropdown) {
          setActiveDropdown(null);
        }
      }, 300);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMessage(`Navegaste a las ${new Date().toLocaleTimeString()}`);
  };

  return (
    <header className="w-full bg-background shadow-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between relative">
        <Link to="/" className="flex items-center" onClick={handleLinkClick}>
          <h1 className="text-primary text-2xl md:text-3xl font-bold tracking-tight">{BUSINESS_NAME}</h1>
        </Link>
        <button
          className={
            "md:hidden flex items-center justify-center p-2 rounded-md text-primary " +
            "hover:text-primary hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          }
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <DynamicIcon name={isOpen ? "X" : "Menu"} size={24} />
        </button>
        <nav
          className={
            "absolute md:static top-full left-0 w-full md:w-auto " +
            "bg-background md:bg-transparent shadow-md md:shadow-none " +
            "flex flex-col md:flex-row items-stretch md:items-center gap-y-0 md:gap-x-4 " +
            "px-4 pt-2 pb-2 md:p-0 z-40 " +
            "origin-top duration-200 ease-in-out " +
            (isOpen
              ? "opacity-100 scale-y-100 translate-y-0"
              : "opacity-0 scale-y-0 -translate-y-4 md:opacity-100 md:scale-y-100 md:translate-y-0 h-0 md:h-auto overflow-hidden md:overflow-visible")
          }
        >
          {Object.entries(NAV_ITEMS).map(([key, value]) => {
            const isDropdown = value.categorías && Array.isArray(value.categorías);
            const isActive = activeDropdown === key;

            if (isDropdown) {
              const basePath = `/${key.toLowerCase().replace(/\s+/g, "-")}`;
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
                      "px-3 py-2 rounded-md text-textPrimary dark:text-textPrimary hover:text-primary text-base font-medium transition-colors duration-200 " +
                      (isActive ? "text-primary dark:text-primary bg-accent md:bg-transparent" : "")
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
                  <div
                    className={
                      "md:mt-2 md:absolute left-0 md:left-1/2 md:-translate-x-1/2 " +
                      "bg-background rounded-lg shadow-lg py-0 md:py-2 min-w-max md:w-48 " +
                      "transition-all duration-200 overflow-hidden " +
                      (isActive
                        ? "opacity-100 max-h-96 scale-100 " + (isMobile ? "pb-2 mb-2" : "")
                        : "opacity-0 max-h-0 md:max-h-0 scale-95 pointer-events-none")
                    }
                  >
                    <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-[-1]">
                      <div className="w-4 h-4 bg-background transform rotate-45 border-t border-l border-gray-200 dark:border-gray-700 shadow-sm"></div>{" "}
                    </div>
                    <div className="relative bg-background rounded-lg md:shadow-lg py-1 md:py-0">
                      {value.categorías.map((sub) => {
                        const subLink = `${basePath}${sub.link}`;
                        return (
                          <Link
                            key={sub.link}
                            to={subLink}
                            onClick={handleLinkClick}
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
            return (
              <Link
                key={value.link}
                to={value.link}
                onClick={handleLinkClick}
                className={
                  "w-full md:w-auto hover:text-primary px-3 py-2 text-base font-medium text-textPrimary text-nowrap " +
                  "flex items-center rounded-md transition-colors duration-200"
                }
              >
                {value.icon && <DynamicIcon name={value.icon} className="w-5 h-5 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            );
          })}
          <CRButton
            className="bg-primary text-white mt-2 md:mt-0 md:ml-2"
            title={theme === "light" ? "🌙" : "☀️"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
