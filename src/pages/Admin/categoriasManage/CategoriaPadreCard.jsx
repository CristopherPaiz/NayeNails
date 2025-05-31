import { DynamicIcon } from "../../../utils/DynamicIcon";
import CRButton from "../../../components/UI/CRButton";
import SubcategoriasTable from "./SubcategoriasTable";
import CRSwitch from "../../../components/UI/CRSwitch.jsx"; // Cambiado de CustomSwitch

const CategoriaPadreCard = ({
  categoria,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleActivo,
  onAddSubcategoria,
  onEditSubcategoria,
  onToggleActivoSubcategoria,
  disabledActions = false,
}) => {
  const cardBgClass = categoria.activo ? "bg-background dark:bg-slate-800" : "bg-gray-100 dark:bg-slate-700 opacity-70";
  const textColorClass = categoria.activo ? "text-textPrimary dark:text-white" : "text-gray-500 dark:text-slate-400";

  const handleSwitchChange = () => {
    if (!disabledActions) {
      onToggleActivo(categoria);
    }
  };

  return (
    <div
      className={`rounded-lg shadow-lg transition-shadow duration-300 overflow-hidden border ${
        categoria.activo ? "border-primary/30 dark:border-slate-700 hover:shadow-primary/20" : "border-gray-300 dark:border-slate-600"
      } ${cardBgClass} relative`}
    >
      <div className="absolute top-0 left-0 bottom-0 flex items-center justify-center w-8 h-full sm:hidden">
        <DynamicIcon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          className={`w-5 h-5 transition-transform duration-200 hidden ${textColorClass} opacity-20`}
        />
      </div>

      <div
        className={`p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-2 sm:gap-3`}
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-2 sm:gap-3 w-full">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {categoria.icono && (
              <span
                className={`p-2.5 rounded-full flex items-center justify-center ${
                  categoria.activo ? "bg-primary/10 dark:bg-primary/20" : "bg-gray-200 dark:bg-slate-600"
                }`}
              >
                <DynamicIcon
                  name={categoria.icono}
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${categoria.activo ? "text-primary" : "text-gray-500 dark:text-slate-400"}`}
                />
              </span>
            )}

            <div className="flex-grow break-words">
              <h2 className={`text-base sm:text-lg font-semibold ${textColorClass}`}>{categoria.nombre}</h2>
              {!categoria.activo && <span className="text-xs font-normal text-yellow-600 dark:text-yellow-400">(Inactiva)</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 sm:hidden">
            <CRButton
              title="Editar Categoría Padre"
              externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabledActions) onEdit();
              }}
              className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
              onlyIcon={true}
              disabled={disabledActions}
            />
            <CRSwitch checked={!!categoria.activo} onChange={handleSwitchChange} colorOff="bg-red-500" disabled={disabledActions} />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 mt-2 sm:mt-0 flex-shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
          <CRButton
            title="Editar Categoría Padre"
            externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabledActions) onEdit();
            }}
            className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5 sm:!p-2"
            onlyIcon={true}
            disabled={disabledActions}
          />
          <CRSwitch checked={!!categoria.activo} onChange={handleSwitchChange} colorOff="bg-red-500" disabled={disabledActions} />
          <DynamicIcon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            className={`w-5 h-5 transition-transform duration-200 hidden sm:flex ${textColorClass} ml-1`}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden border-t border-gray-200 dark:border-slate-700 ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="mb-4 flex justify-center sm:justify-end">
            <CRButton
              title="Añadir Subcategoría"
              externalIcon={<DynamicIcon name="Plus" className="w-4 h-4" />}
              iconPosition="left"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabledActions) onAddSubcategoria();
              }}
              className="bg-secondary text-textPrimary hover:opacity-90 dark:bg-accent dark:text-primary dark:hover:opacity-80 !text-xs w-full sm:w-auto !py-2 !px-4 sm:!py-1.5 sm:!px-3"
              disabled={disabledActions}
            />
          </div>

          {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
            <SubcategoriasTable
              subcategorias={categoria.subcategorias}
              onEditSubcategoria={onEditSubcategoria}
              onToggleActivoSubcategoria={onToggleActivoSubcategoria}
              disabledActions={disabledActions}
            />
          ) : (
            <p className="text-sm text-textSecondary dark:text-slate-400 text-center py-4">No hay subcategorías para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriaPadreCard;
