import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const monthNames = {
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const dayNames = {
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const StyleCalendar = {
  popupTop: {
    top: "-350px",
    left: "-50px",
    transform: "translateX(0)",
  },
  popupBottom: {
    top: "100%",
    left: "-50px",
    transform: "translateX(0)",
  },
  popupRight: {
    top: "-150px",
    right: "160px",
    transform: "translateY(0)",
  },
  popupLeft: {
    top: "-150px",
    left: "-330px",
    transform: "translateY(0)",
  },
};

/**
 * El componente CRDate permite a los usuarios seleccionar una fecha a través de una interfaz de calendario emergente. Compatible con varios SO como Windows, Android y iOS.
 * Trantado de que sea complatible para todos :D.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {"es"|"en"} [props.locale] - El idioma para los nombres de meses y días. Por defecto es "es" (español). pero si se incluye el "en" se utilizará el inglés, las traducciones vienen predefinidas.
 * @param {string} [props.title] - El título que aparece como etiqueta sobre el campo de entrada. Si no se incluye no aparecerá nada.
 * @param {function} props.setValue - Función para establecer el valor de la fecha seleccionada en el componente padre.
 * @param {string} [props.value] - El valor actual de la fecha en formato "YYYY-MM-DD".
 * @param {string} [props.defaultValue] - Valor por defecto de la fecha, si no se proporciona uno.
 * @param {boolean} [props.disabled=false] - Si es verdadero, desactiva el campo de entrada e impide la interacción.
 * @param {boolean} [props.reset] - Propiedad que cuando cambia, reinicia el valor del campo al valor predeterminado. No importa si es true o false, solo importa que cambie.
 * @param {"top"|"bottom"|"right"|"left"} [props.position] - Posición del calendario emergente en relación con el campo de entrada.
 * @param {string} [props.error] - Mensaje de error para mostrar debajo del campo de entrada.
 * @param {string} [props.placeholder] - Texto del marcador de posición para el campo de entrada cuando no se ha seleccionado ninguna fecha.
 * @param {string} [props.classNameInput] - Clases TAILWIND adicionales para el estilo del campo de entrada.
 * @param {string} [props.classNameBox] - Clases TAILWIND adicionales para el estilo del cuadro del calendario emergente.
 *
 * @returns {JSX.Element} El campo de entrada con su funcionalidad asociada.
 *
 * @example
 * <CRDate title="Fecha" setValue={setBirth} value={birth} />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} disabled />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} reset={reset} />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} position="top" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} error="La fecha es inválida" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} placeholder="Selecciona una fecha" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} classNameInput="bg-gray-100" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} classNameBox="bg-gray-100" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} locale="en" />
 * <CRDate title="Fecha" setValue={setBirth} value={birth} defaultValue="1990-01-01" />
 */

const CRDate = ({
  locale = "es",
  title,
  setValue,
  value,
  defaultValue,
  disabled = false,
  reset,
  position = "bottom",
  error = "",
  placeholder,
  classNameInput,
  classNameBox,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [view, setView] = useState("calendar");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const MIN_YEAR = 1900;
  const MAX_YEAR = 2060;

  useEffect(() => {
    if (defaultValue && !value) {
      const date = new Date(`${defaultValue}T00:00:00`);
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
      setValue(formatDateForParent(date));
    } else if (value) {
      const date = new Date(`${value}T00:00:00`);
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [defaultValue, value, setValue]);

  // MANEJO DEL RESET
  const prevReset = useRef(reset);

  useEffect(() => {
    if (prevReset.current !== reset) {
      setSelectedDate(null);
      setValue("");
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
      prevReset.current = reset;
    }
  }, [reset, setValue]);

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePopup = () => {
    if (!disabled) {
      setIsPopupOpen(!isPopupOpen);
    }
  };

  const formatDateForParent = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    setValue(formatDateForParent(newDate));
    setTimeout(() => setIsPopupOpen(false), 0);
  };

  const handleSelectMonth = (month) => {
    setCurrentMonth(month);
    setView("calendar");
  };

  const handleSelectYear = (year) => {
    setCurrentYear(year);
    setView("calendar");
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const emptyDays = Array(firstDay).fill(null);
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayNames[locale].map((day) => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const isSelected =
            selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

          return (
            <div
              key={`day-${day}`}
              className={`h-10 w-10 flex items-center justify-center cursor-pointer rounded-full
                ${isSelected ? "bg-blue-500 text-white" : "hover:bg-blue-200 dark:hover:bg-blue-900"}
                ${isToday ? "border-2 border-blue-500" : ""}`}
              onClick={() => handleSelectDay(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonths = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {monthNames[locale].map((month, index) => (
          <div
            key={month}
            className={`p-2 text-center text-sm cursor-pointer rounded-lg
              ${currentMonth === index ? "bg-blue-500 text-white" : "hover:bg-blue-200 dark:hover:bg-blue-900"}`}
            onClick={() => handleSelectMonth(index)}
          >
            {month}
          </div>
        ))}
      </div>
    );
  };

  const renderYears = () => {
    const years = [];
    for (let i = MIN_YEAR; i <= MAX_YEAR; i++) {
      years.push(i);
    }
    return (
      <div className="flex items-center justify-between">
        <button
          className={`p-2 ${currentYear <= MIN_YEAR + 4 ? "cursor-not-allowed opacity-25" : ""}`}
          onClick={() => {
            if (currentYear > MIN_YEAR) {
              setCurrentYear(currentYear - 10);
            }
          }}
          disabled={currentYear <= MIN_YEAR + 4}
        >
          «
        </button>
        <div className="grid grid-cols-4 gap-2">
          {years.slice(currentYear - MIN_YEAR, currentYear - MIN_YEAR + 16).map((year) => (
            <div
              key={year}
              className={`p-2 text-center cursor-pointer rounded-lg
              ${currentYear === year ? "bg-blue-500 text-white" : "hover:bg-blue-200 dark:hover:bg-blue-900"}`}
              onClick={() => handleSelectYear(year)}
            >
              {year}
            </div>
          ))}
        </div>
        <button
          className={`p-2 ${currentYear >= MAX_YEAR - 15 ? "cursor-not-allowed opacity-25" : ""}`}
          onClick={() => {
            if (currentYear < MAX_YEAR - 9) {
              setCurrentYear(currentYear + 10);
            }
          }}
          disabled={currentYear >= MAX_YEAR - 15}
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      {title && (
        <label
          htmlFor="CRInput"
          className={`text-black dark:text-white block text-sm font-medium mb-2 ${
            error ? "text-red-500 dark:text-red-400" : disabled ? "text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {title}
        </label>
      )}
      <input
        type="text"
        readOnly
        value={selectedDate ? formatDateForDisplay(selectedDate) : ""}
        onClick={togglePopup}
        placeholder={placeholder ? placeholder : locale === "es" ? "Seleccionar fecha" : "Select date"}
        className={`bg-white dark:bg-neutral-800/50 text-black dark:text-white block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
          disabled
            ? "bg-white cursor-not-allowed text-black/50 dark:bg-neutral-800/50 dark:text-white/50 dark:border-gray-300/20  opacity-50"
            : "cursor-pointer"
        } ${error ? "border-red-500 text-red-500 dark:text-red-400" : "text-black"} ${classNameInput}`}
        disabled={disabled}
      />
      {error && <p className="text-base text-red-500 dark:text-red-400 my-1">{error}</p>}

      {isPopupOpen && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            ...StyleCalendar[position === "top" ? "popupTop" : position === "bottom" ? "popupBottom" : position === "right" ? "popupRight" : "popupLeft"],
          }}
          className={`absolute bg-white dark:bg-neutral-700 text-black dark:text-white mt-2 w-80 p-4 border rounded-lg shadow-lg z-10 ${position} ${classNameBox}`}
        >
          <div className="flex justify-between mb-4">
            <button className="p-2 bg-blue-500 w-[150px] font-bold text-white rounded-lg" onClick={() => setView("months")}>
              {monthNames[locale][currentMonth]}
            </button>
            <button className="p-2 bg-blue-500 w-[130px] text-white font-bold rounded-lg" onClick={() => setView("years")}>
              {currentYear}
            </button>
          </div>

          <div>
            {view === "calendar" && renderCalendarDays()}
            {view === "months" && renderMonths()}
            {view === "years" && renderYears()}
          </div>
        </div>
      )}
    </div>
  );
};

CRDate.propTypes = {
  locale: PropTypes.oneOf(["es", "en"]),
  title: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  reset: PropTypes.bool,
  position: PropTypes.oneOf(["top", "bottom", "right", "left"]),
  error: PropTypes.string,
  placeholder: PropTypes.string,
  classNameInput: PropTypes.string,
  classNameBox: PropTypes.string,
};

export default CRDate;
