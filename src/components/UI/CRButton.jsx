import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * CRButton - Componente de botón configurable con soporte para íconos, estados de carga y deshabilitado.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.title] - Texto a mostrar en el botón. Se omite si `onlyIcon` es `true`.
 * @param {boolean} [props.disable=false] - Si está activado, deshabilita el botón y cambia el estilo visual para indicar que no se puede interactuar.
 * @param {"save"|"delete"|"continue"|"close"|"search"|"edit"|"back"|"down"|"up"|"home"|"profile"|"settings"} [props.icon] - Especifica el ícono a mostrar dentro del botón. Se renderiza antes o después del texto dependiendo de `iconPosition`.
 * @param {boolean} [props.onlyIcon=false] - Si está activado, solo muestra el ícono sin texto.
 * @param {"left"|"right"} [props.iconPosition="left"] - Determina la posición del ícono en relación con el texto. Puede ser "left" (izquierda) o "right" (derecha).
 * @param {React} [props.externalIcon] - Ícono personalizado a renderizar. Puede ser un componente React o una función que devuelve un componente.
 * @param {boolean} [props.loading=false] - Si está activado, muestra un ícono de carga y deshabilita el botón. Cambia el texto del botón a `loadingText` si es proporcionado.
 * @param {string} [props.loadingText="Cargando..."] - Texto a mostrar mientras el botón está en estado de carga. Se ignora si `onlyIcon` es `true`.
 * @param {string} [props.disableText] - Texto a mostrar cuando el botón está deshabilitado (`disable=true`). Se omite si no se proporciona.
 * @param {function} [props.onClick] - Función que se ejecuta cuando se hace clic en el botón, siempre que no esté deshabilitado o en estado de carga.
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el botón. Sobrescribe los estilos de color por defecto del botón. Si no se proporciona, el botón tendrá un color de fondo azul (`bg-blue-500`) y texto blanco (`text-white`).
 * @param {"center"|"left"|"right"} [props.position="center"] - Alineación del botón dentro de su contenedor. Puede ser "center" (centrado), "left" (izquierda) o "right" (derecha).
 *
 * @returns {JSX.Element} - Componente de botón renderizado.
 *
 * @example
 * <CRButton title="Guardar" icon="save" onClick={handleSave} />
 * <CRButton title="Eliminar" icon="delete" onClick={handleDelete} />
 * <CRButton title="Buscar" icon="search" onClick={handleSearch} />
 * <CRButton title="Cerrar" icon="close" onClick={handleClose} />
 */

const CRButton = ({
  title,
  disable = false,
  icon,
  onlyIcon = false,
  iconPosition = "left",
  externalIcon,
  loading = false,
  loadingText = "Cargando...",
  disableText,
  onClick,
  className,
  position = "center",
}) => {
  // HOVER MOBILE
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const buttonClasses = `
  flex items-center justify-center px-4 py-3 rounded-md
  transition-all duration-300 ease-in-out my-2 cursor-pointer
  ${disable || loading ? "opacity-50" : isHovered ? "opacity-80" : ""}
  ${className || "bg-blue-500 text-white"}
`;

  const iconClassesLeft = "w-5 h-4 bottom-0 mr-[3px] ml-0 -mb-[2px]";
  const iconClassesRight = "w-5 h-4 bottom-0 ml-[3px] mr-0 -mb-[2px]";

  const iconLoadingLeft = "animate-spin h-5 w-5 mr-3";
  const iconLoadingRight = "animate-spin h-5 w-5 ml-3";

  useEffect(() => {
    if (isHovered && isMobile()) {
      const timeout = setTimeout(() => {
        setIsHovered(false);
      }, 200);
      setHoverTimeout(timeout);
    }
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [isHovered]);

  const renderIcon = () => {
    if (loading) {
      return (
        <svg className={onlyIcon ? "animate-spin h-5 w-5" : iconPosition === "left" ? iconLoadingLeft : iconLoadingRight} viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (externalIcon) {
      const wrapperClasses = iconPosition === "left" ? "mr-1" : "ml-1";
      const iconClasses = "w-5 h-5  -mb-[2px]";

      let iconElement;
      if (typeof externalIcon === "function") {
        iconElement = externalIcon({ className: iconClasses });
      } else if (React.isValidElement(externalIcon)) {
        iconElement = React.cloneElement(externalIcon, {
          className: `${externalIcon.props.className || ""} ${iconClasses}`.trim(),
        });
      } else {
        console.warn("Invalid externalIcon prop");
        return null;
      }

      return <div className={wrapperClasses}>{iconElement}</div>;
    }

    //CASO ICONO NORMAL
    switch (icon) {
      case "save":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        );
      case "delete":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        );
      case "continue":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        );
      case "close":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        );
      case "search":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        );
      case "edit":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        );
      case "back":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        );
      case "down":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        );
      case "up":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        );
      case "home":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case "profile":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case "settings":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={iconPosition === "left" ? iconClassesLeft : iconClassesRight}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const content = (
    <>
      {!onlyIcon && iconPosition === "left" && renderIcon()}
      {!onlyIcon && (loading ? loadingText || "Cargando..." : (disable && disableText) || title)}
      {(onlyIcon || iconPosition === "right") && renderIcon()}
    </>
  );

  const center = "w-full flex justify-center items-center";
  const left = "w-full flex justify-start items-center";
  const right = "w-full flex justify-end items-center";

  return (
    <div className={position === "center" ? center : position === "left" ? left : right}>
      <button
        className={buttonClasses}
        onClick={onClick}
        disabled={disable || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isMobile()) {
            setIsHovered(false);
          }
        }}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          if (isMobile()) {
            setIsHovered(false);
          }
        }}
      >
        {content}
      </button>
    </div>
  );
};

CRButton.propTypes = {
  title: PropTypes.string,
  disable: PropTypes.bool,
  icon: PropTypes.oneOf(["save", "delete", "continue", "close", "search", "edit", "back", "down", "up", "home", "profile", "settings"]),
  onlyIcon: PropTypes.bool,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  externalIcon: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  disableText: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  position: PropTypes.oneOf(["center", "left", "right"]),
};

export default CRButton;
