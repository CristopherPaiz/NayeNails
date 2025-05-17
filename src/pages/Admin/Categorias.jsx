import { useState, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import CategoriaPadreCard from "../Admin/categoriasManage/CategoriaPadreCard.jsx";
import CategoriaFormModal from "../Admin/categoriasManage/CategoriaFormModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal";

const initialCategoriasData = [
  {
    id: "cat1",
    nombre: "Servicios",
    icono: "Sparkles",
    activo: true,
    subcategorias: [
      { id: "sub1", idPadre: "cat1", nombre: "Manicura Clásica", icono: "Hand", activo: true },
      { id: "sub2", idPadre: "cat1", nombre: "Uñas Acrílicas", icono: "Layers", activo: true },
      { id: "sub3", idPadre: "cat1", nombre: "Pedicura Spa", icono: "Footprints", activo: true },
      { id: "sub4", idPadre: "cat1", nombre: "Manicura Rusa", icono: "Scissors", activo: true },
    ],
  },
  {
    id: "cat2",
    nombre: "Efectos",
    icono: "Droplet",
    activo: true,
    subcategorias: [
      { id: "sub5", idPadre: "cat2", nombre: "Ojo de Gato", icono: "Eye", activo: true },
      { id: "sub6", idPadre: "cat2", nombre: "Efecto Espejo", icono: "Airplay", activo: true },
      { id: "sub7", idPadre: "cat2", nombre: "Glitter", icono: "Sparkle", activo: true },
      { id: "sub8", idPadre: "cat2", nombre: "Mate", icono: "Droplets", activo: true },
    ],
  },
  {
    id: "cat3",
    nombre: "Colores",
    icono: "Paintbrush",
    activo: true,
    subcategorias: [
      { id: "sub9", idPadre: "cat3", nombre: "Pastel", icono: "Palette", activo: true },
      { id: "sub10", idPadre: "cat3", nombre: "Neón", icono: "Sun", activo: true },
      { id: "sub11", idPadre: "cat3", nombre: "Nude", icono: "Droplet", activo: true },
      { id: "sub12", idPadre: "cat3", nombre: "Metálico", icono: "Gem", activo: true },
    ],
  },
  {
    id: "cat4",
    nombre: "Tipos",
    icono: "Shapes",
    activo: true,
    subcategorias: [
      { id: "sub13", idPadre: "cat4", nombre: "Almendrada", icono: "Circle", activo: true },
      { id: "sub14", idPadre: "cat4", nombre: "Cuadrada", icono: "Square", activo: true },
      { id: "sub15", idPadre: "cat4", nombre: "Stiletto", icono: "Triangle", activo: true },
      { id: "sub16", idPadre: "cat4", nombre: "Ovalada", icono: "Squircle", activo: true },
    ],
  },
];

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("addParent");
  const [currentCategoria, setCurrentCategoria] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", message: "", onConfirm: () => {} });

  const iconOptions = useMemo(
    () =>
      Object.keys(LucideIcons)
        .filter((name) => /^[A-Z]/.test(name) && !["createLucideIcon", "icons", "createElement", "LucideIcon", "LucideProps"].includes(name))
        .map((name) => ({ label: name, value: name })),
    []
  );

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCategorias(initialCategoriasData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleToggleParent = (parentId) => {
    setSelectedParentId((prevId) => (prevId === parentId ? null : parentId));
  };

  const openFormModal = (mode, categoriaData = null, parentIdForNewChild = null) => {
    setModalMode(mode);
    if ((mode === "editParent" || mode === "editChild") && categoriaData) {
      setCurrentCategoria(categoriaData);
    } else if (mode === "addChild" && parentIdForNewChild) {
      setCurrentCategoria({ idPadre: parentIdForNewChild });
    } else {
      setCurrentCategoria(null);
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentCategoria(null);
  };

  const handleFormSubmit = (formData) => {
    setIsLoadingAction(true);
    setTimeout(() => {
      if (modalMode === "addParent") {
        setCategorias((prev) => [...prev, { ...formData, id: `cat${Date.now()}`, subcategorias: [], activo: true }]);
      } else if (modalMode === "editParent") {
        setCategorias((prev) => prev.map((cat) => (cat.id === formData.id ? { ...cat, ...formData } : cat)));
      } else if (modalMode === "addChild") {
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === formData.idPadre
              ? { ...cat, subcategorias: [...cat.subcategorias, { ...formData, id: `sub${Date.now()}`, activo: true, idPadre: cat.id }] } // Asegurar idPadre
              : cat
          )
        );
      } else if (modalMode === "editChild") {
        setCategorias((prev) =>
          prev.map((cat) => {
            if (cat.id === formData.idPadre) {
              return { ...cat, subcategorias: cat.subcategorias.map((sub) => (sub.id === formData.id ? { ...sub, ...formData } : sub)) };
            }
            return cat;
          })
        );
      }
      closeFormModal();
      setIsLoadingAction(false);
    }, 500);
  };

  const prepareToggleActivo = (itemType, itemId, itemIsCurrentlyActive, parentId = null) => {
    const actionText = itemIsCurrentlyActive ? "inactivar" : "activar";
    setConfirmModalProps({
      title: `Confirmar ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `¿Estás seguro de que deseas ${actionText} este elemento?`,
      onConfirm: () => {
        setIsLoadingAction(true);
        setTimeout(() => {
          if (itemType === "parent") {
            setCategorias((prev) => prev.map((cat) => (cat.id === itemId ? { ...cat, activo: !cat.activo } : cat)));
          } else if (itemType === "child" && parentId) {
            setCategorias((prev) =>
              prev.map((cat) => {
                if (cat.id === parentId) {
                  return {
                    ...cat,
                    subcategorias: cat.subcategorias.map((sub) => (sub.id === itemId ? { ...sub, activo: !sub.activo } : sub)),
                  };
                }
                return cat;
              })
            );
          }
          setIsConfirmModalOpen(false);
          setIsLoadingAction(false);
        }, 500);
      },
    });
    setIsConfirmModalOpen(true);
  };

  if (isLoading) {
    return <CRLoader text="Cargando categorías..." fullScreen={false} style="circle" size="lg" />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <DynamicIcon name="AlertTriangle" className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">Error al cargar las categorías: {error}</p>
        <CRButton onClick={() => window.location.reload()} title="Reintentar" className="mt-4 bg-primary text-white" />
      </div>
    );
  }

  return (
    <div className="sm:px">
      {isLoadingAction && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Categorías</h1>
        <div>
          <CRButton
            title="Añadir Categoría Padre"
            externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
            iconPosition="left"
            onClick={() => openFormModal("addParent")}
            className="bg-primary text-white hover:bg-opacity-90 text-sm py-2 px-4"
          />
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="text-center py-10 bg-background dark:bg-slate-800 rounded-lg shadow">
          <DynamicIcon name="PackageOpen" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-xl text-textSecondary dark:text-slate-400">No hay categorías para mostrar.</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Empieza añadiendo una categoría padre.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categorias.map((cat) => (
            <CategoriaPadreCard
              key={cat.id}
              categoria={cat}
              isExpanded={selectedParentId === cat.id}
              onToggleExpand={() => handleToggleParent(cat.id)}
              onEdit={() => openFormModal("editParent", cat)} // Se pasa el objeto 'cat' completo
              onToggleActivo={() => prepareToggleActivo("parent", cat.id, cat.activo)}
              onAddSubcategoria={() => openFormModal("addChild", null, cat.id)}
              onEditSubcategoria={(subcat) => openFormModal("editChild", subcat)} // Se pasa el objeto 'subcat' completo
              onToggleActivoSubcategoria={(subcatId, currentSubActivo) => prepareToggleActivo("child", subcatId, currentSubActivo, cat.id)}
            />
          ))}
        </div>
      )}

      {isFormModalOpen && (
        <CategoriaFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          mode={modalMode}
          // `currentCategoria` puede ser un objeto padre, un objeto hijo, o {idPadre: '...'} para nuevo hijo, o null para nuevo padre
          categoriaToEdit={currentCategoria}
          iconOptions={iconOptions}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isLoadingAction) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        <p>{confirmModalProps.message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={() => {
              if (!isLoadingAction) setIsConfirmModalOpen(false);
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoadingAction}
          />
          <CRButton
            title="Confirmar"
            onClick={confirmModalProps.onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white"
            loading={isLoadingAction}
            disabled={isLoadingAction}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CategoriasPage;
