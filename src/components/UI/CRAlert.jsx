import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import PropTypes from "prop-types";

const ALERT_WIDTH = 300;
const ALERT_HEIGHT = 90;
const ALERT_MARGIN = 15;
const ALERT_SPACING = 80;
const Z_INDEX = 500000;

const getIcon = (type) => {
  switch (type) {
    case "info":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
        </svg>
      );
    case "warning":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
        </svg>
      );
    case "success":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
        </svg>
      );
    case "error":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z" />
        </svg>
      );
    default:
      return null;
  }
};

const CRAlert = (() => {
  let alertsContainer = null;
  let alertsRoot = null;
  let alerts = [];

  const createAlertsContainer = () => {
    if (!alertsContainer) {
      alertsContainer = document.createElement("div");
      alertsContainer.style.position = "fixed";
      alertsContainer.style.zIndex = Z_INDEX.toString();
      alertsContainer.style.width = "100%";
      alertsContainer.style.height = "100%";
      alertsContainer.style.pointerEvents = "none";
      document.body.appendChild(alertsContainer);
      alertsRoot = createRoot(alertsContainer);
    }
  };

  const AlertComponent = ({ id, title, message, type, duration, onClose, persistent, position, fade, index, progressBar }) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    const handleClose = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose(id);
      }, fade);
    }, [id, onClose, fade]);

    useEffect(() => {
      setTimeout(() => setIsVisible(true), 10);
      if (!persistent) {
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev <= 0) {
              clearInterval(timer);
              handleClose();
              return 0;
            }
            return prev - (100 * 100) / duration;
          });
        }, 100);

        return () => clearInterval(timer);
      }
    }, [duration, handleClose, persistent]);

    const typeClasses = {
      info: "bg-blue-600/95 dark:bg-blue-700/95 drop-shadow-md",
      warning: "bg-yellow-600/95 dark:bg-yellow-700/95 drop-shadow-md",
      success: "bg-green-600/95 dark:bg-green-700/95 drop-shadow-md",
      error: "bg-red-600/95 dark:bg-red-700/95 drop-shadow-md",
    };

    const getPositionStyles = () => {
      const baseStyles = { position: "fixed", width: `${ALERT_WIDTH}px` };
      const verticalPosition = position.includes("top") ? "top" : "bottom";
      const offset = `${index * (ALERT_MARGIN + ALERT_SPACING) + ALERT_MARGIN}px`;

      if (position.includes("left")) {
        return { ...baseStyles, [verticalPosition]: offset, left: `${ALERT_MARGIN}px` };
      } else if (position.includes("right")) {
        return { ...baseStyles, [verticalPosition]: offset, right: `${ALERT_MARGIN}px` };
      } else {
        return { ...baseStyles, [verticalPosition]: offset, left: "50%", transform: "translateX(-50%)" };
      }
    };

    return (
      <div
        className={`rounded shadow-lg text-white ${typeClasses[type]} transition-opacity duration-${fade} pointer-events-auto`}
        style={{
          ...getPositionStyles(),
          height: `${ALERT_HEIGHT}px`,
          display: "flex",
          flexDirection: "column",
          opacity: isVisible ? 1 : 0,
        }}
        onClick={!persistent ? handleClose : undefined}
      >
        <div className={`flex flex-col flex-grow`}>
          <div className="pt-3 px-3 flex flex-col">
            <div className="flex justify-between pt-[2px]">
              <div className="flex flex-row items-center">
                <div className="flex mr-1">{getIcon(type)}</div>
                <div className="font-bold text-[0.90rem] text-nowrap">{title.length > 30 ? `${message.slice(0, 30)}...` : title}</div>
              </div>
              <button onClick={handleClose} className="text-white hover:text-gray-200 text-sm cursor-pointer">
                ✕
              </button>
            </div>
            <div className="h-[1px] bg-white opacity-50 mt-1 p-0"></div>
          </div>
          <div className="flex flex-grow flex-col justify-center px-3">
            <div className="text-sm text-left">{message.length > 70 ? `${message.slice(0, 70)}...` : message}</div>
          </div>

          {progressBar ? (
            <div className="w-full bg-white bg-opacity-30 h-[3px] bottom-0">
              <div className="h-full bg-white" style={{ width: `${progress}%`, transition: "width 100ms linear" }}></div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  AlertComponent.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["info", "warning", "success", "error"]).isRequired,
    duration: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    persistent: PropTypes.bool.isRequired,
    position: PropTypes.oneOf(["top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right"]).isRequired,
    fade: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    progressBar: PropTypes.bool.isRequired,
  };

  const alert = ({
    title = "Información",
    message = "",
    type = "info",
    duration = 3000,
    persistent = false,
    position = "top-right",
    fade = 300,
    progressBar = true,
  }) => {
    createAlertsContainer();

    const id = Date.now();
    const removeAlert = (alertId) => {
      alerts = alerts.filter((alert) => alert.id !== alertId);
      renderAlerts();
    };

    const existingAlertsCount = alerts.filter((a) => a.position === position).length;
    alerts.push({ id, title, message, type, duration, persistent, position, fade, onClose: removeAlert, index: existingAlertsCount, progressBar });
    renderAlerts();
  };

  const renderAlerts = () => {
    alertsRoot.render(
      <React.StrictMode>
        {alerts.map((props) => (
          <AlertComponent key={props.id} {...props} />
        ))}
      </React.StrictMode>
    );
  };

  return { alert };
})();

CRAlert.alert.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["info", "warning", "success", "error"]),
  duration: PropTypes.number,
  persistent: PropTypes.bool,
  position: PropTypes.oneOf(["top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right"]),
  fade: PropTypes.number,
  progressBar: PropTypes.bool,
};

export default CRAlert;
