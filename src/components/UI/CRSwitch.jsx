// src/components/UI/CRSwitch.jsx
import React from "react";
import PropTypes from "prop-types";

const CRSwitch = ({
  checked,
  onChange,
  disabled = false,
  id,
  label,
  colorOn = "bg-green-500", // Verde para ON
  colorOff = "bg-red-500", // Rojo para OFF (según solicitud, usualmente sería gris)
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked); // El componente padre decidirá la acción basada en el nuevo estado
    }
  };

  return (
    <label htmlFor={id || `switch-${Math.random().toString(36).substring(7)}`} className="flex items-center cursor-pointer select-none">
      {label && <span className="mr-2 text-sm text-textPrimary dark:text-slate-300">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          id={id || `switch-${Math.random().toString(36).substring(7)}`}
          className="sr-only"
          checked={checked}
          onChange={handleToggle} // onChange ahora se llama aquí
          disabled={disabled}
        />
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
  onChange: PropTypes.func.isRequired, // Se espera que el padre maneje la lógica de confirmación
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.string,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string,
};

export default CRSwitch;
