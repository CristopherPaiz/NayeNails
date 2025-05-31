import React, { useState, useEffect, useCallback } from "react";
import CRLoader from "../../components/UI/CRLoader";
import useApiRequest from "../../hooks/useApiRequest";
import useStoreNails from "../../store/store";
import ImageManagerSection from "./ImageManagerSection"; // Nuevo componente
import CRButton from "../../components/UI/CRButton";
import CRAlert from "../../components/UI/CRAlert";
import { DynamicIcon } from "../../utils/DynamicIcon";

const CONFIG_KEYS = {
  CAROUSEL_PRINCIPAL: "carousel_principal_imagenes",
  CAROUSEL_SECUNDARIO: "carousel_secundario_imagenes", // Cambiado de OBJETIVO a SECUNDARIO para consistencia
  GALERIA_INICIAL: "galeria_inicial_imagenes",
};

const ConfiguracionesPage = () => {
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
    url: "/configuraciones-sitio", // POST a esta ruta para crear/actualizar
    method: "POST",
    options: {
      onSuccess: () => {
        // No mostrar alerta individual aquí, se mostrará una global al final
      },
      onError: (error, variables) => {
        CRAlert.alert({
          title: "Error Guardando Sección",
          message: `Error al guardar ${variables.clave}: ${error.response?.data?.message || error.message}`,
          type: "error",
        });
      },
    },
    notificationEnabled: false, // Deshabilitar notificaciones individuales
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
      const images = managedSections[key].filter((img) => !img.isLoading); // Excluir las que aún cargan
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

  const handleSaveAll = async () => {
    if (!validateSections()) {
      return;
    }

    let allSucceeded = true;
    for (const sectionKey of Object.keys(managedSections)) {
      const imagesToSave = managedSections[sectionKey]
        .filter((img) => img.url) // Solo guardar imágenes que tienen URL (subidas)
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
        console.log(`Error guardando sección ${sectionKey}:`, error);
        allSucceeded = false;
        // El onError de la mutación ya muestra alerta
      }
    }

    if (allSucceeded) {
      CRAlert.alert({ title: "Éxito", message: "Todas las configuraciones de imágenes se guardaron correctamente.", type: "success" });
      refreshStoreConfigs(); // Actualizar el store global
      refetchApiConfigs(); // Refrescar datos de la API para esta página
    } else {
      CRAlert.alert({
        title: "Guardado Parcial",
        message: "Algunas configuraciones no pudieron guardarse. Revisa los mensajes de error.",
        type: "warning",
      });
    }
  };

  const isLoading = isLoadingApiConfigs || updateConfigMutation.isPending;

  if (isLoadingApiConfigs && !initialDataLoaded) {
    return <CRLoader text="Cargando configuraciones..." fullScreen={false} style="circle" size="lg" />;
  }

  return (
    <div className="sm:px-4">
      {isLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Configuración de Imágenes del Sitio</h1>
        <CRButton
          title="Guardar Todos los Cambios"
          onClick={handleSaveAll}
          className="bg-green-600 hover:bg-green-700 text-white"
          loading={updateConfigMutation.isPending}
          disabled={updateConfigMutation.isPending || isLoadingApiConfigs}
          externalIcon={<DynamicIcon name="Save" className="w-4 h-4" />}
          iconPosition="left"
        />
      </div>

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
