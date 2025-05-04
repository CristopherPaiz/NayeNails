import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * CRModal - Un componente modal personalizable con varias opciones de configuración.
 *
 * @param {Object} props - El objeto de propiedades.
 * @param {string} [props.title] - El título que se muestra en la parte superior del modal.
 * @param {number|string} [props.width="auto"] - El ancho del modal. Puede ser un numero, porcentaje o "auto".
 * @param {number|string} [props.height="auto"] - La altura del modal. Puede ser un numero, porcentaje o "auto".
 * @param {boolean} [props.closable=true] - Determina si el modal puede ser cerrado por el usuario.
 * @param {boolean} props.isOpen - Indica si el modal está abierto o cerrado.
 * @param {function} props.setIsOpen - Función para actualizar el estado que controla la visibilidad del modal.
 * @param {function} [props.onOpen] - Callback que se ejecuta cuando el modal se abre.
 * @param {function} [props.onClose] - Callback que se ejecuta cuando el modal se cierra.
 * @param {boolean} [props.disableBackdropClick=false] - Desactiva el cierre del modal al hacer clic en el fondo.
 * @param {boolean} [props.disableEscapeKeyDown=false] - Desactiva el cierre del modal con la tecla "Escape".
 * @param {number} [props.zIndex=10] - El z-index del modal para controlar su nivel de apilamiento.
 * @param {boolean} [props.fullScreen=false] - Hace que el modal ocupe toda la pantalla si es true.
 * @param {string} [props.className] - Clases de Tailwind adicionales que sobreescribirán los estilos actuales.
 * @param {React.ReactNode} [props.children] - El contenido que se va a renderizar dentro del modal.
 *
 * @returns {React.ReactElement|null} El elemento del modal o null si no está abierto.
 *
 * @example
 * <CRModal title="Título del modal" isOpen={isOpen} setIsOpen={setIsOpen}>
 *  <p>Contenido del modal</p>
 * </CRModal>
 *
 * <CRModal isOpen={isOpen} setIsOpen={setIsOpen} disableBackdropClick>
 * <p>Contenido del modal</p>
 * </CRModal>
 */

const CRModal = ({
  title,
  width = "auto",
  height = "auto",
  closable = true,
  isOpen,
  setIsOpen,
  onOpen,
  onClose,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  zIndex = 10,
  fullScreen = false,
  className,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      document.body.style.overflow = "hidden";
      // Add empty state to history when modal opens
      window.history.pushState(null, "", window.location.href);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onOpen]);

  const handleClose = useCallback(() => {
    if (closable) {
      setIsOpen(false);
      onClose?.();
    }
  }, [closable, setIsOpen, onClose]);

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      if (isOpen) {
        handleClose();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && !disableEscapeKeyDown) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [handleClose, disableEscapeKeyDown]);

  if (!isOpen) return null;

  const modalStyle = {
    width: fullScreen ? "100vw" : width === "auto" ? "auto" : `${width}%`,
    height: fullScreen ? "100vh" : height === "auto" ? "auto" : `${height}%`,
    maxWidth: fullScreen ? "100vw" : "95vw",
    maxHeight: fullScreen ? "100vh" : "90vh",
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`}
      style={{ zIndex }}
      onClick={!disableBackdropClick ? handleClose : undefined}
    >
      <div
        className={`bg-white p-1 dark:bg-gray-800 rounded-lg shadow-xl text-black dark:text-white flex flex-col ${className || ""}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closable) && !fullScreen && (
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
            {title && <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>}
            {closable && (
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="flex-grow overflow-auto px-4 py-2">{children}</div>
        {fullScreen && closable && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full bg-black/70 p-[5px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

CRModal.propTypes = {
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(["auto"])]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(["auto"])]),
  closable: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  disableBackdropClick: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  zIndex: PropTypes.number,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default CRModal;
