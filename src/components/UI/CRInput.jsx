import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const CRInput = ({
  title,
  className,
  type,
  placeholder,
  maxLength,
  disabled,
  setValue,
  value,
  defaultValue,
  reset,
  autoComplete,
  error,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(defaultValue || value || "");
  const [charCount, setCharCount] = useState(String(defaultValue || value || "").length);
  const [counterClass, setCounterClass] = useState("");
  const prevReset = useRef(reset);

  useEffect(() => {
    if (prevReset.current !== reset && reset !== undefined) {
      const valToSet = defaultValue || "";
      setInputValue(valToSet);
      if (setValue) setValue(valToSet);
      setCharCount(String(valToSet).length);
      prevReset.current = reset;
    }
  }, [reset, defaultValue, setValue]);

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
      setCharCount(String(value).length);
    }
  }, [value]);

  useEffect(() => {
    if (maxLength && charCount === maxLength) {
      setCounterClass("text-yellow-600 dark:text-yellow-500 scale-125");
      setTimeout(() => {
        setCounterClass("text-yellow-600 dark:text-yellow-500 scale-100");
      }, 200);
    } else {
      setCounterClass("");
    }
  }, [charCount, maxLength]);

  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "number" && maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    setInputValue(newValue);
    if (setValue) setValue(newValue);
    setCharCount(newValue.length);
  };

  const baseStyle =
    "bg-white dark:bg-neutral-800/50 text-black dark:text-white block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const errorStyle = "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-500 dark:text-red-400";
  const disabledStyle = "opacity-50 dark:opacity-30 cursor-not-allowed";
  const inputPaddingRight = maxLength && maxLength > 0 ? (maxLength > 99 ? "pr-14" : "pr-11") : "pr-3";

  return (
    <div className={`py-2 ${error ? "text-red-500 dark:text-red-400" : ""}`}>
      {title && (
        <label
          htmlFor={props.id || "CRInput"}
          className={`text-black dark:text-white block text-sm font-medium mb-2 ${
            error ? "text-red-500 dark:text-red-400" : disabled ? "text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {title}
        </label>
      )}
      <div className="relative">
        <input
          id={props.id || "CRInput"}
          type={type === "number" || type === "numeric" ? "number" : type}
          inputMode={type === "number" || type === "numeric" ? "numeric" : type === "tel" ? "tel" : "text"}
          placeholder={placeholder}
          maxLength={type !== "number" ? maxLength : undefined}
          disabled={disabled}
          value={inputValue}
          onChange={handleChange}
          className={`${baseStyle} ${disabled ? disabledStyle : ""} ${error ? errorStyle : ""} ${className || ""} ${inputPaddingRight}`}
          {...props}
          autoComplete={autoComplete ? "on" : "off"}
        />

        {maxLength && maxLength > 0 && type !== "number" && (
          <div
            className={`absolute right-2 bottom-[11px] text-xs transition-transform duration-200 text-black dark:text-white ${counterClass} ${
              disabled ? "text-gray-400 dark:text-gray-500" : ""
            }`}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 my-1">{error}</p>}
    </div>
  );
};

CRInput.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(["text", "number", "email", "tel", "password", "numeric"]),
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reset: PropTypes.any,
  autoComplete: PropTypes.bool,
  error: PropTypes.string,
  id: PropTypes.string,
};

export default CRInput;
