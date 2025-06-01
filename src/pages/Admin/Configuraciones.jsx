import React, { useState, useEffect, useCallback } from "react";
import CRLoader from "../../components/UI/CRLoader";
import useApiRequest from "../../hooks/useApiRequest";
import useStoreNails from "../../store/store";
import ImageManagerSection from "./ImageManagerSection";
import CRButton from "../../components/UI/CRButton";
import CRAlert from "../../components/UI/CRAlert";
import { DynamicIcon } from "../../utils/DynamicIcon";
import apiClient from "../../api/axios"; // Para subida de imagen de ubicación
import useScrollToTop from "../../hooks/useScrollToTop";

const CONFIG_KEYS = {
  CAROUSEL_PRINCIPAL: "carousel_principal_imagenes",
  CAROUSEL_SECUNDARIO: "carousel_secundario_imagenes",
  GALERIA_INICIAL: "galeria_inicial_imagenes",
};

const LocationImageManager = ({ initialImageUrl, initialPublicId, onSave, isSubmittingGlobal }) => {
  useScrollToTop();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl || null);
  const [currentPublicId, setCurrentPublicId] = useState(initialPublicId || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(initialImageUrl || null);
    setCurrentPublicId(initialPublicId || null);
  }, [initialImageUrl, initialPublicId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    // No se elimina el public_id aquí, se manejará al guardar la configuración general
    // si el usuario decide guardar sin una imagen.
  };

  const handleUploadAndSave = async () => {
    if (isSubmittingGlobal || isUploading) return;

    if (imageFile) {
      // Si hay un nuevo archivo para subir
      setIsUploading(true);
      const formData = new FormData();
      formData.append("location_image", imageFile);
      try {
        const response = await apiClient.post("/site-uploads/location-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setIsUploading(false);
        onSave(response.data.imageData.secure_url, response.data.imageData.public_id);
        setImageFile(null); // Limpiar archivo después de subir
      } catch (error) {
        setIsUploading(false);
        CRAlert.alert({
          title: "Error de Subida",
          message: `No se pudo subir la imagen de ubicación: ${error.response?.data?.message || error.message}`,
          type: "error",
        });
      }
    } else if (!preview && initialImageUrl) {
      // Si se eliminó la imagen existente y no hay nueva
      onSave(null, null); // Enviar null para que se borre en la BD
    } else if (preview === initialImageUrl) {
      // Si no hubo cambios en la imagen
      CRAlert.alert({ title: "Información", message: "No hay cambios en la imagen de ubicación para guardar.", type: "info" });
    } else {
      // Caso donde solo se limpió el preview pero no había initialImageUrl, o caso inesperado
      onSave(preview, currentPublicId); // Guardar el estado actual (podría ser null si se borró)
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="bg-background dark:bg-slate-800 p-5 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-3">
        <DynamicIcon name="MapPin" className="inline-block mr-2 w-5 h-5 text-primary" />
        Imagen de Ubicación del Negocio
      </h3>
      <p className="text-xs text-textSecondary dark:text-slate-400 mb-3">
        Esta imagen aparecerá en la página de inicio y en la sección de ubicación.
      </p>
      <div className="mb-4">
        <label
          htmlFor="location-image-upload"
          className={`relative cursor-pointer bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors duration-150 inline-flex items-center
                      ${isUploading || isSubmittingGlobal ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <DynamicIcon name="UploadCloud" className="w-4 h-4 mr-2" />
          {preview ? "Cambiar Imagen" : "Seleccionar Imagen"}
          <input
            id="location-image-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading || isSubmittingGlobal}
          />
        </label>
        {isUploading && <span className="ml-3 text-sm text-primary animate-pulse">Subiendo...</span>}
      </div>
      {preview && (
        <div className="relative inline-block mb-3">
          <img src={preview} alt="Vista previa de ubicación" className="max-h-40 rounded-md border border-gray-300 dark:border-slate-600" />
          <CRButton
            title="Eliminar"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 !bg-red-500 hover:!bg-red-600 text-white !p-1 !m-0 text-xs"
            externalIcon={<DynamicIcon name="X" className="w-3 h-3" />}
            onlyIcon
            disabled={isUploading || isSubmittingGlobal}
          />
        </div>
      )}
      {!preview && <p className="text-sm text-gray-500 dark:text-slate-400 italic">No hay imagen de ubicación seleccionada.</p>}
      <CRButton
        title="Guardar Imagen de Ubicación"
        onClick={handleUploadAndSave}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white"
        loading={isUploading || isSubmittingGlobal}
        disabled={isUploading || isSubmittingGlobal}
      />
    </div>
  );
};

const ConfiguracionesPage = () => {
  const { textosColoresConfig, fetchTextosColoresConfig, isLoadingTextosColores } = useStoreNails();
  const { fetchConfiguracionesSitio: refreshStoreConfigs } = useStoreNails();

  const [managedSections, setManagedSections] = useState({
    [CONFIG_KEYS.CAROUSEL_PRINCIPAL]: [],
    [CONFIG_KEYS.CAROUSEL_SECUNDARIO]: [],
    [CONFIG_KEYS.GALERIA_INICIAL]: [],
  });

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const {
    data: apiConfigsData,
    isLoading: isLoadingApiConfigs,
    refetch: refetchApiConfigs,
  } = useApiRequest({
    queryKey: ["configuracionesSitioAdmin"],
    url: "/configuraciones-sitio",
    method: "GET",
    notificationEnabled: false,
  });

  const updateConfigMutation = useApiRequest({
    url: "/configuraciones-sitio",
    method: "POST",
    options: {
      onSuccess: () => {},
      onError: (error, variables) => {
        CRAlert.alert({
          title: "Error Guardando Sección",
          message: `Error al guardar ${variables.clave}: ${error.response?.data?.message || error.message}`,
          type: "error",
        });
      },
    },
    notificationEnabled: false,
  });

  const updateTextosColoresMutation = useApiRequest({
    url: "/textos-colores",
    method: "PUT",
    options: {
      onSuccess: () => {
        fetchTextosColoresConfig(); // Actualizar el store con la nueva imagen de ubicación
      },
      onError: (error) => {
        CRAlert.alert({
          title: "Error Guardando Imagen Ubicación",
          message: `Error al guardar la imagen de ubicación: ${error.response?.data?.message || error.message}`,
          type: "error",
        });
      },
    },
    notificationEnabled: false,
  });

  useEffect(() => {
    if (apiConfigsData && !initialDataLoaded) {
      const initialStates = {};
      Object.values(CONFIG_KEYS).forEach((key) => {
        const configItem = apiConfigsData.find((c) => c.clave === key);
        let images = [];
        if (configItem?.valor) {
          try {
            images = JSON.parse(configItem.valor);
            if (!Array.isArray(images)) images = [];
          } catch (e) {
            console.error(`Error parseando JSON para ${key}:`, e);
            images = [];
          }
        }
        initialStates[key] = images;
      });
      setManagedSections(initialStates);
      setInitialDataLoaded(true);
    }
  }, [apiConfigsData, initialDataLoaded]);

  const handleSectionChange = useCallback((sectionKey, updatedImages) => {
    setManagedSections((prev) => ({
      ...prev,
      [sectionKey]: updatedImages,
    }));
  }, []);

  const validateSections = () => {
    let isValid = true;
    const sectionsMeta = {
      [CONFIG_KEYS.CAROUSEL_PRINCIPAL]: { min: 3, max: 5, name: "Carrusel Principal" },
      [CONFIG_KEYS.CAROUSEL_SECUNDARIO]: { min: 3, max: 5, name: "Carrusel Secundario" },
      [CONFIG_KEYS.GALERIA_INICIAL]: { min: 10, max: 15, name: "Galería Principal" },
    };

    for (const key in managedSections) {
      const images = managedSections[key].filter((img) => !img.isLoading);
      const meta = sectionsMeta[key];
      if (images.length < meta.min || images.length > meta.max) {
        CRAlert.alert({
          title: "Error de Validación",
          message: `La sección "${meta.name}" debe tener entre ${meta.min} y ${meta.max} imágenes. Actualmente tiene ${images.length}.`,
          type: "error",
        });
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  const handleSaveLocationImage = async (newUrl, newPublicId) => {
    const currentConfig = textosColoresConfig;
    const payload = {
      ...currentConfig,
      imagen_ubicacion_url: newUrl,
      imagen_ubicacion_public_id: newPublicId,
    };
    try {
      await updateTextosColoresMutation.mutateAsync(payload);
      CRAlert.alert({ title: "Éxito", message: "Imagen de ubicación guardada.", type: "success" });
    } catch (e) {
      console.log("e", e);
      // El onError de la mutación ya muestra la alerta
    }
  };

  const handleSaveAllImageManagers = async () => {
    if (!validateSections()) {
      return;
    }

    let allSucceeded = true;
    for (const sectionKey of Object.keys(managedSections)) {
      const imagesToSave = managedSections[sectionKey]
        .filter((img) => img.url)
        .map((img) => ({
          url: img.url,
          public_id: img.public_id,
          legend: img.legend || "",
          alt: img.alt || "",
        }));

      try {
        await updateConfigMutation.mutateAsync({
          clave: sectionKey,
          valor: JSON.stringify(imagesToSave),
        });
      } catch (error) {
        console.log("e", error);
        allSucceeded = false;
      }
    }

    if (allSucceeded) {
      CRAlert.alert({
        title: "Éxito",
        message: "Todas las configuraciones de imágenes de carruseles/galería se guardaron correctamente.",
        type: "success",
      });
      refreshStoreConfigs();
      refetchApiConfigs();
    } else {
      CRAlert.alert({
        title: "Guardado Parcial",
        message: "Algunas configuraciones de imágenes de carruseles/galería no pudieron guardarse.",
        type: "warning",
      });
    }
  };

  const isLoading = isLoadingApiConfigs || updateConfigMutation.isPending || isLoadingTextosColores || updateTextosColoresMutation.isPending;

  if ((isLoadingApiConfigs && !initialDataLoaded) || (isLoadingTextosColores && !textosColoresConfig.nombre_negocio)) {
    return <CRLoader text="Cargando configuraciones..." fullScreen={false} style="circle" size="lg" />;
  }

  return (
    <div className="sm:px-4">
      {isLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Configuración de Imágenes del Sitio</h1>
        <CRButton
          title="Guardar Cambios (Carruseles/Galería)"
          onClick={handleSaveAllImageManagers}
          className="bg-green-600 hover:bg-green-700 text-white"
          loading={updateConfigMutation.isPending}
          disabled={updateConfigMutation.isPending || isLoadingApiConfigs}
          externalIcon={<DynamicIcon name="SaveAll" className="w-4 h-4" />}
          iconPosition="left"
        />
      </div>

      <LocationImageManager
        initialImageUrl={textosColoresConfig.imagen_ubicacion_url}
        initialPublicId={textosColoresConfig.imagen_ubicacion_public_id}
        onSave={handleSaveLocationImage}
        isSubmittingGlobal={updateTextosColoresMutation.isPending}
      />

      <ImageManagerSection
        title="Carrusel Principal"
        sectionKey={CONFIG_KEYS.CAROUSEL_PRINCIPAL}
        initialImagesData={managedSections[CONFIG_KEYS.CAROUSEL_PRINCIPAL]}
        minImages={3}
        maxImages={5}
        itemFieldLabel="Legend"
        onSectionChange={handleSectionChange}
        isSubmittingGlobal={updateConfigMutation.isPending}
      />

      <ImageManagerSection
        title="Carrusel Secundario (Objetivo)"
        sectionKey={CONFIG_KEYS.CAROUSEL_SECUNDARIO}
        initialImagesData={managedSections[CONFIG_KEYS.CAROUSEL_SECUNDARIO]}
        minImages={3}
        maxImages={5}
        itemFieldLabel="Legend"
        onSectionChange={handleSectionChange}
        isSubmittingGlobal={updateConfigMutation.isPending}
      />

      <ImageManagerSection
        title="Galería Principal"
        sectionKey={CONFIG_KEYS.GALERIA_INICIAL}
        initialImagesData={managedSections[CONFIG_KEYS.GALERIA_INICIAL]}
        minImages={10}
        maxImages={15}
        itemFieldLabel="Alt"
        onSectionChange={handleSectionChange}
        isSubmittingGlobal={updateConfigMutation.isPending}
      />
    </div>
  );
};

export default ConfiguracionesPage;
