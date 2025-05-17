import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * CRInput es un componente de campo de entrada personalizado que soporta diferentes tipos de entradas (texto, número, email, etc.)
 * y ofrece funcionalidades como contador de caracteres, límite de longitud, y la capacidad de restablecer el valor.
 *
 * @param {Object} props - Las propiedades del componente si hay más\n Depende de lo que se quiera extender.
 * @param {string} [props.title] - El título que aparece como etiqueta sobre el campo de entrada. Si no se incluye no aparecerá nada.
 * @param {string} [props.className] - Clases TAILWIND adicionales para personalizar de forma limitada el estilo del campo.
 * @param {"text" | "number" | "email" | "tel" | "password"} [props.type] - El tipo de campo de entrada (texto, número, email, etc.).
 * @param {string} [props.placeholder] - Texto que aparece cuando el campo está vacío.
 * @param {number} [props.maxLength] - La cantidad máxima de caracteres permitidos en el campo. Si está presente, se mostrará un contador de caracteres que tendrá una animación cuando llegue al límite.
 * @param {boolean} [props.disabled] - Si el campo está deshabilitado.
 * @param {function} props.setValue - Función que actualiza el valor del campo.
 * @param {string | number} [props.value] - El valor actual del campo.
 * @param {string | number} [props.defaultValue] - El valor inicial del campo.
 * @param {boolean} [props.reset] - Propiedad que cuando cambia, reinicia el valor del campo al valor predeterminado. No importa si es true o false, solo importa que cambie.
 * @param {boolean} [props.autoComplete] - Si el autocompletado está habilitado o no.
 * @param {string} [props.error] - Mensaje de error a mostrar debajo del campo.
 *
 * @returns {JSX.Element} El campo de entrada con su funcionalidad asociada.
 *
 * @example
 * <CRInput title="Nombre" type="text" placeholder="Escribe tu nombre" maxLength={50} setValue={setName} value={name} />
 *
 * <CRInput title="Edad" type="number" placeholder="Ingresa tu edad" setValue={setAge} value={age} />
 *
 * <CRInput title="Correo" type="email" placeholder="Ingresa tu correo" setValue={setEmail} value={email} />
 *
 * <CRInput title="Teléfono" type="tel" placeholder="Ingresa tu teléfono" setValue={setPhone} value={phone} />
 *
 * <CRInput title="Contraseña" type="password" placeholder="Ingresa tu contraseña" setValue={setPassword} value={password} />
 *
 * <CRInput title="Mensaje" type="text" placeholder="Escribe tu mensaje" maxLength={200} setValue={setMessage} value={message} />
 */

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
  const [charCount, setCharCount] = useState(0);
  const [counterClass, setCounterClass] = useState("");

  useEffect(() => {
    if (reset !== undefined) {
      setInputValue(defaultValue || "");
      setValue(defaultValue || "");
      setCharCount(0);
    }
  }, [reset, defaultValue, setValue]);

  useEffect(() => {
    if (charCount === maxLength) {
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
    setValue(newValue);
    setCharCount(newValue.length);
  };

  const baseStyle =
    "bg-white dark:bg-neutral-800/50 text-black dark:text-white block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const errorStyle = "border-red-500 focus:ring-red-500 focus:border-red-500 text-red-500 dark:text-red-400";
  const disabledStyle = "opacity-50 dark:opacity-30 cursor-not-allowed";
  const inputPaddingRight = maxLength > 100 ? "pr-14" : "pr-11"; 

  return (
    <div className={`py-2 ${error ? "text-red-500 dark:text-red-400" : ""}`}>
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
      <div className="relative">
        <input
          id="CRInput"
          type={type === "number" || type === "numeric" ? "number" : type} 
          inputMode={type === "number" || type === "numeric" ? "number" : type}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          value={inputValue}
          onChange={handleChange}
          className={`${baseStyle} ${disabled ? disabledStyle : ""} ${error ? errorStyle : ""} ${className} ${inputPaddingRight}`}
          {...props}
          autoComplete={autoComplete ? "on" : "off"}
        />

        {maxLength && (
          <div
            className={`absolute right-2 bottom-[11px] text-xs transition-transform duration-200 text-black dark:text-white ${counterClass} ${
              disabled ? "text-gray-400 dark:text-gray-500" : ""
            }`}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {/* Show error message below the input */}
      {error && <p className="text-xs text-red-500 dark:text-red-400 my-1">{error}</p>}
    </div>
  );
};

CRInput.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(["text", "number", "email", "tel", "password"]),
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  disabled: PropTypes.bool,
  setValue: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reset: PropTypes.any,
  autoComplete: PropTypes.bool,
  error: PropTypes.string,
};

export default CRInput;
