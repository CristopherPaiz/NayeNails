import React from "react";
import { DynamicIcon } from "../../../utils/DynamicIcon";
import CRButton from "../../../components/UI/CRButton";
import CRSwitch from "../../../components/UI/CRSwitch";

const SubcategoriaItem = ({ subcategoria, onEdit, onToggleActivo }) => {
  const handleSwitchClick = (e) => {
    e.stopPropagation();
    onToggleActivo(subcategoria.id, subcategoria.activo);
  };

  return (
    <div
      className={`rounded-md mb-2 ${
        subcategoria.activo ? "bg-background dark:bg-slate-700" : "bg-gray-200 dark:bg-slate-600 opacity-80"
      } shadow relative`}
    >
      {/* Estructura compacta para móvil y desktop */}
      <div className="p-3 flex items-center">
        {/* Icono de la subcategoría */}
        {subcategoria.icono && (
          <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5">
            <DynamicIcon
              name={subcategoria.icono}
              className={`w-4 h-4 ${subcategoria.activo ? "text-primary" : "text-gray-500 dark:text-slate-400"}`}
            />
          </div>
        )}

        {/* Nombre de la subcategoría con flexibilidad para wrap */}
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

        {/* Controles alineados a la derecha */}
        <div className="flex gap-2 items-center justify-end flex-shrink-0">
          <CRButton
            title="Editar Subcategoría"
            externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subcategoria);
            }}
            className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
            onlyIcon={true}
          />
          <div onClick={handleSwitchClick} className="flex items-center gap-2">
            <span
              className={`text-xs font-medium hidden sm:inline ${
                subcategoria.activo ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {subcategoria.activo ? "Activa" : "Inactiva"}
            </span>
            <CRSwitch
              checked={subcategoria.activo}
              onChange={() => {
                /* Manejado por handleSwitchClick */
              }}
              colorOff="bg-red-500"
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SubcategoriasTable = ({ subcategorias, onEditSubcategoria, onToggleActivoSubcategoria }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm sm:text-base font-semibold mb-3 text-textSecondary dark:text-slate-300 pl-1">Subcategorías:</h4>

      {/* Vista móvil - Lista vertical más compacta */}
      <div className="block md:hidden space-y-3">
        {subcategorias.map((sub) => (
          <SubcategoriaItem key={sub.id} subcategoria={sub} onEdit={onEditSubcategoria} onToggleActivo={onToggleActivoSubcategoria} />
        ))}
      </div>

      {/* Vista desktop - Tabla sin cambios */}
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
                    <span className={`text-xs font-medium ${sub.activo ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {sub.activo ? "Activa" : "Inactiva"}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CRSwitch checked={sub.activo} onChange={() => onToggleActivoSubcategoria(sub.id, sub.activo)} colorOff="bg-red-500" />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 sm:px-4 whitespace-nowrap text-right text-sm font-medium">
                  <CRButton
                    title="Editar Subcategoría"
                    externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSubcategoria(sub);
                    }}
                    className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
                    onlyIcon={true}
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
