import { useState, useMemo, useEffect, useRef } from "react";
import CRButton from "../../components/UI/CRButton";
import CRModal from "../../components/UI/CRModal";
import CRInput from "../../components/UI/CRInput";
import CRLoader from "../../components/UI/CRLoader";
import ConfirmationModal from "../../components/ConfirmationModal";
import Paginador from "../../components/UI/Paginador";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useApiRequest from "../../hooks/useApiRequest";
import { useQueryClient } from "@tanstack/react-query";
import CategorySubcategorySelector from "../../components/admin/CategorySubcategorySelector";
import CRAlert from "../../components/UI/CRAlert.jsx";
import useScrollToTop from "../../hooks/useScrollToTop.jsx";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ITEMS_PER_PAGE_ADMIN = 6;

// NUEVA FUNCIÓN AUXILIAR PARA COMPRIMIR LA IMAGEN
/**
 * Comprime una imagen (Blob) si supera un tamaño objetivo.
 * @param {Blob} blob - El Blob de la imagen a comprimir.
 * @param {number} targetSizeInMB - El tamaño máximo deseado en megabytes.
 * @returns {Promise<Blob>} - Una promesa que se resuelve con el Blob de la imagen comprimida.
 */
const resizeAndCompressImage = (blob, targetSizeInMB = 14.5) => {
  return new Promise((resolve, reject) => {
    const targetSizeInBytes = targetSizeInMB * 1024 * 1024;
    if (blob.size <= targetSizeInBytes) {
      console.log(`La imagen ya está por debajo del umbral (${(blob.size / 1024 / 1024).toFixed(2)}MB). No se necesita compresión.`);
      return resolve(blob);
    }

    console.log(`Iniciando compresión. Tamaño original: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

    const image = new Image();
    const url = URL.createObjectURL(blob);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      let quality = 0.9;
      const compressLoop = () => {
        canvas.toBlob(
          (newBlob) => {
            console.log(`Intentando con calidad ${quality.toFixed(1)}. Tamaño resultante: ${(newBlob.size / 1024 / 1024).toFixed(2)}MB`);
            if (newBlob.size <= targetSizeInBytes || quality <= 0.2) {
              console.log("Compresión finalizada.");
              resolve(newBlob);
            } else {
              quality -= 0.1;
              compressLoop();
            }
          },
          "image/jpeg",
          quality
        );
      };
      compressLoop();
    };

    image.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    image.src = url;
  });
};

const DiseniosAdminPage = () => {
  useScrollToTop();
  const queryClient = useQueryClient();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentDisenio, setCurrentDisenio] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: "",
    descripcion: "",
    imagen_file: null,
    precio: "",
    oferta: "",
    duracion: "",
    subcategorias: [],
  });

  const [crop, setCrop] = useState({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [categorySelectorError, setCategorySelectorError] = useState(null);

  const [duracionHoras, setDuracionHoras] = useState(0);
  const [duracionMinutos, setDuracionMinutos] = useState(15);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: "", children: null, onConfirm: () => {} });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Para el input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Para la API
  const [isFakeLoadingSearch, setIsFakeLoadingSearch] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const queryKeyDiseniosAdmin = ["diseniosAdmin", currentPage, debouncedSearchTerm];
  const {
    data: apiData,
    isLoading: isLoadingDisenios,
    error: errorDisenios,
    refetch: refetchDisenios,
  } = useApiRequest({
    queryKey: queryKeyDiseniosAdmin,
    url: "/disenios/admin",
    method: "GET",
    config: {
      params: {
        page: currentPage,
        limit: ITEMS_PER_PAGE_ADMIN,
        search: debouncedSearchTerm,
      },
    },
    options: { keepPreviousData: true },
    notificationEnabled: false,
  });

  const disenios = apiData?.disenios ?? [];
  const totalPages = apiData?.totalPages ?? 1;

  const { data: todasLasCategorias, isLoading: isLoadingCategorias } = useApiRequest({
    queryKey: ["categorias"],
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });

  const categoriasPadreOptionsForSelector = useMemo(() => {
    return (
      todasLasCategorias
        ?.filter((cp) => cp.activo)
        .map((cp) => ({
          label: cp.nombre,
          value: cp.id,
          icono: cp.icono,
          subcategorias: cp.subcategorias?.filter((s) => s.activo).map((s) => ({ label: s.nombre, value: s.id, icono: s.icono })) ?? [],
        })) ?? []
    );
  }, [todasLasCategorias]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    setIsFakeLoadingSearch(true);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setIsFakeLoadingSearch(false);
    }, 500);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const parseDuracion = (duracionString) => {
    if (!duracionString) return { horas: 0, minutos: 15 };
    const horasMatch = duracionString.match(/(\d+)h/);
    const minutosMatch = duracionString.match(/(\d+)min/);
    const horas = horasMatch ? parseInt(horasMatch[1]) : 0;
    const minutos = minutosMatch ? parseInt(minutosMatch[1]) : 0;
    if (horas === 0 && minutos === 0) return { horas: 0, minutos: 15 };
    return { horas, minutos };
  };

  const formatDuracion = (horas, minutos) => {
    if (horas === 0 && minutos === 0) return "15min";
    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        1
      );
    });
  };

  useEffect(() => {
    const nuevaDuracion = formatDuracion(duracionHoras, duracionMinutos);
    setFormValues((prev) => ({ ...prev, duracion: nuevaDuracion }));
  }, [duracionHoras, duracionMinutos]);

  const commonMutationOptions = (successMsg) => ({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["diseniosAdmin"] });
      closeFormModal();
      setIsConfirmModalOpen(false);
      CRAlert.alert({ title: "Éxito", message: data?.message || successMsg, type: "success" });
    },
    onError: (error) => {
      setIsConfirmModalOpen(false);
      CRAlert.alert({ title: "Error", message: error.response?.data?.message || "La operación falló.", type: "error" });
    },
  });

  const addDisenioMutation = useApiRequest({
    url: "/disenios",
    method: "POST",
    options: commonMutationOptions("Diseño añadido con éxito."),
    notificationEnabled: false,
  });

  const editDisenioMutation = useApiRequest({
    method: "PUT",
    options: commonMutationOptions("Diseño actualizado con éxito."),
    notificationEnabled: false,
  });

  const toggleActivoDisenioMutation = useApiRequest({
    method: "PATCH",
    options: commonMutationOptions("Estado del diseño actualizado."),
    notificationEnabled: false,
  });

  const deleteDisenioMutation = useApiRequest({
    method: "DELETE",
    options: commonMutationOptions("Diseño eliminado con éxito."),
    notificationEnabled: false,
  });

  const openFormModal = (mode, disenio = null) => {
    setModalMode(mode);
    setCurrentDisenio(disenio);
    setCategorySelectorError(null);
    setImagePreview(disenio?.imagen_url || null);
    if (mode === "edit" && disenio) {
      const { horas, minutos } = parseDuracion(disenio.duracion);
      setDuracionHoras(horas);
      setDuracionMinutos(minutos);
      setFormValues({
        nombre: disenio.nombre ?? "",
        descripcion: disenio.descripcion ?? "",
        imagen_file: null,
        precio: disenio.precio?.toString() ?? "",
        oferta: disenio.oferta?.toString() ?? "",
        duracion: disenio.duracion ?? "",
        subcategorias: disenio.subcategorias_ids ?? [],
      });
    } else {
      setDuracionHoras(0);
      setDuracionMinutos(15);
      setFormValues({
        nombre: "",
        descripcion: "",
        imagen_file: null,
        precio: "",
        oferta: "",
        duracion: "15min",
        subcategorias: [],
      });
    }
    setErrors({});
    setIsFormModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setOriginalImagePreview(previewUrl);
      setShowCropModal(true);
      setErrors((prev) => ({ ...prev, imagen_file: undefined }));
    } else {
      setFormValues((prev) => ({ ...prev, imagen_file: null }));
      setImagePreview(currentDisenio?.imagen_url || null);
    }
  };

  // MODIFICADO: Ahora es async y llama a la función de compresión
  const handleCropComplete = async () => {
    if (imgRef && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedImageBlob = await getCroppedImg(imgRef, completedCrop);

        // -- INICIO DEL CAMBIO --
        // Comprimir la imagen si es necesario
        const optimizedBlob = await resizeAndCompressImage(croppedImageBlob);
        // -- FIN DEL CAMBIO --

        const croppedFile = new File([optimizedBlob], originalImageFile.name, {
          type: "image/jpeg", // La compresión genera un jpeg
        });

        setFormValues((prev) => ({ ...prev, imagen_file: croppedFile }));

        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }

        const croppedPreview = URL.createObjectURL(optimizedBlob);
        setImagePreview(croppedPreview);

        setShowCropModal(false);

        if (originalImagePreview) {
          URL.revokeObjectURL(originalImagePreview);
          setOriginalImagePreview(null);
        }
      } catch (error) {
        console.error("Error al recortar o comprimir la imagen:", error);
        CRAlert.alert({ title: "Error", message: "No se pudo procesar la imagen.", type: "error" });
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageFile(null);

    if (originalImagePreview) {
      URL.revokeObjectURL(originalImagePreview);
      setOriginalImagePreview(null);
    }

    const fileInput = document.getElementById("imagen_file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleCategorySelectorError = (errorMsg) => {
    setCategorySelectorError(errorMsg);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.9;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: "px",
      width: size,
      height: size,
      x: x,
      y: y,
      aspect: 1,
    });

    setImgRef(e.currentTarget);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (modalMode === "add" && !formValues.imagen_file) {
      newErrors.imagen_file = "La imagen es obligatoria.";
    }
    if (formValues.imagen_file && formValues.imagen_file.size > 15 * 1024 * 1024) {
      newErrors.imagen_file = "El archivo procesado sigue siendo demasiado grande (max 15MB). Esto no debería ocurrir.";
    }
    if (formValues.imagen_file && !formValues.imagen_file.type.startsWith("image/")) {
      newErrors.imagen_file = "El archivo debe ser una imagen.";
    }
    if (categorySelectorError) {
      newErrors.subcategoriasGlobal = categorySelectorError;
    }
    if (formValues.subcategorias.length === 0) {
      newErrors.subcategoriasGlobal =
        (newErrors.subcategoriasGlobal ? newErrors.subcategoriasGlobal + " " : "") + "Debe seleccionar al menos una subcategoría.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
    formData.append("nombre", formValues.nombre);
    formData.append("descripcion", formValues.descripcion || "");
    if (formValues.imagen_file) {
      formData.append("imagen_disenio", formValues.imagen_file);
    }
    formData.append("precio", formValues.precio || "");
    formData.append("oferta", formValues.oferta || "");
    formData.append("duracion", formValues.duracion || "");
    formValues.subcategorias.forEach((subId) => formData.append("subcategorias", subId.toString()));

    if (modalMode === "add") {
      await addDisenioMutation.mutateAsync(formData);
    } else {
      await editDisenioMutation.mutateAsync({
        url: `/disenios/${currentDisenio?.id}`,
        data: formData,
      });
    }
  };

  const prepareToggleActivo = (disenio) => {
    const actionText = disenio.activo ? "Deshabilitar" : "Habilitar";
    setConfirmModalProps({
      title: `Confirmar ${actionText}`,
      children: (
        <p>
          ¿Estás seguro de que deseas {actionText.toLowerCase()} el diseño "{disenio.nombre}"?
        </p>
      ),
      onConfirm: async () => {
        await toggleActivoDisenioMutation.mutateAsync({
          url: `/disenios/${disenio.id}/toggle-activo`,
          data: null,
        });
      },
      confirmButtonText: actionText,
      confirmButtonClass: disenio.activo ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
    });
    setIsConfirmModalOpen(true);
  };

  const prepareDeleteDisenio = (disenio) => {
    setConfirmModalProps({
      title: "Confirmar Eliminación",
      children: <p>¿Estás seguro de que deseas eliminar permanentemente el diseño "{disenio.nombre}"? Esta acción no se puede deshacer.</p>,
      onConfirm: async () => {
        await deleteDisenioMutation.mutateAsync({
          url: `/disenios/${disenio.id}`,
        });
      },
      confirmButtonText: "Eliminar",
      confirmButtonClass: "bg-red-600 hover:bg-red-700",
    });
    setIsConfirmModalOpen(true);
  };

  const isMutationLoading =
    addDisenioMutation.isPending || editDisenioMutation.isPending || toggleActivoDisenioMutation.isPending || deleteDisenioMutation.isPending;

  const handleCategorySelectorChange = (selectedSubcategoryIds) => {
    setFormValues((prev) => ({ ...prev, subcategorias: selectedSubcategoryIds }));
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentDisenio(null);
    setDuracionHoras(0);
    setDuracionMinutos(15);
    setFormValues({
      nombre: "",
      descripcion: "",
      imagen_file: null,
      precio: "",
      oferta: "",
      duracion: "",
      subcategorias: [],
    });

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    if (originalImagePreview && originalImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(originalImagePreview);
    }

    setImagePreview(null);
    setOriginalImagePreview(null);
    setShowCropModal(false);
    setOriginalImageFile(null);
    setCategorySelectorError(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      if (originalImagePreview && originalImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(originalImagePreview);
      }
    };
  }, [imagePreview, originalImagePreview]);

  if ((isLoadingDisenios && !apiData) || isLoadingCategorias) {
    return <CRLoader text="Cargando datos..." fullScreen={false} style="circle" size="lg" />;
  }

  if (errorDisenios) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <DynamicIcon name="AlertTriangle" className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">Error al cargar los diseños: {errorDisenios.message ?? "Error desconocido"}</p>
        <CRButton onClick={() => refetchDisenios()} title="Reintentar" className="mt-4 bg-primary text-white" />
      </div>
    );
  }

  return (
    <div className="sm:px mx-4 mb-8">
      {isMutationLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Diseños</h1>
        <CRButton
          title="Añadir Nuevo Diseño"
          externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
          iconPosition="left"
          onClick={() => openFormModal("add")}
          className="bg-primary text-white hover:bg-opacity-90 text-sm py-2 px-4"
          disabled={isMutationLoading}
        />
      </div>

      <div className="mb-6 relative">
        <CRInput
          type="text"
          placeholder="Buscar diseños por nombre o descripción..."
          value={searchTerm}
          setValue={handleSearchInputChange}
          className="text-sm py-2.5 !pr-10"
          title=""
        />
        {isFakeLoadingSearch && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-[11px]">
            <DynamicIcon name="Loader2" className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {disenios?.length === 0 ? (
        <div className="text-center py-10 bg-background dark:bg-slate-800 rounded-lg shadow">
          <DynamicIcon name="ImageOff" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-xl text-textSecondary dark:text-slate-400">
            {debouncedSearchTerm ? "No hay diseños que coincidan con tu búsqueda." : "No hay diseños para mostrar."}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            {debouncedSearchTerm ? "Intenta con otro término." : "Empieza añadiendo un nuevo diseño."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {disenios?.map((disenio) => (
              <div
                key={disenio.id}
                className={`rounded-lg shadow-lg overflow-hidden ${
                  disenio.activo ? "bg-background dark:bg-slate-800" : "bg-gray-100 dark:bg-slate-700 opacity-70"
                }`}
              >
                <img src={disenio.imagen_url} alt={disenio.nombre} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3
                    className={`text-lg font-semibold mb-1 ${
                      disenio.activo ? "text-textPrimary dark:text-white" : "text-gray-500 dark:text-slate-400"
                    }`}
                  >
                    {disenio.nombre}
                  </h3>
                  {!disenio.activo && <span className="text-xs font-normal text-yellow-600 dark:text-yellow-400">(Inactivo)</span>}
                  <p className="text-xs text-textSecondary dark:text-slate-400 mb-1 truncate">{disenio.descripcion}</p>
                  <p className="text-sm font-medium text-primary dark:text-primary-light mb-1">
                    {disenio.precio ? `Q${parseFloat(disenio.precio).toFixed(2)}` : "Precio no definido"}
                    {disenio.oferta && <span className="ml-2 text-red-500 dark:text-red-400">Oferta: Q{parseFloat(disenio.oferta).toFixed(2)}</span>}
                  </p>
                  <p className="text-xs text-textTertiary dark:text-slate-500">Duración: {disenio.duracion || "No especificada"}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-2">
                    <CRButton
                      title="Editar"
                      onlyIcon
                      externalIcon={<DynamicIcon name="Edit3" className="w-4 h-4" />}
                      onClick={() => openFormModal("edit", disenio)}
                      className="!bg-orange-500 hover:!bg-orange-600 text-white !p-1.5"
                      disabled={isMutationLoading}
                    />
                    <CRButton
                      title={disenio.activo ? "Inactivar" : "Activar"}
                      onlyIcon
                      externalIcon={<DynamicIcon name={disenio.activo ? "EyeOff" : "Eye"} className="w-4 h-4" />}
                      onClick={() => prepareToggleActivo(disenio)}
                      className={`text-white !p-1.5 ${disenio.activo ? "!bg-yellow-500 hover:!bg-yellow-600" : "!bg-green-500 hover:!bg-green-600"}`}
                      disabled={isMutationLoading}
                    />
                    <CRButton
                      title="Eliminar"
                      onlyIcon
                      externalIcon={<DynamicIcon name="Trash2" className="w-4 h-4" />}
                      onClick={() => prepareDeleteDisenio(disenio)}
                      className="!bg-red-600 hover:!bg-red-700 text-white !p-1.5"
                      disabled={isMutationLoading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Paginador currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {isFormModalOpen && (
        <CRModal
          isOpen={isFormModalOpen}
          setIsOpen={closeFormModal}
          title={modalMode === "add" ? "Añadir Nuevo Diseño" : "Editar Diseño"}
          width={window.innerWidth < 768 ? 95 : 70}
          height={window.innerWidth < 768 ? 90 : "auto"}
          modifiesURL={false}
        >
          <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <CRInput
              title="Nombre del Diseño"
              name="nombre"
              value={formValues.nombre}
              setValue={(val) => handleInputChange({ target: { name: "nombre", value: val } })}
              error={errors.nombre}
              placeholder="Ej: Uñas Galaxia"
              require
            />
            <CRInput
              title="Descripción"
              name="descripcion"
              value={formValues.descripcion}
              setValue={(val) => handleInputChange({ target: { name: "descripcion", value: val } })}
              placeholder="Pequeña descripción del diseño"
            />

            <div>
              <label htmlFor="imagen_file" className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">
                Imagen del Diseño {modalMode === "add" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                id="imagen_file"
                name="imagen_file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 dark:text-slate-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary/10 file:text-primary
                           hover:file:bg-primary/20 dark:file:bg-primary/80 dark:file:text-white dark:hover:file:bg-primary"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Previsualización" className="max-h-40 rounded-md border border-gray-300 dark:border-slate-600" />
                </div>
              )}
              {errors.imagen_file && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.imagen_file}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CRInput
                title="Precio"
                name="precio"
                type="number"
                value={formValues.precio}
                setValue={(val) => handleInputChange({ target: { name: "precio", value: val } })}
                placeholder="Ej: 150"
                step="0.01"
              />
              <CRInput
                title="Precio de Oferta (opcional)"
                name="oferta"
                type="number"
                value={formValues.oferta}
                setValue={(val) => handleInputChange({ target: { name: "oferta", value: val } })}
                placeholder="Ej: 120"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-2">Duración Estimada</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-textSecondary dark:text-gray-400 mb-1">Horas</label>
                  <select
                    value={duracionHoras}
                    onChange={(e) => setDuracionHoras(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md
                             bg-white dark:bg-slate-700 text-textPrimary dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={0}>0h</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}h
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-textSecondary dark:text-gray-400 mb-1">Minutos</label>
                  <select
                    value={duracionMinutos}
                    onChange={(e) => setDuracionMinutos(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md
                             bg-white dark:bg-slate-700 text-textPrimary dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={0}>0min</option>
                    <option value={15}>15min</option>
                    <option value={30}>30min</option>
                    <option value={45}>45min</option>
                  </select>
                </div>
              </div>
              <div className="mt-1 text-xs text-textSecondary dark:text-gray-400">
                Duración seleccionada: <span className="font-medium text-primary dark:text-primary-light">{formValues.duracion}</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <h4 className="text-base font-semibold text-textPrimary dark:text-gray-200">Selección de Categorías y Subcategorías</h4>
              <CategorySubcategorySelector
                categoriasPadreOptions={categoriasPadreOptionsForSelector}
                initialSelectedSubcategoryIds={formValues.subcategorias}
                onChange={handleCategorySelectorChange}
                onError={handleCategorySelectorError}
              />
              {errors.subcategoriasGlobal && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.subcategoriasGlobal}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <CRButton
                type="button"
                title="Cancelar"
                onClick={closeFormModal}
                className="bg-gray-300 dark:bg-gray-600 text-textPrimary dark:text-white"
                disabled={isMutationLoading}
              />
              <CRButton
                type="submit"
                title={modalMode === "add" ? "Añadir Diseño" : "Guardar Cambios"}
                className="bg-primary text-white"
                loading={isMutationLoading}
                disabled={isMutationLoading}
              />
            </div>
          </form>
        </CRModal>
      )}

      {showCropModal && originalImagePreview && (
        <CRModal
          isOpen={showCropModal}
          setIsOpen={handleCropCancel}
          title="Recortar Imagen"
          width={window.innerWidth < 768 ? 95 : 80}
          modifiesURL={false}
        >
          <div className="space-y-4 p-4">
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={50}
                minHeight={50}
                keepSelection={true}
              >
                <img src={originalImagePreview} alt="Imagen a recortar" onLoad={onImageLoad} style={{ maxWidth: "100%", maxHeight: "400px" }} />
              </ReactCrop>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Arrastra para seleccionar el área que deseas recortar (formato cuadrado)
            </p>
            <div className="flex justify-end space-x-3">
              <CRButton
                type="button"
                title="Cancelar"
                onClick={handleCropCancel}
                className="bg-gray-300 dark:bg-gray-600 text-textPrimary dark:text-white"
              />
              <CRButton
                type="button"
                title="Aplicar Recorte"
                onClick={handleCropComplete}
                className="bg-primary text-white"
                disabled={!completedCrop?.width || !completedCrop?.height}
              />
            </div>
          </div>
        </CRModal>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isMutationLoading) setIsConfirmModalOpen(false);
        }}
        title={confirmModalProps.title}
        type="warning"
      >
        {confirmModalProps.children}
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={(e) => {
              e.stopPropagation();
              if (!isMutationLoading) setIsConfirmModalOpen(false);
            }}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-textPrimary dark:text-white"
            disabled={isMutationLoading}
          />
          <CRButton
            title={confirmModalProps.confirmButtonText || "Confirmar"}
            onClick={async (e) => {
              e.stopPropagation();
              if (isMutationLoading) return;
              await confirmModalProps.onConfirm();
            }}
            className={`${confirmModalProps.confirmButtonClass || "bg-primary hover:bg-primary-dark"} text-white`}
            loading={isMutationLoading}
            disabled={isMutationLoading}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default DiseniosAdminPage;
