import React from "react";
import CRButton from "../../components/UI/CRButton";
import { DynamicIcon } from "../../utils/DynamicIcon";

const ImageConfigSection = ({ title, configKey, value, onChange, onSave, error, isSubmitting, icon }) => {
  return (
    <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 max-w-full">
      <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-4 flex items-center">
        <DynamicIcon name={icon} className="w-6 h-6 mr-2 text-primary" />
        {title}
      </h2>

      <p className="text-xs text-textSecondary dark:text-slate-400 mb-1">
        Ingresa un array de objetos JSON. Cada objeto debe tener una propiedad "url". Ejemplo:
      </p>

      <pre className="text-xs bg-gray-100 dark:bg-slate-700 p-2 rounded mb-3 w-full overflow-x-auto">
        {`[
  { "url": "https://ejemplo.com/imagen1.jpg", "legend": "Opcional" },
  { "url": "https://ejemplo.com/imagen2.png" }
]`}
      </pre>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className={`w-full p-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 text-sm
                   ${error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-slate-600"}
                   focus:ring-primary focus:border-primary dark:text-white`}
        placeholder="Pega aquí el JSON con las URLs de las imágenes."
      />

      {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}

      <CRButton
        title="Guardar Cambios"
        onClick={() => onSave(configKey)}
        className="mt-4 bg-primary text-white"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );
};

export default ImageConfigSection;
