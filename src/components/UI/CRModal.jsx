import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";

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
  zIndex = 5000,
  fullScreen = false,
  className,
  children,
}) => {
  const handleClose = useCallback(() => {
    if (closable) {
      setIsOpen(false);
      if (onClose) {
        onClose();
      }
    }
  }, [closable, setIsOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (onOpen) {
        onOpen();
      }
      document.body.style.overflow = "hidden";

      // Añadimos un estado al historial actual para indicar que hay un modal abierto
      // Esto NO crea una nueva entrada en el historial
      const currentState = window.history.state || {};
      window.history.replaceState({ ...currentState, modalOpen: true }, "");
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onOpen]);

  useEffect(() => {
    const handlePopState = () => {
      // Si el modal está abierto y se presiona atrás, cerramos el modal
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
    height: fullScreen ? "100dvh" : height === "auto" ? "auto" : `${height}%`,
    maxWidth: fullScreen ? "100vw" : "95vw",
    maxHeight: fullScreen ? "100dvh" : "90vh",
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center`}
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
