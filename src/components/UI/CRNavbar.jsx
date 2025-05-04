/* eslint-disable react/jsx-no-undef */
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
// import { Link } from "react-router-dom";

/**
 * Componente CRNavbar
 *
 * Este componente renderiza una barra de navegación configurable que puede orientarse en la parte superior o izquierda de la pantalla. Soporta un logotipo, enlaces, botones de llamada a la acción (CTA), menús desplegables, perfiles de usuario y opciones para adaptarse a la navegación móvil.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {"top"|"left"} [props.orientation="top"] - Define la orientación del navbar (superior o izquierda).
 * @param {Object} [props.logo] - Configuración del logotipo.
 * @param {string} [props.logo.img=""] - URL de la imagen del logotipo.
 * @param {string} [props.logo.label="Logo"] - Texto alternativo si no hay imagen.
 * @param {string} [props.logo.size="h-6"] - Tamaño de la imagen del logotipo.
 * @param {string} [props.logo.path="/"] - Ruta de navegación del logotipo.
 * @param {boolean} [props.useRouter=false] - Indica si se debe usar un enrutador como `Link` para la navegación interna.
 * @param {boolean} [props.isSticky=false] - Indica si el navbar debe ser sticky (fijo al hacer scroll).
 * @param {boolean} [props.useMenu=true] - Habilita o deshabilita el menú móvil.
 * @param {Array<Object>} [props.ctaButtons=[]] - Botones de llamada a la acción (CTA).
 * @param {Array<Object>} [props.links=[]] - Lista de enlaces de navegación.
 * @param {boolean} [props.auth=false] - Indica si el usuario está autenticado.
 * @param {Object} [props.useProfile=null] - Información del perfil del usuario (si se usa).
 *
 * @example
 * // Ejemplo simple
 * <CRNavbar
 *   logo={{ img: "logo.png", label: "Mi App", path: "/" }}
 *   links={[{ label: "Inicio", path: "/" }, { label: "Acerca de", path: "/about" }]}
 * />
 *
 * @example
 * // Ejemplo intermedio con botones de acción y enlaces autenticados
 * <CRNavbar
 *   isSticky={true}
 *   ctaButtons={[{ label: "Iniciar sesión", onClick: () => alert('Login') }]}
 *   links={[
 *     { label: "Inicio", path: "/" },
 *     { label: "Perfil", path: "/profile", needAuthenticate: true }
 *   ]}
 *   auth={true}
 * />
 *
 * @example
 * // Ejemplo avanzado con todo configurado
 * <CRNavbar
 *   orientation="left"
 *   logo={{ img: "logo.png", label: "Mi App", size: "h-8", path: "/" }}
 *   isSticky={true}
 *   useRouter={true}
 *   useMenu={true}
 *   ctaButtons={[
 *     { label: "Iniciar sesión", onClick: () => alert('Login'), icon: <IconUser />, className: "custom-class" },
 *     { label: "Registrarse", onClick: () => alert('Signup'), icon: <IconSignup /> }
 *   ]}
 *   links={[
 *     {
 *       label: "Inicio",
 *       path: "/",
 *       icon: <IconHome />,
 *       dropdown: [
 *         { label: "Sub-enlace 1", path: "/sub1" },
 *         { label: "Sub-enlace 2", path: "/sub2" }
 *       ]
 *     },
 *     { label: "Acerca de", path: "/about", icon: <IconAbout /> }
 *   ]}
 *   auth={true}
 *   useProfile={{ label: "Perfil", onClick: () => alert('Perfil'), icon: <ProfileIcon /> }}
 * />
 *
 * @example
 * //Ejemplo super avanzado con todo configurado, enrutar y funciones por botones
 *   const [isAuthenticated, setIsAuthenticated] = useState(false);
 *
 *  const handleSignUp = () => {
 *    console.log("Sign Up clicked");
 *  };
 *
 *  const handleLogIn = () => {
 *    console.log("Log In clicked");
 *    setIsAuthenticated(true);
 *  };
 *
 *  const handleLogOut = () => {
 *    console.log("Log Out clicked");
 *    setIsAuthenticated(false);
 *  };
 *
 *  const handleProfile = () => {
 *    console.log("Profile clicked");
 *  };
 *
 *  const logoConfig = {
 *    label: "MyApp",
 *    size: "h-8 w-auto",
 *    path: "/",
 *  };
 *
 *  const ctaButtons = [
 *    {
 *      label: "Sign Up",
 *      onClick: handleSignUp,
 *      icon: (
 *        <svg
 *          xmlns="http://www.w3.org/2000/svg"
 *          width="18"
 *          height="18"
 *          viewBox="0 0 24 24"
 *          fill="none"
 *          stroke="currentColor"
 *          strokeWidth="2"
 *          strokeLinecap="round"
 *          strokeLinejoin="round"
 *        >
 *          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
 *          <circle cx="12" cy="7" r="4"></circle>
 *        </svg>
 *      ),
 *    },
 *    {
 *      label: "Log In",
 *      onClick: handleLogIn,
 *      icon: (
 *        <svg
 *          xmlns="http://www.w3.org/2000/svg"
 *          width="18"
 *          height="18"
 *          viewBox="0 0 24 24"
 *          fill="none"
 *          stroke="currentColor"
 *          strokeWidth="2"
 *          strokeLinecap="round"
 *          strokeLinejoin="round"
 *        >
 *          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
 *          <polyline points="10 17 15 12 10 7"></polyline>
 *          <line x1="15" y1="12" x2="3" y2="12"></line>
 *        </svg>
 *      ),
 *    },
 *  ];
 *
 *  const links = [
 *    {
 *      label: "Home",
 *      icon: (
 *        <svg
 *          xmlns="http://www.w3.org/2000/svg"
 *          width="18"
 *          height="18"
 *          viewBox="0 0 24 24"
 *          fill="none"
 *          stroke="currentColor"
 *          strokeWidth="2"
 *          strokeLinecap="round"
 *          strokeLinejoin="round"
 *        >
 *          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
 *          <polyline points="9 22 9 12 15 12 15 22"></polyline>
 *        </svg>
 *      ),
 *      path: "/",
 *      needAuthenticate: false,
 *    },
 *    {
 *      label: "Products",
 *      icon: (
 *        <svg
 *          xmlns="http://www.w3.org/2000/svg"
 *          width="18"
 *          height="18"
 *          viewBox="0 0 24 24"
 *          fill="none"
 *          stroke="currentColor"
 *          strokeWidth="2"
 *          strokeLinecap="round"
 *          strokeLinejoin="round"
 *        >
 *          <circle cx="9" cy="21" r="1"></circle>
 *          <circle cx="20" cy="21" r="1"></circle>
 *          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
 *        </svg>
 *      ),
 *      needAuthenticate: false,
 *      dropdown: [
 *        {
 *          label: "Electronics",
 *          path: "/products/electronics",
 *          icon: (
 *            <svg
 *              xmlns="http://www.w3.org/2000/svg"
 *              width="18"
 *              height="18"
 *              viewBox="0 0 24 24"
 *              fill="none"
 *              stroke="currentColor"
 *              strokeWidth="2"
 *              strokeLinecap="round"
 *              strokeLinejoin="round"
 *            >
 *              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
 *              <rect x="9" y="9" width="6" height="6"></rect>
 *              <line x1="9" y1="1" x2="9" y2="4"></line>
 *              <line x1="15" y1="1" x2="15" y2="4"></line>
 *              <line x1="9" y1="20" x2="9" y2="23"></line>
 *              <line x1="15" y1="20" x2="15" y2="23"></line>
 *              <line x1="20" y1="9" x2="23" y2="9"></line>
 *              <line x1="20" y1="14" x2="23" y2="14"></line>
 *              <line x1="1" y1="9" x2="4" y2="9"></line>
 *              <line x1="1" y1="14" x2="4" y2="14"></line>
 *            </svg>
 *          ),
 *        },
 *        {
 *          label: "Clothing",
 *          path: "/products/clothing",
 *          icon: (
 *            <svg
 *              xmlns="http://www.w3.org/2000/svg"
 *              width="18"
 *              height="18"
 *              viewBox="0 0 24 24"
 *              fill="none"
 *              stroke="currentColor"
 *              strokeWidth="2"
 *              strokeLinecap="round"
 *              strokeLinejoin="round"
 *            >
 *              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 *2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
 *            </svg>
 *          ),
 *        },
 *      ],
 *    },
 *    {
 *      label: "Dashboard",
 *      icon: (
 *        <svg
 *          xmlns="http://www.w3.org/2000/svg"
 *          width="18"
 *          height="18"
 *          viewBox="0 0 24 24"
 *          fill="none"
 *          stroke="currentColor"
 *          strokeWidth="2"
 *          strokeLinecap="round"
 *          strokeLinejoin="round"
 *        >
 *          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
 *          <line x1="3" y1="9" x2="21" y2="9"></line>
 *          <line x1="9" y1="21" x2="9" y2="9"></line>
 *        </svg>
 *      ),
 *      path: "/dashboard",
 *      needAuthenticate: true,
 *    },
 *  ];
 *
 *  const profileConfig = {
 *    label: "John Doe",
 *    onClick: handleProfile,
 *    icon: (
 *      <svg
 *        xmlns="http://www.w3.org/2000/svg"
 *        width="24"
 *        height="24"
 *        viewBox="0 0 24 24"
 *        fill="none"
 *        stroke="currentColor"
 *        strokeWidth="2"
 *        strokeLinecap="round"
 *        strokeLinejoin="round"
 *      >
 *        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
 *        <circle cx="12" cy="7" r="4"></circle>
 *      </svg>
 *    ),
 *  };
 *
 *  <CRNavbar
 *       orientation="top"
 *       logo={logoConfig}
 *       useRouter={false}
 *       isSticky={true}
 *       useMenu={true}
 *       ctaButtons={
 *         isAuthenticated
 *           ? [
 *               {
 *                 label: "Log Out",
 *                 onClick: handleLogOut,
 *                 icon: (
 *                   <svg
 *                     xmlns="http://www.w3.org/2000/svg"
 *                     width="18"
 *                     height="18"
 *                     viewBox="0 0 24 24"
 *                     fill="none"
 *                     stroke="currentColor"
 *                     strokeWidth="2"
 *                     strokeLinecap="round"
 *                     strokeLinejoin="round"
 *                   >
 *                     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
 *                     <polyline points="16 17 21 12 16 7"></polyline>
 *                     <line x1="21" y1="12" x2="9" y2="12"></line>
 *                   </svg>
 *                 ),
 *               },
 *             ]
 *           : ctaButtons
 *       }
 *       links={links}
 *       auth={isAuthenticated}
 *       onlyIcons={true}
 *       useProfile={isAuthenticated ? profileConfig : null}
 *     />
 *
 *  @typedef {Object} Logo - Representa el logotipo del navbar.
 *  @property {string} img - URL de la imagen del logotipo.
 *  @property {string} label - Texto alternativo del logotipo.
 *  @property {string} size - Clase de tamaño de la imagen.
 * @property {string} path - Ruta de navegación del logotipo.
 *
 * @typedef {Object} Button - Representa un botón de llamada a la acción (CTA).
 * @property {string} label - Texto del botón.
 * @property {function} onClick - Función que se ejecuta al hacer clic.
 * @property {React.ReactNode} [icon] - Icono del botón (opcional).
 * @property {string} [className] - Clases adicionales para el botón.
 *
 * @typedef {Object} Link - Representa un enlace de navegación.
 * @property {string} label - Texto del enlace.
 * @property {string} [path] - Ruta de navegación.
 * @property {React.ReactNode} [icon] - Icono del enlace (opcional).
 * @property {boolean} [needAuthenticate] - Si el enlace requiere autenticación para mostrarse.
 * @property {string} [className] - Clases adicionales para el enlace.
 * @property {Array<Link>} [dropdown] - Lista de subenlaces en un menú desplegable (opcional).
 *
 * @typedef {Object} Profile - Representa la configuración del perfil del usuario.
 * @property {function} onClick - Función que se ejecuta al hacer clic en el perfil.
 * @property {string} label - Texto del perfil.
 * @property {React.ReactNode} [icon] - Icono del perfil (opcional).
 * @property {string} [className] - Clases adicionales para el botón de perfil.
 */

const CRNavbar = ({
  orientation = "top",
  logo = { img: "", label: "Logo", size: "h-6", path: "/" },
  useRouter = false,
  isSticky = false,
  useMenu = true,
  ctaButtons = [],
  links = [],
  auth = false,
  useProfile = null,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const isTopOriented = orientation === "top";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest("button")) {
        setIsMenuOpen(false);
        document.body.style.overflow = "auto";
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navbarClasses = `
    ${isTopOriented ? "h-16" : "w-64 h-screen"}
    bg-white dark:bg-neutral-800
    ${isSticky ? "sticky top-0 left-0" : ""}
    flex ${isTopOriented ? "flex-row" : "flex-col"}
    items-center justify-between
    px-4 py-2 z-[100] sm:shadow-lg shadow-xl border-b-[1px] border-neutral-400 dark:border-neutral-700
  `;

  const renderLogo = () => {
    if (useRouter) {
      return (
        <Link to={logo.path} className="flex items-center">
          {logo.img ? (
            <img src={logo.img} alt={logo.label} className={logo.size || "h-6 w-auto"} />
          ) : (
            <span className="text-black dark:text-white text-lg font-semibold">{logo.label}</span>
          )}
        </Link>
      );
    }

    return (
      <a href={logo.path} className="flex items-center">
        {logo.img ? (
          <img src={logo.img} alt={logo.label} className={logo.size || "h-6 w-auto"} />
        ) : (
          <span className="text-black dark:text-white text-lg font-semibold">{logo.label}</span>
        )}
      </a>
    );
  };

  const renderLinks = () => (
    <ul className={`flex ${isMobile || !isTopOriented ? "flex-col" : "flex-row"} items-center space-y-2 lg:space-y-0 lg:space-x-1 m-0 sm:mr-3`}>
      {links.map((link, index) => {
        if (link.needAuthenticate && !auth) return null;

        const commonProps = {
          className: `flex items-center text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-2 rounded-md ${
            !isTopOriented && !isMobile ? "justify-center lg:justify-start" : ""
          } cursor-pointer ${link.className || ""}`,
          onClick: (e) => {
            if (link.dropdown && isMobile) {
              e.preventDefault();
              setOpenDropdownIndex(openDropdownIndex === index ? null : index);
            } else {
              isMobile && setIsMenuOpen(false);
            }
          },
        };

        const LinkElement = useRouter ? (
          <Link to={link.path || "#"} {...commonProps}>
            {link.icon && <span className="mr-2">{link.icon}</span>}
            <span className={`transition-opacity duration-300 ${!isTopOriented && !isMobile ? "opacity-0 lg:group-hover:opacity-100" : "opacity-100"}`}>
              {link.label}
            </span>
          </Link>
        ) : (
          <a href={link.path || "#"} {...commonProps}>
            {link.icon && <span className="mr-2">{link.icon}</span>}
            <span className={`transition-opacity duration-300 ${!isTopOriented && !isMobile ? "opacity-0 lg:group-hover:opacity-100" : "opacity-100"}`}>
              {link.label}
            </span>
          </a>
        );

        return (
          <li key={index} className="relative group w-full text-nowrap">
            {LinkElement}
            {link.dropdown && (
              <ul
                className={`${
                  isMobile
                    ? `max-h-0 overflow-hidden transition-all duration-200 ${
                        openDropdownIndex === index ? "max-h-screen pt-2 pb-1 py-1 border-b-[1px] border-l-[1px] border-r-[1px] border-neutral-300" : ""
                      }`
                    : "absolute min-w-max invisible group-hover:visible opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 ease-in-out border-[1px] border-neutral-400 dark:border-neutral-900"
                }  bg-neutral-200 dark:bg-neutral-700 -mt-1 rounded-b-md shadow-lg pr-2 sm:pr-0 overflow-hidden`}
              >
                {link.dropdown.map((subLink, subIndex) => {
                  const subCommonProps = {
                    className: `flex flex-row items-center pl-7 sm:pl-5 sm:pr-5 sm:ml-0 px-4 py-2 text-black dark:text-white hover:scale-105 hover:font-semibold transition-all dark:hover:bg-neutral-600 cursor-pointer whitespace-nowrap ${
                      subLink.className || ""
                    }`,
                    onClick: () => isMobile && setIsMenuOpen(false),
                  };

                  return (
                    <li key={subIndex}>
                      {useRouter ? (
                        <Link to={subLink.path} {...subCommonProps}>
                          {subLink.icon && <span className="mr-2">{subLink.icon}</span>}
                          {subLink.label}
                        </Link>
                      ) : (
                        <a href={subLink.path} {...subCommonProps}>
                          {subLink.icon && <span className="mr-2">{subLink.icon}</span>}
                          {subLink.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  // El resto del componente permanece igual...
  const renderCTAButtons = () => (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} items-center space-y-2 lg:space-y-0 lg:space-x-2 ${isMobile ? "w-full mt-4" : ""}`}>
      {ctaButtons.map((button, index) => (
        <button
          key={index}
          onClick={() => {
            button.onClick();
            isMobile && setIsMenuOpen(false);
          }}
          className={`flex items-center justify-center text-black dark:text-white bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-2 rounded-md ${
            isMobile ? "w-full" : ""
          } ${button.className || ""}`}
        >
          {button.icon && <span className="mr-2">{button.icon}</span>}
          {button.label}
        </button>
      ))}
    </div>
  );

  const renderProfile = () =>
    useProfile && (
      <div className={`flex items-center sm:pt-0 pt-5`}>
        <button
          onClick={() => {
            useProfile.onClick();
            isMobile && setIsMenuOpen(false);
          }}
          className={`flex items-center w-full px-4 mr-2 py-4 sm:py-2 rounded-lg sm:w-auto bg-neutral-600 text-white dark:bg-neutral-900 dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer gap-1 sm:ml-0 ${
            useProfile.className || ""
          }`}
        >
          {useProfile.icon ? (
            <div className="w-auto min-h-4 max-h-6 mr-1">{useProfile.icon}</div>
          ) : (
            <span className="w-auto min-h-4 max-h-6 mr-1 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium">
              {useProfile.label.charAt(0)}
            </span>
          )}
          <span>{useProfile.label}</span>
        </button>
      </div>
    );

  const renderMobileMenu = () => (
    <div
      ref={menuRef}
      className={`px-4 lg:hidden fixed left-0 right-0 top-16 bg-white dark:bg-neutral-800 z-50 transition-all duration-300 overflow-y-auto ${
        isMenuOpen ? "max-h-screen opacity-100 shadow-2xl border-b-[1px] border-neutral-400 dark:border-neutral-700" : "max-h-0 opacity-0 overflow-hidden"
      }`}
      style={{ maxHeight: isMenuOpen ? "calc(100vh - 4rem)" : "0" }}
    >
      <div className="p-4 flex flex-col space-y-4">
        {renderLinks()}
        {renderProfile()}
        {renderCTAButtons()}
      </div>
    </div>
  );

  return (
    <nav className={navbarClasses}>
      <div className="flex items-center">{renderLogo()}</div>
      <div className="hidden lg:flex items-center justify-end flex-grow">
        {renderLinks()}
        {renderProfile()}
        {renderCTAButtons()}
      </div>
      {useMenu && (
        <>
          <button
            onClick={handleMenuClick}
            className={`lg:hidden p-2 rounded-md text-black dark:text-white focus:outline-none ${isMenuOpen ? "hidden" : ""}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <button
            onClick={() => setIsMenuOpen(false)}
            className={`lg:hidden p-2 rounded-md text-black dark:text-white focus:outline-none ${isMenuOpen ? "" : "hidden"}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
      {renderMobileMenu()}
    </nav>
  );
};

CRNavbar.propTypes = {
  orientation: PropTypes.oneOf(["top", "left"]),
  logo: PropTypes.shape({
    img: PropTypes.string,
    label: PropTypes.string,
    size: PropTypes.string,
    path: PropTypes.string,
  }),
  useRouter: PropTypes.bool,
  isSticky: PropTypes.bool,
  useMenu: PropTypes.bool,
  ctaButtons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
      className: PropTypes.string,
    })
  ),
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.node,
      needAuthenticate: PropTypes.bool,
      className: PropTypes.string,
      dropdown: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
          icon: PropTypes.node,
          className: PropTypes.string,
        })
      ),
    })
  ),
  auth: PropTypes.bool,
  useProfile: PropTypes.shape({
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    direction: PropTypes.oneOf(["left", "right"]),
    className: PropTypes.string,
  }),
};

export default CRNavbar;
