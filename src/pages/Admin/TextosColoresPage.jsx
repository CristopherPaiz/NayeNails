import React, { useState, useEffect, useMemo } from "react";
import useStoreNails from "../../store/store";
import useApiRequest from "../../hooks/useApiRequest";
import CRInput from "../../components/UI/CRInput";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import CRAlert from "../../components/UI/CRAlert";
import { DynamicIcon } from "../../utils/DynamicIcon";
import apiClient from "../../api/axios";
import IconSelector from "./IconSelector";
import * as LucideIcons from "lucide-react";

const initialColorConfig = {
  light: {
    primary: "#ff65b2",
    secondary: "#ffbce1",
    tertiary: "#c972f4",
    accent: "#fdf2f8",
    textPrimary: "#5b535b",
    textSecondary: "#764d78",
    textTertiary: "#af9cad",
    background: "#ffffff",
    backgroundSecondary: "#f9f9f9",
  },
  dark: {
    primary: "#ff97cd",
    secondary: "#c657a6",
    tertiary: "#a259d9",
    accent: "#341f37",
    textPrimary: "#ffffff",
    textSecondary: "#eba0ea",
    textTertiary: "#bc93bb",
    background: "#3c1f38",
    backgroundSecondary: "#573850",
  },
};

const initialServicesConfig = [
  {
    id: "servicio-colores-default",
    icono: "Palette",
    titulo: "Colores Infinitos",
    descripcion:
      "Explora una paleta vibrante de varios tonos de esmalte en gel. Siempre encontrarás el color perfecto para cualquier ocasión y personalidad.",
    texto_boton_card: "Ver las opciones",
    opciones_modal: ["Rojos Pasión", "Azules Cielo", "Verdes Esmeralda", "Nudes Elegantes", "Metálicos Brillantes", "Pasteles Suaves"],
    texto_boton_modal: "Explorar Todos los Colores",
  },
  {
    id: "servicio-disenos-default",
    icono: "Sparkles",
    titulo: "Diseños Exclusivos",
    descripcion:
      "Llevamos tu creatividad a otro nivel: desde estilos minimalistas hasta arte en tendencia, personalizamos cada diseño para que tus uñas sean únicas y reflejen tu esencia.",
    texto_boton_card: "Ver las opciones",
    opciones_modal: [
      "Minimalista Chic",
      "Floral Delicado",
      "Geométrico Moderno",
      "Abstracto Artístico",
      "Brillos y Pedrería",
      "Temáticos (Bodas, Fiestas)",
    ],
    texto_boton_modal: "Explorar Todos los Servicios",
  },
  {
    id: "servicio-tendencias-default",
    icono: "Gem",
    titulo: "Tendencias y Estilos",
    descripcion:
      "Nos actualizamos constantemente en las últimas tendencias y técnicas. Cambia de look cuantas veces quieras: uñas acrílicas, naturales, efectos y acabados modernos, todo para que siempre luzcas espectacular.",
    texto_boton_card: "Ver las opciones",
    opciones_modal: ["Uñas Acrílicas", "Gelish Duradero", "Efecto Espejo", "Ombré Degradado", "Matte Sofisticado", "Diseños 3D"],
    texto_boton_modal: "Explorar Todos los Efectos",
  },
];

const deepCopy = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  }
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
};

const TextosColoresPage = () => {
  const { textosColoresConfig, fetchTextosColoresConfig, isLoadingTextosColores } = useStoreNails();

  const [formState, setFormState] = useState(() => {
    const configCopy = deepCopy(textosColoresConfig);
    const serviciosDelStore = configCopy.configuracion_servicios;
    const serviciosParaForm = Array.isArray(serviciosDelStore) && serviciosDelStore.length > 0 ? serviciosDelStore : deepCopy(initialServicesConfig);
    return {
      ...configCopy,
      configuracion_servicios: serviciosParaForm,
    };
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(textosColoresConfig.logo_negocio_url);

  const [serviceOptionsInputs, setServiceOptionsInputs] = useState({});

  const { mutate: updateConfigMutation, isLoading: isUpdating } = useApiRequest({
    url: "/textos-colores",
    method: "PUT",
    options: {
      onSuccess: (data) => {
        fetchTextosColoresConfig();
        CRAlert.alert({ title: "Éxito", message: data.message || "Configuraciones guardadas.", type: "success" });
      },
    },
  });

  const iconOptionsList = useMemo(() => {
    const isValidReactComponent = (component) =>
      component &&
      (typeof component === "function" || (typeof component === "object" && component.$$typeof && typeof component.render === "function"));

    try {
      const validIcons = [];
      const allKeys = Object.getOwnPropertyNames(LucideIcons);
      const excludeList = ["createLucideIcon", "default", "__esModule", "icons", "createElement", "Props"];

      const iconKeys = allKeys.filter((key) => !excludeList.includes(key) && !key.startsWith("_") && key[0] === key[0].toUpperCase());

      iconKeys.forEach((iconName) => {
        try {
          const IconComponent = LucideIcons[iconName];
          if (isValidReactComponent(IconComponent)) {
            validIcons.push({ label: iconName, value: iconName });
          }
        } catch (error) {
          console.log("Error al procesar icono:", iconName, error);
          // Silenciar
        }
      });
      validIcons.sort((a, b) => a.label.localeCompare(b.label));
      return validIcons;
    } catch (error) {
      console.error("Error al cargar lista de iconos Lucide:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const configCopy = deepCopy(textosColoresConfig);
    const serviciosDelStore = configCopy.configuracion_servicios;
    const serviciosParaForm = Array.isArray(serviciosDelStore) && serviciosDelStore.length > 0 ? serviciosDelStore : deepCopy(initialServicesConfig);

    setFormState({
      ...configCopy,
      configuracion_servicios: serviciosParaForm,
    });
    setLogoPreview(configCopy.logo_negocio_url);
  }, [textosColoresConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (theme, key, value) => {
    setFormState((prev) => ({
      ...prev,
      configuracion_colores: {
        ...deepCopy(prev.configuracion_colores || initialColorConfig),
        [theme]: {
          ...deepCopy(prev.configuracion_colores?.[theme] || initialColorConfig[theme]),
          [key]: value,
        },
      },
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const currentServices = deepCopy(formState.configuracion_servicios || []);
    if (currentServices[index]) {
      currentServices[index] = { ...currentServices[index], [field]: value };
      setFormState((prev) => ({ ...prev, configuracion_servicios: currentServices }));
    }
  };

  const handleServiceOptionInputChange = (serviceIndex, value) => {
    setServiceOptionsInputs((prev) => ({
      ...prev,
      [serviceIndex]: value,
    }));
  };

  const handleAddServiceOption = (index) => {
    const inputValue = serviceOptionsInputs[index] || "";
    if (!inputValue.trim()) return;

    const optionsToAdd = inputValue
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean);
    if (optionsToAdd.length === 0) return;

    const currentServices = deepCopy(formState.configuracion_servicios || []);
    const service = currentServices[index];
    if (!service) return;

    const currentOptions = service.opciones_modal || [];

    if (currentOptions.length + optionsToAdd.length > 20) {
      CRAlert.alert({ title: "Límite Excedido", message: "Un servicio no puede tener más de 20 opciones.", type: "warning" });
      return;
    }
    const newOptions = [...currentOptions, ...optionsToAdd];
    handleServiceChange(index, "opciones_modal", newOptions);

    setServiceOptionsInputs((prev) => ({
      ...prev,
      [index]: "",
    }));
  };

  const handleRemoveServiceOption = (serviceIndex, optionIndex) => {
    const currentServices = deepCopy(formState.configuracion_servicios || []);
    const service = currentServices[serviceIndex];

    if (!service || !Array.isArray(service.opciones_modal)) {
      return;
    }

    const newOptions = service.opciones_modal.filter((_, i) => i !== optionIndex);
    handleServiceChange(serviceIndex, "opciones_modal", newOptions);
  };

  const addNewService = (e) => {
    e.preventDefault();
    const newService = {
      id: `servicio-nuevo-${Date.now()}`,
      icono: "Sparkle",
      titulo: "Nuevo Servicio",
      descripcion: "Descripción del nuevo servicio.",
      texto_boton_card: "Ver Detalles",
      opciones_modal: ["Opción A", "Opción B", "Opción C"],
      texto_boton_modal: "Explorar Servicio",
    };
    const updatedServices = [...deepCopy(formState.configuracion_servicios || []), newService];
    setFormState((prev) => ({ ...prev, configuracion_servicios: updatedServices }));
  };

  const removeService = (indexToRemove, e) => {
    e.preventDefault();
    const currentServices = deepCopy(formState.configuracion_servicios || []);
    const updatedServices = currentServices.filter((_, i) => i !== indexToRemove);
    setFormState((prev) => ({ ...prev, configuracion_servicios: updatedServices }));

    setServiceOptionsInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[indexToRemove];
      return newInputs;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSubmit = deepCopy(formState);

    if (logoFile) {
      const formData = new FormData();
      formData.append("site_image", logoFile);
      try {
        const res = await apiClient.post("/site-uploads/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        dataToSubmit.logo_negocio_url = res.data.imageData.secure_url;
        setLogoFile(null);
      } catch (error) {
        CRAlert.alert({ title: "Error Subiendo Logo", message: error.response?.data?.message || "No se pudo subir el logo.", type: "error" });
        return;
      }
    }

    if (dataToSubmit.configuracion_servicios) {
      for (const service of dataToSubmit.configuracion_servicios) {
        if (!service.id) {
          service.id = `servicio-guardado-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        }
        if (service.opciones_modal && (service.opciones_modal.length < 3 || service.opciones_modal.length > 20)) {
          CRAlert.alert({
            title: "Validación Fallida",
            message: `El servicio "${service.titulo}" debe tener entre 3 y 20 opciones en el modal. Actualmente tiene ${service.opciones_modal.length}.`,
            type: "error",
          });
          return;
        }
      }
    }

    updateConfigMutation(dataToSubmit);
  };

  if (isLoadingTextosColores && !formState.nombre_negocio) {
    return <CRLoader text="Cargando configuraciones..." fullScreen={false} style="circle" size="lg" />;
  }

  const colorFields = [
    { key: "primary", label: "Primario" },
    { key: "secondary", label: "Secundario" },
    { key: "tertiary", label: "Terciario" },
    { key: "accent", label: "Acento" },
    { key: "textPrimary", label: "Texto Primario" },
    { key: "textSecondary", label: "Texto Secundario" },
    { key: "textTertiary", label: "Texto Terciario" },
    { key: "background", label: "Fondo" },
    { key: "backgroundSecondary", label: "Fondo Secundario" },
  ];

  const servicesToDisplay = formState.configuracion_servicios || [];

  return (
    <div className="container mx-auto p-4">
      {isUpdating && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-4 flex items-center">
            <DynamicIcon name="Type" className="w-6 h-6 mr-2 text-primary" />
            Textos Generales del Sitio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CRInput
              title="Nombre del Negocio"
              name="nombre_negocio"
              value={formState.nombre_negocio || ""}
              setValue={(value) => handleInputChange({ target: { name: "nombre_negocio", value } })}
            />
            <CRInput
              title="Slogan del Negocio"
              name="slogan_negocio"
              value={formState.slogan_negocio || ""}
              setValue={(value) => handleInputChange({ target: { name: "slogan_negocio", value } })}
            />
            <CRInput
              title="Texto Carrusel Secundario (Home)"
              name="texto_carrusel_secundario"
              type="textarea"
              value={formState.texto_carrusel_secundario || ""}
              setValue={(value) => handleInputChange({ target: { name: "texto_carrusel_secundario", value } })}
            />
            <CRInput
              title="Dirección Unificada"
              name="texto_direccion_unificado"
              value={formState.texto_direccion_unificado || ""}
              setValue={(value) => handleInputChange({ target: { name: "texto_direccion_unificado", value } })}
            />
            <CRInput
              title="Teléfono Unificado"
              name="telefono_unificado"
              value={formState.telefono_unificado || ""}
              setValue={(value) => handleInputChange({ target: { name: "telefono_unificado", value } })}
            />
            <CRInput
              title="URL Facebook"
              name="url_facebook"
              value={formState.url_facebook || ""}
              setValue={(value) => handleInputChange({ target: { name: "url_facebook", value } })}
            />
            <CRInput
              title="Coordenadas Mapa (Lat,Lng)"
              name="coordenadas_mapa"
              value={formState.coordenadas_mapa || ""}
              setValue={(value) => handleInputChange({ target: { name: "coordenadas_mapa", value } })}
            />
            <CRInput
              title="Horario del Negocio"
              name="horario_negocio"
              type="textarea"
              rows={3}
              value={formState.horario_negocio || ""}
              setValue={(value) => handleInputChange({ target: { name: "horario_negocio", value } })}
              placeholder="Ej: Lunes a Viernes: 9 AM - 6 PM, Sábados: 9 AM - 2 PM"
            />
            <div>
              <label className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">Logo del Negocio</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {logoPreview && <img src={logoPreview} alt="Vista previa del logo" className="mt-2 max-h-20 rounded border" />}
              <CRInput
                title="URL del Logo (si no subes archivo)"
                name="logo_negocio_url"
                value={formState.logo_negocio_url || ""}
                setValue={(value) => handleInputChange({ target: { name: "logo_negocio_url", value } })}
                placeholder="Dejar vacío si subes archivo"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-4 flex items-center">
            <DynamicIcon name="Palette" className="w-6 h-6 mr-2 text-primary" />
            Configuración de Colores
          </h2>
          {["light", "dark"].map((theme) => (
            <div key={theme} className="mb-6">
              <h3 className="text-lg font-medium text-textSecondary dark:text-slate-300 mb-3 capitalize">
                {theme === "light" ? "Tema Claro" : "Tema Oscuro"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-4">
                {colorFields.map((field) => (
                  <div key={`${theme}-${field.key}`}>
                    <label className="block text-sm text-textTertiary dark:text-slate-400 mb-1">{field.label}</label>
                    <input
                      type="color"
                      value={formState.configuracion_colores?.[theme]?.[field.key] || initialColorConfig[theme][field.key]}
                      onChange={(e) => handleColorChange(theme, field.key, e.target.value)}
                      className="w-full h-10 p-1 border border-gray-300 dark:border-slate-600 rounded-md cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-white flex items-center">
              <DynamicIcon name="ListChecks" className="w-6 h-6 mr-2 text-primary" />
              Configuración de Servicios (Home)
            </h2>
            <button
              type="button"
              onClick={addNewService}
              className="bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 px-3 rounded-md flex items-center gap-2 transition-colors"
            >
              <DynamicIcon name="Plus" className="w-4 h-4" />
              Añadir Servicio
            </button>
          </div>
          <div className="space-y-6">
            {servicesToDisplay.map((service, serviceIdx) => (
              <div key={service.id || `service-idx-${serviceIdx}`} className="border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-textSecondary dark:text-slate-300 mb-3">
                  Servicio #{serviceIdx + 1}: {service.titulo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IconSelector
                    allIconOptions={iconOptionsList}
                    selectedIcon={service.icono || ""}
                    onSelectIcon={(iconName) => handleServiceChange(serviceIdx, "icono", iconName)}
                    label="Icono del Servicio"
                  />

                  <CRInput title="Título del Card" value={service.titulo || ""} setValue={(val) => handleServiceChange(serviceIdx, "titulo", val)} />
                  <CRInput
                    title="Descripción del Card"
                    type="textarea"
                    value={service.descripcion || ""}
                    setValue={(val) => handleServiceChange(serviceIdx, "descripcion", val)}
                  />
                  <CRInput
                    title="Texto Botón del Card"
                    value={service.texto_boton_card || ""}
                    setValue={(val) => handleServiceChange(serviceIdx, "texto_boton_card", val)}
                  />
                  <CRInput
                    title="Texto Botón del Modal"
                    value={service.texto_boton_modal || ""}
                    setValue={(val) => handleServiceChange(serviceIdx, "texto_boton_modal", val)}
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">
                      Opciones del Modal (chips, separadas por coma)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Opción1,Opción2,..."
                        value={serviceOptionsInputs[serviceIdx] || ""}
                        onChange={(e) => handleServiceOptionInputChange(serviceIdx, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-textPrimary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddServiceOption(serviceIdx)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-2.5 rounded-md transition-colors"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(service.opciones_modal || []).map((opt, optIdx) => (
                        <span
                          key={`${service.id || serviceIdx}-opt-${optIdx}`}
                          className="bg-secondary text-textPrimary dark:bg-accent dark:text-primary-light px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceOption(serviceIdx, optIdx)}
                            className="ml-1.5 text-red-500 hover:text-red-700"
                          >
                            <DynamicIcon name="X" className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    {service.opciones_modal && service.opciones_modal.length < 3 && (
                      <p className="text-xs text-red-500 mt-1">Debe haber al menos 3 opciones (se validará al guardar).</p>
                    )}
                    {service.opciones_modal && service.opciones_modal.length > 20 && (
                      <p className="text-xs text-red-500 mt-1">No puede haber más de 20 opciones (se validará al guardar).</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeService(serviceIdx, e)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2.5 rounded-md flex items-center gap-1 transition-colors"
                >
                  <DynamicIcon name="Trash2" className="w-3 h-3" />
                  Eliminar Servicio
                </button>
              </div>
            ))}
          </div>
        </div>

        <CRButton
          type="submit"
          title="Guardar Todas las Configuraciones"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base"
          loading={isUpdating}
        />
      </form>
    </div>
  );
};

export default TextosColoresPage;
