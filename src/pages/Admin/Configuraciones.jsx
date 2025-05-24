import React, { useState, useEffect } from "react";
import CRInput from "../../components/UI/CRInput";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useApiRequest from "../../hooks/useApiRequest";
import useStoreNails from "../../store/store"; // Para obtener valores iniciales y actualizar el store

const ConfiguracionesPage = () => {
  const { imagenesInicio, imagenesGaleria, fetchConfiguracionesSitio } = useStoreNails();

  // Estados para las URLs de las imágenes
  // Se almacenarán como strings JSON de arrays de objetos { url: "..." }
  const [carouselPrincipalUrls, setCarouselPrincipalUrls] = useState("");
  const [carouselObjetivoUrls, setCarouselObjetivoUrls] = useState(""); // Asumiendo que hay otro carrusel
  const [galeriaInicialUrls, setGaleriaInicialUrls] = useState("");

  const [errors, setErrors] = useState({});

  // Cargar configuraciones existentes al montar
  const {
    data: configsData,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useApiRequest({
    queryKey: ["/configuraciones-sitio"],
    url: "/configuraciones-sitio",
    method: "GET",
    notificationEnabled: false,
  });

  useEffect(() => {
    if (configsData) {
      const principal = configsData.find((c) => c.clave === "carousel_principal_imagenes")?.valor ?? "[]";
      const objetivo = configsData.find((c) => c.clave === "carousel_objetivo_imagenes")?.valor ?? "[]";
      const galeria = configsData.find((c) => c.clave === "galeria_inicial_imagenes")?.valor ?? "[]";

      setCarouselPrincipalUrls(JSON.stringify(JSON.parse(principal), null, 2));
      setCarouselObjetivoUrls(JSON.stringify(JSON.parse(objetivo), null, 2));
      setGaleriaInicialUrls(JSON.stringify(JSON.parse(galeria), null, 2));
    } else {
      // Si no hay datos de API, usar los del store como placeholder inicial
      setCarouselPrincipalUrls(JSON.stringify(imagenesInicio, null, 2));
      setGaleriaInicialUrls(JSON.stringify(imagenesGaleria, null, 2));
      // setCarouselObjetivoUrls(...) si existe en el store
    }
  }, [configsData, imagenesInicio, imagenesGaleria]);

  const updateConfigMutation = useApiRequest({
    url: "/configuraciones-sitio", // Endpoint para guardar/actualizar una config
    method: "POST", // O PUT si el backend espera una clave específica
    options: {
      onSuccess: () => {
        refetchConfigs(); // Recargar todas las configs
        fetchConfiguracionesSitio(); // Actualizar el store de Zustand
        setErrors({});
      },
      onError: (error, variables) => {
        setErrors((prev) => ({ ...prev, [variables.clave]: error.response?.data?.message ?? "Error al guardar." }));
      },
    },
    successMessage: "Configuración guardada con éxito.",
  });

  const isValidJsonArrayOfImageObjects = (str, clave) => {
    try {
      const parsed = JSON.parse(str);
      if (!Array.isArray(parsed)) {
        setErrors((prev) => ({ ...prev, [clave]: "Debe ser un array JSON." }));
        return false;
      }
      for (const item of parsed) {
        if (typeof item !== "object" || item === null || typeof item.url !== "string" || !item.url.trim()) {
          setErrors((prev) => ({ ...prev, [clave]: "Cada objeto en el array debe tener una propiedad 'url' (string no vacío)." }));
          return false;
        }
      }
      setErrors((prev) => ({ ...prev, [clave]: undefined })); // Limpiar error si es válido
      return true;
    } catch (e) {
      setErrors((prev) => ({ ...prev, [clave]: "JSON inválido." }));
      return false;
    }
  };

  const handleSave = async (clave, valorStringJson) => {
    if (!isValidJsonArrayOfImageObjects(valorStringJson, clave)) {
      return;
    }
    await updateConfigMutation.mutateAsync({ clave, valor: valorStringJson });
  };

  const isLoading = isLoadingConfigs || updateConfigMutation.isPending;

  const renderConfigSection = (title, clave, value, setValue, iconName) => (
    <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-4 flex items-center">
        <DynamicIcon name={iconName} className="w-6 h-6 mr-2 text-primary" />
        {title}
      </h2>
      <p className="text-xs text-textSecondary dark:text-slate-400 mb-1">
        Ingresa un array de objetos JSON. Cada objeto debe tener una propiedad "url". Ejemplo:
      </p>
      <pre className="text-xs bg-gray-100 dark:bg-slate-700 p-2 rounded mb-3 overflow-x-auto">
        {`[
  { "url": "https://ejemplo.com/imagen1.jpg", "legend": "Opcional" },
  { "url": "https://ejemplo.com/imagen2.png" }
]`}
      </pre>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        className={`w-full p-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 text-sm
                    ${errors[clave] ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-slate-600"}
                    focus:ring-primary focus:border-primary dark:text-white`}
        placeholder="Pega aquí el JSON con las URLs de las imágenes."
      />
      {errors[clave] && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors[clave]}</p>}
      <CRButton
        title="Guardar Cambios"
        onClick={() => handleSave(clave, value)}
        className="mt-4 bg-primary text-white"
        loading={updateConfigMutation.isPending && updateConfigMutation.variables?.clave === clave}
        disabled={isLoadingConfigs}
      />
    </div>
  );

  return (
    <div className="sm:px">
      {isLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white mb-8">Configuraciones del Sitio</h1>

      {renderConfigSection(
        "Imágenes del Carrusel Principal",
        "carousel_principal_imagenes",
        carouselPrincipalUrls,
        setCarouselPrincipalUrls,
        "GalleryHorizontal"
      )}
      {renderConfigSection(
        "Imágenes del Carrusel Objetivo",
        "carousel_objetivo_imagenes",
        carouselObjetivoUrls,
        setCarouselObjetivoUrls,
        "GalleryThumbnails"
      )}
      {renderConfigSection(
        "Imágenes de la Galería Inicial",
        "galeria_inicial_imagenes",
        galeriaInicialUrls,
        setGaleriaInicialUrls,
        "GalleryVertical"
      )}
    </div>
  );
};

export default ConfiguracionesPage;
