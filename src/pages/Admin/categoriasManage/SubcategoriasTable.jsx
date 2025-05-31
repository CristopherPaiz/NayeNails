import React from "react";
import { DynamicIcon } from "../../../utils/DynamicIcon";
import CRButton from "../../../components/UI/CRButton";
import CRSwitch from "../../../components/UI/CRSwitch.jsx"; // Cambiado de CustomSwitch

const SubcategoriaItem = ({ subcategoria, onEdit, onToggleActivo, disabledActions = false }) => {
  const handleSwitchChange = () => {
    if (!disabledActions) {
      onToggleActivo(subcategoria);
    }
  };

  return (
    <div
      className={`rounded-md mb-2 ${
        subcategoria.activo ? "bg-background dark:bg-slate-700" : "bg-gray-200 dark:bg-slate-600 opacity-80"
      } shadow relative`}
    >
      <div className="p-3 flex items-center">
        {subcategoria.icono && (
          <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5">
            <DynamicIcon
              name={subcategoria.icono}
              className={`w-4 h-4 ${subcategoria.activo ? "text-primary" : "text-gray-500 dark:text-slate-400"}`}
            />
          </div>
        )}

        <div className="break-words flex-grow pr-2 min-w-0">
          <span
            className={`${
              subcategoria.activo ? "text-textPrimary dark:text-white" : "text-gray-600 dark:text-slate-300"
            } text-sm sm:text-base font-medium`}
          >
            {subcategoria.nombre}
          </span>
          {!subcategoria.activo && <span className="ml-1 text-xs text-red-600 dark:text-red-400">(Inactiva)</span>}
        </div>

        <div className="flex gap-2 items-center justify-end flex-shrink-0">
          <CRButton
            title="Editar Subcategoría"
            externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabledActions) onEdit(subcategoria);
            }}
            className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
            onlyIcon={true}
            disabled={disabledActions}
          />
          <CRSwitch
            checked={!!subcategoria.activo}
            onChange={handleSwitchChange}
            colorOff="bg-red-500"
            className="flex-shrink-0"
            disabled={disabledActions}
          />
        </div>
      </div>
    </div>
  );
};

const SubcategoriasTable = ({ subcategorias, onEditSubcategoria, onToggleActivoSubcategoria, disabledActions = false }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm sm:text-base font-semibold mb-3 text-textSecondary dark:text-slate-300 pl-1">Subcategorías:</h4>

      <div className="block md:hidden space-y-3">
        {subcategorias.map((sub) => (
          <SubcategoriaItem
            key={sub.id}
            subcategoria={sub}
            onEdit={onEditSubcategoria}
            onToggleActivo={onToggleActivoSubcategoria}
            disabledActions={disabledActions}
          />
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 bg-background dark:bg-slate-700 rounded-md shadow">
          <thead className="bg-gray-50 dark:bg-slate-600">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider w-12"
              >
                Icono
              </th>
              <th
                scope="col"
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-center text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider w-32"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider w-24"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
            {subcategorias.map((sub) => (
              <tr key={sub.id} className={`${!sub.activo ? "bg-gray-100 dark:bg-slate-600/50 opacity-70" : ""}`}>
                <td className="px-3 py-2 sm:px-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                  {sub.icono && (
                    <div className="bg-primary/10 dark:bg-primary/20 p-1 rounded-full inline-flex items-center justify-center">
                      <DynamicIcon name={sub.icono} className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 sm:px-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                  {sub.nombre}
                  {!sub.activo && <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Inactiva)</span>}
                </td>
                <td className="px-3 py-2 sm:px-4 whitespace-nowrap text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CRSwitch
                      checked={!!sub.activo}
                      onChange={() => {
                        if (!disabledActions) onToggleActivoSubcategoria(sub);
                      }}
                      colorOff="bg-red-500"
                      disabled={disabledActions}
                    />
                  </div>
                </td>
                <td className="px-3 py-2 sm:px-4 whitespace-nowrap text-right text-sm font-medium">
                  <CRButton
                    title="Editar Subcategoría"
                    externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabledActions) onEditSubcategoria(sub);
                    }}
                    className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
                    onlyIcon={true}
                    disabled={disabledActions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubcategoriasTable;
