import React from "react";
import PropTypes from "prop-types";

const CRSwitch = ({ checked, onChange, disabled = false, id, label, colorOn = "bg-green-500", colorOff = "bg-red-500", className }) => {
  const handleToggle = (event) => {
    event.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const internalId = id || `switch-${React.useId()}`;

  return (
    <label htmlFor={internalId} className={`flex items-center cursor-pointer select-none ${className || ""}`}>
      {label && <span className="mr-2 text-sm text-textPrimary dark:text-slate-300">{label}</span>}
      <div className="relative" onClick={handleToggle}>
        <input type="checkbox" id={internalId} className="sr-only" checked={checked} onChange={() => {}} disabled={disabled} />
        <div
          className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? colorOn : colorOff} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow-md transition-transform duration-200 ease-in-out ${
            checked ? "transform translate-x-full" : ""
          } ${disabled ? "opacity-50" : ""}`}
        ></div>
      </div>
    </label>
  );
};

CRSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.string,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string,
  className: PropTypes.string,
};

export default CRSwitch;
