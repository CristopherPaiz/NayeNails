import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const colorClasses = {
  purple: "bg-purple-500 text-white border-purple-700",
  red: "bg-red-500 text-white border-red-700",
  orange: "bg-orange-500 text-white border-orange-700",
  cyan: "bg-cyan-500 text-white border-cyan-700",
  teal: "bg-teal-500 text-white border-teal-700",
  white: "bg-white text-gray-700 border-gray-300",
  black: "bg-black text-white border-gray-700",
  gray: "bg-gray-300 text-gray-700 border-gray-500",
  green: "bg-green-500 text-white border-green-700",
  blue: "bg-blue-500 text-white border-blue-700",
  yellow: "bg-yellow-500 text-white border-yellow-700",
  sky: "bg-sky-500 text-white border-sky-700",
  violet: "bg-violet-500 text-white border-violet-700",
};

const DEFAULT_COLOR = "gray";

/**
 * CRTabs es un componente de pestañas que permite la navegación entre diferentes paneles.
 * Incluye botones de navegación para desplazarse entre las pestañas en dispositivos de escritorio.
 *
 * @component
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - Los selectores de pestañas y los paneles que se renderizarán.
 * @param {boolean} [props.wrap=false] - Si es verdadero, permite que las pestañas se envuelvan en múltiples líneas.
 * @param {number} [props.initialTab=1] - El índice de la pestaña activa inicial por defecto es 1.
 * @param {string} [props.arrowColors='gray'] - El color de los botones de flecha de navegación, por defecto es gray.
 *
 * @example
 * // Uso básico del componente CRTabs
 * <CRTabs>
 *   <CRTabSelector color="red">Tab 1</CRTabSelector>
 *   <CRTabSelector color="blue">Tab 2</CRTabSelector>
 *   <CRTabPanel>Contenido de Tab 1</CRTabPanel>
 *   <CRTabPanel>Contenido de Tab 2</CRTabPanel>
 * </CRTabs>
 *
 * @example
 * // Uso del componente CRTabs con flechas de color personalizado
 * <CRTabs arrowColors="purple">
 *   <CRTabSelector color="green">Tab 1</CRTabSelector>
 *   <CRTabSelector color="orange">Tab 2</CRTabSelector>
 *   <CRTabPanel>Contenido de Tab 1</CRTabPanel>
 *   <CRTabPanel>Contenido de Tab 2</CRTabPanel>
 * </CRTabs>
 *
 * @example
 * // Uso del componente CRTabs con envoltura de pestañas
 * <CRTabs wrap={true} initialTab={2} arrowColors="cyan">
 *   <CRTabSelector color="teal">Tab 1</CRTabSelector>
 *   <CRTabSelector color="violet">Tab 2</CRTabSelector>
 *   <CRTabSelector color="yellow">Tab 3</CRTabSelector>
 *   <CRTabPanel>Contenido de Tab 1</CRTabPanel>
 *   <CRTabPanel>Contenido de Tab 2</CRTabPanel>
 *   <CRTabPanel>Contenido de Tab 3</CRTabPanel>
 * </CRTabs>
 */

const CRTabs = ({ children, wrap = false, initialTab = 1, arrowColors = DEFAULT_COLOR }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabsRef = useRef(null);

  const selectors = children.filter((child) => child.type === CRTabSelector);
  const panels = children.filter((child) => child.type === CRTabPanel);

  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = tabsRef.current.clientWidth / 2;
      tabsRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Botón izquierdo: solo se muestra en Desktop y si hay overflow */}
        <button
          onClick={() => scroll(-1)}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-xl drop-shadow-lg z-10 border-2 hidden ${
            wrap ? "sm:hidden" : "sm:block"
          } ${colorClasses[arrowColors]}`}
        >
          &lt;
        </button>

        <div
          ref={tabsRef}
          className={`flex ${wrap ? "flex-wrap" : "px-2 sm:px-9 overflow-x-auto overflow-y-hidden gap-x-[5px] py-2"}
          ${!wrap && "scrollbar-hide"} sm:block`}
        >
          {React.Children.map(selectors, (selector, index) =>
            React.cloneElement(selector, {
              isActive: activeTab === index + 1,
              onClick: () => setActiveTab(index + 1),
            })
          )}
        </div>

        {/* Botón derecho: solo se muestra en Desktop y si hay overflow */}
        <button
          onClick={() => scroll(1)}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full shadow-xl drop-shadow-lg z-10 border-2 hidden ${
            wrap ? "sm:hidden" : "sm:block"
          } ${colorClasses[arrowColors]}`}
        >
          &gt;
        </button>
      </div>

      <div className="mt-4">
        {React.Children.map(panels, (panel, index) =>
          React.cloneElement(panel, {
            isActive: activeTab === index + 1,
          })
        )}
      </div>

      {/* Estilos inyectados directamente en el componente */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* Para IE y Edge */
          scrollbar-width: none; /* Para Firefox */
        }

        /* Asegura que los botones no se solapen con los selectores */
        .relative {
          position: relative;
        }

        .flex {
          display: flex;
          gap: 3px;
        }

        /* Evita que los botones ocupen espacio en mobile */
        @media (max-width: 640px) {
          .hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * CRTabSelector es un componente que representa un selector de pestaña dentro de CRTabs.
 * Permite la selección de una pestaña activa y puede estar deshabilitado.
 *
 * @component
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - El contenido del selector de pestaña.
 * @param {string} [props.color='gray'] - El color del selector de pestaña.
 * @param {boolean} [props.disabled=false] - Indica si el selector está deshabilitado.
 * @param {boolean} props.isActive - Indica si el selector es la pestaña activa.
 * @param {function} props.onClick - Función que se llama al hacer clic en el selector.
 *
 * @example
 * // Uso básico del componente CRTabSelector
 * <CRTabSelector color="red" onClick={() => console.log('Tab 1 clicked!')}>
 *   Tab 1
 * </CRTabSelector>
 *
 * @example
 * // Uso del componente CRTabSelector deshabilitado
 * <CRTabSelector color="blue" disabled={true}>
 *   Tab 2 (Deshabilitado)
 * </CRTabSelector>
 */

const CRTabSelector = ({ children, color = DEFAULT_COLOR, disabled = false, isActive, onClick }) => {
  const baseClasses = `px-4 py-2 rounded-full font-medium transition-all duration-200 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } border-2`;

  const activeClasses = isActive
    ? `${colorClasses[color]} shadow-md border-2 transform scale-105`
    : `${colorClasses[color]} bg-opacity-[0.75] dark:bg-opacity-[0.65] text-opacity-100 border-2 border-transparent`;

  const disabledClasses = disabled ? "bg-gray-300 text-gray-500" : "";

  return (
    <button className={`${baseClasses} ${activeClasses} ${disabledClasses}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

/**
 * CRTabPanel es un componente que representa el contenido de una pestaña dentro de CRTabs.
 * Puede montarse de forma perezosa (lazy) o activa (eager).
 *
 * @component
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - El contenido que se mostrará en el panel.
 * @param {string} [props.render='lazy'] - Controla el comportamiento de renderizado ('lazy', 'eager', 'idle').
 * @param {boolean} [props.forceUnmount=false] - Si es verdadero, desmonta el panel cuando no está activo.
 * @param {boolean} props.isActive - Indica si el panel es el que se está mostrando actualmente.
 *
 * @example
 * // Uso básico del componente CRTabPanel
 * <CRTabPanel>
 *   Este es el contenido de la pestaña activa.
 * </CRTabPanel>
 *
 * @example
 * // Uso del componente CRTabPanel con renderizado perezoso
 * <CRTabPanel render="lazy">
 *   Este contenido se renderiza de forma perezosa y no se mostrará hasta que la pestaña esté activa.
 * </CRTabPanel>
 *
 * @example
 * // Uso del componente CRTabPanel con desmontaje forzado
 * <CRTabPanel render="lazy" forceUnmount={true}>
 *   Este contenido se desmontará cuando la pestaña no esté activa y forzará a que se vuelva a montar.
 * </CRTabPanel>
 */

const CRTabPanel = ({ children, render = "lazy", forceUnmount = false, isActive }) => {
  const [mounted, setMounted] = useState(render === "idle"); // Estado inicial si es lazy

  useEffect(() => {
    if (isActive && render === "lazy" && !mounted) {
      setMounted(true);
    }
  }, [isActive, render, mounted]);

  // Efecto para el desmontaje solo si se fuerza el desmontaje
  useEffect(() => {
    if (!isActive && forceUnmount) {
      setMounted(false);
    }
  }, [isActive, forceUnmount]);

  if (!mounted && !isActive) {
    return null; // No renderiza si no está activo ni montado
  }

  return <div style={{ display: isActive ? "block" : "none" }}>{children}</div>;
};

CRTabs.propTypes = {
  children: PropTypes.node.isRequired,
  wrap: PropTypes.bool,
  initialTab: PropTypes.number,
  arrowColors: PropTypes.string,
};

CRTabSelector.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

CRTabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  render: PropTypes.oneOf(["lazy", "eager", "idle"]), // lazy es el valor por defecto, eager renderiza siempre, idle no renderiza
  forceUnmount: PropTypes.bool,
  isActive: PropTypes.bool,
};

export { CRTabs, CRTabSelector, CRTabPanel };
