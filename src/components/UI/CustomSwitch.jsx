import React from "react";
import PropTypes from "prop-types";

const CustomSwitch = ({
  checked,
  onChange,
  disabled = false,
  id,
  label,
  colorOn = "bg-green-500",
  colorOff = "bg-red-500",
  className,
  size = "normal",
}) => {
  const handleToggle = (event) => {
    event.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const internalId = id || `custom-switch-${React.useId()}`;

  const switchWidth = size === "small" ? "w-8" : "w-10";
  const switchHeight = size === "small" ? "h-4" : "h-6";
  const dotSize = size === "small" ? "w-3 h-3" : "w-4 h-4";
  const dotTranslate = size === "small" ? "translate-x-4" : "translate-x-full";
  const dotPosition = size === "small" ? "left-0.5 top-0.5" : "left-1 top-1";

  return (
    <label htmlFor={internalId} className={`flex items-center cursor-pointer select-none ${className || ""}`}>
      {label && <span className={`mr-2 text-sm text-textPrimary dark:text-slate-300 ${disabled ? "opacity-50" : ""}`}>{label}</span>}
      <div className="relative" onClick={handleToggle}>
        <input type="checkbox" id={internalId} className="sr-only" checked={checked} onChange={() => {}} disabled={disabled} />
        <div
          className={`block ${switchWidth} ${switchHeight} rounded-full transition-colors duration-200 ease-in-out ${checked ? colorOn : colorOff} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        ></div>
        <div
          className={`dot absolute ${dotPosition} bg-white dark:bg-gray-200 ${dotSize} rounded-full shadow-md transition-transform duration-200 ease-in-out ${
            checked ? `transform ${dotTranslate}` : ""
          } ${disabled ? "opacity-50" : ""}`}
        ></div>
      </div>
    </label>
  );
};

CustomSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.string,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(["normal", "small"]),
};

export default CustomSwitch;
