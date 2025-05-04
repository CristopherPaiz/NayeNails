import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * El componente CRSelect renderiza un menú desplegable personalizable con soporte para selección única o múltiple,
 * búsqueda, opciones para limpiar la selección, y manejo de varios estados como cargando, errores y estado deshabilitado.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {string} [props.title] - El título o etiqueta para el componente select. Si existe colocará un label antes del select.
 * @param {boolean} [props.disable=false] - Indica si el select está deshabilitado.
 * @param {boolean} [props.chevron=true] - Indica si se muestra un ícono de flecha en el select.
 * @param {boolean} [props.loading=false] - Indica si el select está en estado de carga.
 * @param {string} [props.loadingText="Cargando..."] - El texto a mostrar cuando el select está en estado de carga.
 * @param {string} [props.disableText] - El texto a mostrar cuando el select está deshabilitado.
 * @param {boolean} [props.insensitive=false] - Indica si la búsqueda es insensible a tildes Por defecto es `false`.
 * @param {boolean} [props.multi=false] - Indica si se permite la selección múltiple. Si es `true` el select mostrará los elementos seleccionados en un contenedor.
 * @param {boolean} [props.clearable=true] - Indica si se muestra un ícono para limpiar la selección. Por defecto es `true`.
 * @param {boolean} [props.separator=false] - Indica si se muestra una línea separadora entre las opciones del select. Por defecto es `false`.
 * @param {string} [props.color="#3b82f6"] - El color de fondo de los elementos seleccionados en modo múltiple y en single. El color se debe pasar en formato hexadecimal. Por defecto es `#3b82f6`.
 * @param {number} [props.height=200] - La altura máxima del menú desplegable. Por defecto es `200`.
 * @param {string} [props.placeholder="Seleccione..."] - El texto a mostrar cuando no hay elementos seleccionados.
 * @param {string} [props.labelField="label"] - El nombre del campo que contiene el texto a mostrar en las opciones del select.
 * @param {string} [props.valueField="value"] - El nombre del campo que contiene el valor de la opción seleccionada.
 * @param {string} [props.icon] - El nombre del campo que contiene la URL de la imagen a mostrar en las opciones del select.
 * @param {array} [props.data=[]] - Un arreglo de objetos con las opciones a mostrar en el select.
 * @param {boolean} [props.searchable=false] - Indica si se muestra un campo de búsqueda en el menú desplegable. Por defecto es `false`.
 * @param {function} [props.setValue] - La función que se ejecuta al seleccionar una opción. Recibe como argumento el valor o valores seleccionados.
 * @param {boolean} [props.reset] - Indica si se debe limpiar la selección del select. No es necesario pasar un valor, solo con cambiar el estado se ejecutará la acción. En pocas palabras, si es true o false, pero si cambiar el valor anterior se reinicia.
 * @param {array[]} [props.defaultValue] - El valor o valores por defecto a seleccionar en el select. Puede ser un objeto o un arreglo de objetos.
 * @param {"auto"|"top"|"bottom"} [props.direction="auto"] - La dirección en la que se despliega el menú. Puede ser `auto`, `top` o `bottom`. Por defecto es `auto`.
 * @param {string} [props.searchField] - El nombre del campo por el cual se realizar la búsqueda en el menú desplegable. Por defecto es `labelField`.
 * @param {boolean} [props.autoClose=true] - Indica si el menú desplegable se cierra automáticamente al seleccionar una opción. Por defecto es `true`.
 * @param {string} [props.error] - El mensaje de error a mostrar debajo del select.
 * @param {boolean} [props.keyValue=true] - Indica si el arreglo de opciones es un objeto con llave y valor y no contienen labels para identificar los valores Por defecto es `true`.
 * @param {boolean} [props.onlySelectValues=false] - Indica si solo se deben retornar los valores de las opciones seleccionadas. Por defecto es `false`.
 * @returns {JSX.Element} - El componente select.
 *
 * @example
 * //Ejemplo básico
 * const countries = [{ label: "Colombia", value: "CO" }, { label: "Perú", value: "PE" }];
 * <CRSelect title="País" data={countries} setValue={setCountry} />
 *
 * //Especificar label y value por otro diferente
 * const countries = [{ countryName: "Colombia", countryCode: "CO" }, { countryName: "Perú", countryCode: "PE" }];
 * <CRSelect title="País" data={countries} labelField="countryName" valueField="countryCode" setValue={setCountry} />
 *
 * //Ejemplo de objeto y defaultValue
 * const countries = [{ name: "Colombia", code: "CO" }, { name: "Perú", code: "PE" }];
 * const defaultCountry = [{ name: "Colombia", code: "CO" }];
 * <CRSelect title="País" data={countries} labelField="name" valueField="code" setValue={setCountry} defaultValue={defaultCountry} />
 *
 * //Buscar por otro campo
 * <CRSelect title="País" data={countries} labelField="name" valueField="code" searchField="name" setValue={setCountry} />
 *
 */

const CRSelect = ({
  title,
  disable = false,
  chevron = true,
  loading = false,
  loadingText = "Cargando...",
  disableText,
  insensitive = false,
  multi = false,
  clearable = true,
  separator = false,
  color = "#3b82f6",
  height = 200,
  placeholder = "Seleccione...",
  labelField = "label",
  valueField = "value",
  icon,
  data = [],
  searchable = false,
  setValue,
  reset,
  defaultValue,
  direction = "auto",
  searchField,
  autoClose = true,
  error = "",
  onlySelectValues = false,
  keyValue = false,
  require = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const [defaultApplied, setDefaultApplied] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  useEffect(() => {
    if (dataLoaded && defaultValue && !timeoutExpired && !defaultApplied) {
      const defaultItems = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      const matchedItems = defaultItems.map((item) => data.find((dataItem) => dataItem[valueField] === item[valueField])).filter(Boolean);

      if (matchedItems.length > 0) {
        setSelectedItems(matchedItems);
        setValue && setValue(onlySelectValues ? matchedItems.map((item) => item[valueField]) : matchedItems);
        setDefaultApplied(true);
      }
    }
  }, [dataLoaded, defaultValue, timeoutExpired, defaultApplied, data, valueField, setValue, onlySelectValues]);

  useEffect(() => {
    if (data.length > 0) {
      let formattedData = data;

      if (keyValue) {
        // Si keyValue es true, transforma el objeto a la estructura esperada
        formattedData = Object.entries(data[0]).map(([label, value]) => ({
          [labelField]: label + " (" + value + ")",
          [valueField]: value,
        }));
      }

      setFilteredData(formattedData);
      setDataLoaded(true);
    }
  }, [data, keyValue, labelField, valueField]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutExpired(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedItems([]);
    setSearchTerm("");
    if (reset && setValue) setValue(multi ? [] : null);
  }, [reset, setValue, multi]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSelect = () => {
    if (!disable && !loading && (dataLoaded || timeoutExpired)) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    let updatedItems;
    if (multi) {
      updatedItems = selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField])
        ? selectedItems.filter((selectedItem) => selectedItem[valueField] !== item[valueField])
        : [...selectedItems, item];
    } else {
      updatedItems = [item];
      if (autoClose) {
        setIsOpen(false);
      }
    }
    setSelectedItems(updatedItems);
    setValue && setValue(onlySelectValues ? updatedItems.map((item) => item[valueField]) : updatedItems);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = data.filter((item) => {
      const itemValue = item[labelField || searchField].toLowerCase();
      const searchValue = term.toLowerCase();

      if (insensitive) {
        const normalizedItemValue = itemValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedSearchValue = searchValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedItemValue.includes(normalizedSearchValue);
      } else {
        return itemValue.includes(searchValue);
      }
    });
    setFilteredData(filtered);
  };

  const removeItem = (item) => {
    const updatedItems = selectedItems.filter((selectedItem) => selectedItem[valueField] !== item[valueField]);
    setSelectedItems(updatedItems);
    setValue && setValue(onlySelectValues ? updatedItems.map((item) => item[valueField]) : updatedItems);
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setValue && setValue(multi ? [] : null);
    setDefaultApplied(false);
  };

  const renderValue = () => {
    if (loading || (!dataLoaded && !timeoutExpired)) return loadingText;
    if (disable && disableText) return disableText;
    if (selectedItems.length === 0) return <span className={`${error ? "text-red-500" : "text-gray-400"}`}>{placeholder}</span>;
    if (multi) {
      return selectedItems.map((item, index) => (
        <div
          key={item[valueField + index]}
          className="inline-flex items-center rounded-full px-2 py-1 text-sm mr-1 mb-1"
          style={{ backgroundColor: color, color: "white" }}
        >
          {item[icon] && <img src={item[icon]} alt="" className="w-4 h-4 mr-1 rounded-full" />}
          {item[labelField]}
          <svg
            onClick={(e) => {
              e.stopPropagation();
              removeItem(item);
            }}
            className="ml-1 h-4 w-4 cursor-pointer hover:text-red-500 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ));
    }
    return selectedItems[0][labelField];
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      {title && (
        <label className={`block my-2 ${error ? "text-red-500" : "text-gray-700 dark:text-white"}`}>
          {title}
          {require && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div
        className={`relative w-full border rounded-md ${error ? "border-red-500" : "border-gray-300 dark:border-gray-500"} ${
          disable || loading ? "bg-gray-100 cursor-not-allowed opacity-70 saturate-50" : "cursor-pointer"
        }`}
        onClick={toggleSelect}
      >
        <div className="flex items-center p-2 min-h-[38px]">
          <div className="flex-grow overflow-hidden text-black dark:text-white">{renderValue()}</div>
          <div className="flex-shrink-0 ml-2 flex items-center">
            {clearable && selectedItems.length > 0 && (
              <svg
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="h-5 w-5 text-gray-400 cursor-pointer mr-2 hover:text-red-500 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {chevron && !loading && (
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {loading && (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </div>
        </div>
        {isOpen && (
          <div
            className={`absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-gray-300 rounded-md shadow-lg ${
              direction === "top" ? "bottom-full mb-1" : "top-full"
            }`}
            style={{
              maxHeight: `${height}px`,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: `${document.documentElement.classList.contains("dark") ? "#808080" : "#adadad"} ${
                document.documentElement.classList.contains("dark") ? "rgb(38,38,38)" : "#ffffff"
              }`, // Uno es el color del scrollbar y el otro el fondo del scrollbar por eso se repite el código
            }}
          >
            {searchable && (
              <div className="p-2 pt-3">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 bg-white dark:bg-neutral-700 rounded-md text-black dark:text-white"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {filteredData.length === 0 ? (
              <div className="py-2 text-center text-gray-500">No hay datos</div>
            ) : (
              filteredData.map((item, index) => (
                <React.Fragment key={item[valueField + index]}>
                  <div
                    className={`py-2 pl-4 pr-2 hover:bg-opacity-10`}
                    style={{
                      backgroundColor: selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField]) ? color : "transparent",
                      color: selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField]) ? "white" : "inherit",
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center text-gray-800 dark:text-white">
                      {item[icon] && <img src={item[icon]} alt="" className="w-6 h-6 mr-2 -ml-1 rounded-full" />}
                      {item[labelField]}
                    </div>
                  </div>
                  {separator && index < filteredData.length - 1 && <hr className="border-gray-300 dark:border-gray-600" />}
                </React.Fragment>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

CRSelect.propTypes = {
  title: PropTypes.string,
  disable: PropTypes.bool,
  chevron: PropTypes.bool,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  disableText: PropTypes.string,
  insensitive: PropTypes.bool,
  multi: PropTypes.bool,
  clearable: PropTypes.bool,
  separator: PropTypes.bool,
  color: PropTypes.string,
  height: PropTypes.number,
  placeholder: PropTypes.string,
  labelField: PropTypes.string,
  valueField: PropTypes.string,
  icon: PropTypes.string,
  data: PropTypes.array,
  searchable: PropTypes.bool,
  setValue: PropTypes.func,
  reset: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  direction: PropTypes.oneOf(["auto", "top", "bottom", "right", "left"]),
  searchField: PropTypes.string,
  autoClose: PropTypes.bool,
  error: PropTypes.string,
  onlySelectValues: PropTypes.bool,
  keyValue: PropTypes.bool,
  require: PropTypes.bool,
};

export default CRSelect;
