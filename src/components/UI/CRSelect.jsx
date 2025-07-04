import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";

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
  value,
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
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const [defaultApplied, setDefaultApplied] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  const formattedInitialData = useMemo(() => {
    if (keyValue && data.length > 0 && typeof data[0] === "object" && !Array.isArray(data[0])) {
      return Object.entries(data[0]).map(([label, val]) => ({
        [labelField]: label + " (" + val + ")",
        [valueField]: val,
      }));
    }
    return data;
  }, [data, keyValue, labelField, valueField]);

  useEffect(() => {
    setFilteredData(formattedInitialData);
    if (formattedInitialData.length > 0) {
      setDataLoaded(true);
    }
  }, [formattedInitialData]);

  useEffect(() => {
    if (value !== undefined) {
      const valueAsArray = multi ? value || [] : value ? [value] : [];

      const newSelectedItems = valueAsArray
        .map((vItem) => {
          const targetValue = typeof vItem === "object" && vItem !== null ? vItem[valueField] : vItem;
          return formattedInitialData.find((dItem) => dItem[valueField] === targetValue);
        })
        .filter(Boolean);

      setSelectedItems(newSelectedItems);
    }
  }, [value, formattedInitialData, valueField, multi]);

  useEffect(() => {
    if (dataLoaded && defaultValue && !timeoutExpired && !defaultApplied && !value) {
      const defaultItemsArray = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
      const matchedItems = defaultItemsArray
        .map((item) => formattedInitialData.find((dataItem) => dataItem[valueField] === (typeof item === "object" ? item[valueField] : item)))
        .filter(Boolean);

      if (matchedItems.length > 0) {
        setSelectedItems(matchedItems);
        if (setValue) {
          const valueToSet = multi ? matchedItems : matchedItems[0];
          setValue(onlySelectValues ? (multi ? matchedItems.map((i) => i[valueField]) : matchedItems[0]?.[valueField]) : valueToSet);
        }
        setDefaultApplied(true);
      }
    }
  }, [dataLoaded, defaultValue, timeoutExpired, defaultApplied, formattedInitialData, valueField, setValue, onlySelectValues, multi, value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutExpired(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const prevReset = useRef(reset);
  useEffect(() => {
    if (prevReset.current !== reset && reset !== undefined) {
      setSelectedItems([]);
      setSearchTerm("");
      if (setValue) setValue(multi ? [] : null);
      setDefaultApplied(false);
      prevReset.current = reset;
    }
  }, [reset, setValue, multi]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      if (autoClose) setIsOpen(false);
    }

    if (setValue) {
      const valueToSet = multi ? updatedItems : updatedItems.length > 0 ? updatedItems[0] : null;
      setValue(onlySelectValues ? (multi ? updatedItems.map((i) => i[valueField]) : updatedItems[0]?.[valueField] ?? null) : valueToSet);
    }
    if (value === undefined) {
      setSelectedItems(updatedItems);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const searchKey = searchField || labelField;
    const filtered = formattedInitialData.filter((item) => {
      const itemValue = String(item[searchKey] ?? "").toLowerCase();
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

  const removeItem = (itemToRemove) => {
    const updatedItems = selectedItems.filter((selectedItem) => selectedItem[valueField] !== itemToRemove[valueField]);
    if (setValue) {
      const valueToSet = multi ? updatedItems : updatedItems.length > 0 ? updatedItems[0] : null;
      setValue(onlySelectValues ? (multi ? updatedItems.map((i) => i[valueField]) : updatedItems[0]?.[valueField] ?? null) : valueToSet);
    }
    if (value === undefined) {
      setSelectedItems(updatedItems);
    }
  };

  const clearSelection = () => {
    if (setValue) setValue(multi ? [] : null);
    if (value === undefined) {
      setSelectedItems([]);
    }
    setDefaultApplied(false);
  };

  const renderValue = () => {
    if (loading || (!dataLoaded && !timeoutExpired)) return loadingText;
    if (disable && disableText) return disableText;
    if (selectedItems.length === 0) return <span className={`${error ? "text-red-500" : "text-gray-400"}`}>{placeholder}</span>;
    if (multi) {
      return selectedItems.map((item, index) => (
        <div
          key={item[valueField] + "-" + index}
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
    return selectedItems[0]?.[labelField] || <span className={`${error ? "text-red-500" : "text-gray-400"}`}>{placeholder}</span>;
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
          disable || loading ? "bg-gray-100 cursor-not-allowed opacity-70 saturate-50" : "cursor-pointer bg-white dark:bg-neutral-800"
        }`}
        onClick={toggleSelect}
      >
        <div className="flex items-center p-2 min-h-[38px]">
          <div className="flex-grow overflow-hidden text-black dark:text-white">{renderValue()}</div>
          <div className="flex-shrink-0 ml-2 flex items-center">
            {clearable && selectedItems.length > 0 && !disable && !loading && (
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
              }`,
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
                <React.Fragment key={item[valueField] + "--" + index}>
                  <div
                    className={`py-2 pl-4 pr-2 hover:bg-opacity-10 cursor-pointer`}
                    style={{
                      backgroundColor: selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField]) ? color : "transparent",
                      color: selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField]) ? "white" : "inherit",
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <div
                      className={`flex items-center ${
                        selectedItems.some((selectedItem) => selectedItem[valueField] === item[valueField])
                          ? "text-white"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
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
  reset: PropTypes.any,
  defaultValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number]),
  direction: PropTypes.oneOf(["auto", "top", "bottom", "right", "left"]),
  searchField: PropTypes.string,
  autoClose: PropTypes.bool,
  error: PropTypes.string,
  onlySelectValues: PropTypes.bool,
  keyValue: PropTypes.bool,
  require: PropTypes.bool,
};

export default CRSelect;
