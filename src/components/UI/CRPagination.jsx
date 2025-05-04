import { memo, useRef, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * CRPagination - Componente de paginación personalizable con soporte para diferentes estilos y configuraciones.
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} [props.disable=false] - Deshabilita la interacción con el componente
 * @param {('left'|'center'|'right')} [props.align='center'] - Alineación horizontal del componente
 * @param {number} props.current - Número de página actual (requerido)
 * @param {number} [props.total=1] - Número total de páginas
 * @param {boolean} [props.isSinglePage=false] - Muestra solo un botón cuando hay una única página
 * @param {boolean} [props.showArrows=true] - Muestra/oculta las flechas de navegación
 * @param {boolean} [props.showQuickArrow=false] - Muestra/oculta los botones de navegación rápida (primera/última página)
 * @param {boolean} [props.showFirstLast=false] - Muestra/oculta los números de primera y última página
 * @param {number} [props.maxElements=5] - Máximo número de elementos de paginación visibles
 * @param {string} [props.labelArrowLeft='←'] - Símbolo para la flecha izquierda
 * @param {string} [props.labelArrowRight='→'] - Símbolo para la flecha derecha
 * @param {Function} props.setCurrent - Función para actualizar la página actual (requerida)
 * @param {('purple'|'red'|'orange'|'cyan'|'teal'|'white'|'black'|'gray'|'green'|'blue'|'yellow'|'sky'|'violet')} [props.color='gray'] - Color del tema
 *
 * @returns {JSX.Element} Retorna el componente de paginación o null si total <= 1
 *
 * @example
 * // Ejemplo básico
 * function MyComponent() {
 *   const [currentPage, setCurrentPage] = useState(1);
 *   return (
 *     <CRPagination
 *       current={currentPage}
 *       total={10}
 *       setCurrent={setCurrentPage}
 *     />
 *   );
 * }
 *
 * @example
 * // Ejemplo intermedio con configuración personalizada
 * function MyComponent() {
 *   const [currentPage, setCurrentPage] = useState(1);
 *   return (
 *     <CRPagination
 *       current={currentPage}
 *       total={20}
 *       setCurrent={setCurrentPage}
 *       color="blue"
 *       align="left"
 *       showArrows={true}
 *       maxElements={7}
 *       labelArrowLeft="<"
 *       labelArrowRight=">"
 *     />
 *   );
 * }
 *
 * @example
 * // Ejemplo avanzado con todas las características
 * function MyComponent() {
 *   const [currentPage, setCurrentPage] = useState(1);
 *   return (
 *     <CRPagination
 *       current={currentPage}
 *       total={100}
 *       setCurrent={setCurrentPage}
 *       color="purple"
 *       align="center"
 *       showArrows={true}
 *       showQuickArrow={true}
 *       showFirstLast={true}
 *       maxElements={9}
 *       labelArrowLeft="Anterior"
 *       labelArrowRight="Siguiente"
 *       disable={isLoading} // Deshabilita durante la carga
 *     />
 *   );
 * }
 *
 */

const CRPagination = ({
  disable = false,
  align = "center",
  current,
  total = 1,
  isSinglePage = false,
  showArrows = true,
  showQuickArrow = false,
  showFirstLast = false,
  maxElements = 5,
  labelArrowLeft = "←",
  labelArrowRight = "→",
  setCurrent,
  color = "gray",
}) => {
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

  const hoverColorClass = {
    purple: "hover:bg-purple-200",
    red: "hover:bg-red-200",
    orange: "hover:bg-orange-200",
    cyan: "hover:bg-cyan-200",
    teal: "hover:bg-teal-200",
    white: "hover:bg-gray-100",
    black: "hover:bg-gray-800",
    gray: "hover:bg-gray-400",
    green: "hover:bg-green-200",
    blue: "hover:bg-blue-200",
    yellow: "hover:bg-yellow-200",
    sky: "hover:bg-sky-200",
    violet: "hover:bg-violet-200",
  };

  const getMaxElements = () => {
    if (window.innerWidth < 640) return Math.min(maxElements, 4);
    if (window.innerWidth < 768) return Math.min(maxElements, 5);
    return maxElements;
  };

  const [visibleElements, setVisibleElements] = useState(getMaxElements());
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    const handleResize = () => setVisibleElements(getMaxElements());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getButtonWidth = () => {
    const digits = total.toString().length;
    switch (digits) {
      case 1:
        return "w-6";
      case 2:
        return "w-8";
      case 3:
        return "w-10";
      default:
        return "w-12";
    }
  };

  const createPageRange = useCallback(() => {
    const range = [];
    let maxNumbers = visibleElements;
    const half = Math.floor(maxNumbers / 2);

    if (showFirstLast) {
      maxNumbers -= 2;
      let start = Math.max(2, current - half);
      let end = Math.min(total - 1, current + half);

      if (end - start + 1 < maxNumbers) {
        if (start === 2) {
          end = Math.min(total - 1, start + maxNumbers - 1);
        } else if (end === total - 1) {
          start = Math.max(2, end - maxNumbers + 1);
        }
      }

      range.push(1);
      if (start > 2) range.push("...");
      for (let i = start; i <= end; i++) range.push(i);
      if (end < total - 1) range.push("...");
      range.push(total);
    } else {
      let start = Math.max(1, current - half);
      let end = Math.min(total, start + maxNumbers - 1);

      if (end === total) {
        start = Math.max(1, end - maxNumbers + 1);
      } else if (start === 1) {
        end = Math.min(total, start + maxNumbers - 1);
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }

    return range;
  }, [visibleElements, total, current, showFirstLast]);

  const pageRange = createPageRange();

  const handlePageChange = useCallback(
    (page) => {
      if (page !== currentRef.current && !disable) {
        currentRef.current = page;
        setCurrent(page);
      }
    },
    [setCurrent, disable]
  );

  if (total <= 1) return null;
  if (isSinglePage) {
    const activeColorClass = colorClasses[color] || colorClasses.gray;
    return (
      <div className="w-full flex justify-center items-center">
        <div className={`flex items-center justify-center w-full min-w-[100px] max-w-[300px] md:max-w-[400px]`}>
          <div className="flex gap-1">
            <button className={`p-1 ${getButtonWidth()} ${activeColorClass} rounded-md`}>1</button>
          </div>
        </div>
      </div>
    );
  }

  const buttonWidthClass = getButtonWidth();
  const activeColorClass = colorClasses[color] || colorClasses.gray;

  return (
    <div className="w-full flex justify-center items-center">
      <div
        className={`flex items-center ${
          align === "center" ? "justify-center" : align === "left" ? "justify-start" : "justify-end"
        } w-full min-w-[100px] max-w-[300px] md:max-w-[400px]`}
      >
        <div className={`flex gap-1 ${disable ? "opacity-50 pointer-events-none" : ""}`}>
          {showQuickArrow && (
            <button onClick={() => handlePageChange(1)} className={`p-2 ${buttonWidthClass}`} style={{ visibility: current > 1 ? "visible" : "hidden" }}>
              {"<<"}
            </button>
          )}
          {showArrows && (
            <button
              onClick={() => handlePageChange(current - 1)}
              className={`p-1 ${buttonWidthClass}`}
              style={{ visibility: current > 1 ? "visible" : "hidden" }}
            >
              {labelArrowLeft}
            </button>
          )}
          {pageRange.map((item, index) => (
            <button
              key={index}
              onClick={() => typeof item === "number" && handlePageChange(item)}
              className={`p-1 ${buttonWidthClass} ${
                typeof item === "number"
                  ? item === current
                    ? `${activeColorClass} rounded-md`
                    : `text-gray-700 dark:text-gray-400 ${hoverColorClass[color] || hoverColorClass.gray}`
                  : "text-gray-500 cursor-default -px-4 -mr-3 -ml-4 sm:-ml-3"
              }`}
            >
              {item}
            </button>
          ))}
          {showArrows && (
            <button
              onClick={() => handlePageChange(current + 1)}
              className={`p-1 ${buttonWidthClass}`}
              style={{ visibility: current < total ? "visible" : "hidden" }}
            >
              {labelArrowRight}
            </button>
          )}
          {showQuickArrow && (
            <button
              onClick={() => handlePageChange(total)}
              className={`p-1 ${buttonWidthClass}`}
              style={{ visibility: current < total ? "visible" : "hidden" }}
            >
              {">>"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

CRPagination.propTypes = {
  disable: PropTypes.bool,
  align: PropTypes.oneOf(["left", "center", "right"]),
  current: PropTypes.number.isRequired,
  total: PropTypes.number,
  isSinglePage: PropTypes.bool,
  showArrows: PropTypes.bool,
  showQuickArrow: PropTypes.bool,
  showFirstLast: PropTypes.bool,
  maxElements: PropTypes.number,
  labelArrowLeft: PropTypes.string,
  labelArrowRight: PropTypes.string,
  setCurrent: PropTypes.func.isRequired,
  color: PropTypes.oneOf(["purple", "red", "orange", "cyan", "teal", "white", "black", "gray", "green", "blue", "yellow", "sky", "violet"]),
};

export default memo(CRPagination);
