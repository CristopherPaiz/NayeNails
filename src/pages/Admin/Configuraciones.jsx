import React, { useState, useEffect } from "react";
import CRLoader from "../../components/UI/CRLoader";
import useApiRequest from "../../hooks/useApiRequest";
import useStoreNails from "../../store/store";
import ImageConfigSection from "./ImageConfigSection";

const CONFIG_KEYS = {
  CAROUSEL_PRINCIPAL: "carousel_principal_imagenes",
  CAROUSEL_OBJETIVO: "carousel_objetivo_imagenes",
  GALERIA_INICIAL: "galeria_inicial_imagenes",
};

const ConfiguracionesPage = () => {
  const { imagenesInicio, imagenesGaleria, fetchConfiguracionesSitio } = useStoreNails();
  const [configData, setConfigData] = useState({
    [CONFIG_KEYS.CAROUSEL_PRINCIPAL]: "",
    [CONFIG_KEYS.CAROUSEL_OBJETIVO]: "",
    [CONFIG_KEYS.GALERIA_INICIAL]: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch site configurations
  const {
    data: apiConfigsData,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useApiRequest({
    queryKey: ["/configuraciones-sitio"],
    url: "/configuraciones-sitio",
    method: "GET",
    notificationEnabled: false,
  });

  // Setup update mutation
  const updateConfigMutation = useApiRequest({
    url: "/configuraciones-sitio",
    method: "POST",
    options: {
      onSuccess: () => {
        refetchConfigs();
        fetchConfiguracionesSitio();
        setErrors({});
      },
      onError: (error, variables) => {
        setErrors((prev) => ({
          ...prev,
          [variables.clave]: error.response?.data?.message || "Error al guardar.",
        }));
      },
    },
    successMessage: "Configuración guardada con éxito.",
  });

  // Initialize data from API or store
  useEffect(() => {
    if (apiConfigsData) {
      // Process API data
      const getConfigValue = (key) => {
        const configItem = apiConfigsData.find((c) => c.clave === key);
        return configItem ? JSON.stringify(JSON.parse(configItem.valor), null, 2) : "[]";
      };

      setConfigData({
        [CONFIG_KEYS.CAROUSEL_PRINCIPAL]: getConfigValue(CONFIG_KEYS.CAROUSEL_PRINCIPAL),
        [CONFIG_KEYS.CAROUSEL_OBJETIVO]: getConfigValue(CONFIG_KEYS.CAROUSEL_OBJETIVO),
        [CONFIG_KEYS.GALERIA_INICIAL]: getConfigValue(CONFIG_KEYS.GALERIA_INICIAL),
      });
    } else {
      // Use store data as fallback
      setConfigData({
        [CONFIG_KEYS.CAROUSEL_PRINCIPAL]: JSON.stringify(imagenesInicio || [], null, 2),
        [CONFIG_KEYS.CAROUSEL_OBJETIVO]: "[]", // Fallback
        [CONFIG_KEYS.GALERIA_INICIAL]: JSON.stringify(imagenesGaleria || [], null, 2),
      });
    }
  }, [apiConfigsData, imagenesInicio, imagenesGaleria]);

  // Validate and save configuration
  const handleSave = async (key) => {
    try {
      const jsonValue = configData[key];
      const parsed = JSON.parse(jsonValue);

      // Validate array and required fields
      if (!Array.isArray(parsed)) {
        throw new Error("Debe ser un array JSON.");
      }

      for (const item of parsed) {
        if (typeof item !== "object" || !item || typeof item.url !== "string" || !item.url.trim()) {
          throw new Error("Cada objeto debe tener una propiedad 'url' válida.");
        }
      }

      // Clear error and submit
      setErrors((prev) => ({ ...prev, [key]: undefined }));
      await updateConfigMutation.mutateAsync({ clave: key, valor: jsonValue });
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: `Error: ${e.message}` }));
    }
  };

  // Update config data
  const handleChange = (key, value) => {
    setConfigData((prev) => ({ ...prev, [key]: value }));
  };

  const isLoading = isLoadingConfigs || updateConfigMutation.isPending;

  return (
    <div className="sm:px-4 ">
      {isLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}

      <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white mb-8">Configuraciones del Sitio</h1>

      <ImageConfigSection
        title="Imágenes del Carrusel Principal"
        configKey={CONFIG_KEYS.CAROUSEL_PRINCIPAL}
        value={configData[CONFIG_KEYS.CAROUSEL_PRINCIPAL]}
        onChange={(value) => handleChange(CONFIG_KEYS.CAROUSEL_PRINCIPAL, value)}
        onSave={handleSave}
        error={errors[CONFIG_KEYS.CAROUSEL_PRINCIPAL]}
        isSubmitting={updateConfigMutation.isPending}
        icon="GalleryHorizontal"
      />

      <ImageConfigSection
        title="Imágenes del Carrusel Objetivo"
        configKey={CONFIG_KEYS.CAROUSEL_OBJETIVO}
        value={configData[CONFIG_KEYS.CAROUSEL_OBJETIVO]}
        onChange={(value) => handleChange(CONFIG_KEYS.CAROUSEL_OBJETIVO, value)}
        onSave={handleSave}
        error={errors[CONFIG_KEYS.CAROUSEL_OBJETIVO]}
        isSubmitting={updateConfigMutation.isPending}
        icon="GalleryThumbnails"
      />

      <ImageConfigSection
        title="Imágenes de la Galería Inicial"
        configKey={CONFIG_KEYS.GALERIA_INICIAL}
        value={configData[CONFIG_KEYS.GALERIA_INICIAL]}
        onChange={(value) => handleChange(CONFIG_KEYS.GALERIA_INICIAL, value)}
        onSave={handleSave}
        error={errors[CONFIG_KEYS.GALERIA_INICIAL]}
        isSubmitting={updateConfigMutation.isPending}
        icon="GalleryVertical"
      />
    </div>
  );
};

export default ConfiguracionesPage;
