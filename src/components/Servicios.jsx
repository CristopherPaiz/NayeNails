import React, { useState, useEffect, useCallback } from "react";
import { DynamicIcon } from "../utils/DynamicIcon";
import CategoryPreviewModal from "./subcomponents/CategoryPreviewModal";
import useStoreNails from "../store/store"; // Importar el store
import { CATALOGO_BASE_PATH } from "../constants/navbar"; // Para el botón del modal

const MODAL_HISTORY_STATE_ID = "categoryPreviewModalOpen";

const Servicios = () => {
  const { textosColoresConfig } = useStoreNails(); // Obtener configuraciones del store

  const servicesDataFromConfig = textosColoresConfig?.configuracion_servicios;

  const fallbackServicesData = [
    {
      id: "fallback-colores",
      icono: "Palette",
      titulo: "Colores Infinitos (Fallback)",
      descripcion:
        "Explora una paleta vibrante de varios tonos de esmalte en gel. Siempre encontrarás el color perfecto para cualquier ocasión y personalidad.",
      texto_boton_card: "Explorar Colores",
      opciones_modal: ["Rojo Pasión", "Azul Cielo", "Verde Esmeralda"],
      texto_boton_modal: "Ver Todos los Colores",
    },
    {
      id: "fallback-disenos",
      icono: "Sparkles",
      titulo: "Diseños Exclusivos (Fallback)",
      descripcion:
        "Llevamos tu creatividad a otro nivel: desde estilos minimalistas hasta arte en tendencia, personalizamos cada diseño para que tus uñas sean únicas y reflejen tu esencia.",
      texto_boton_card: "Explorar Diseños",
      opciones_modal: ["Minimalista Chic", "Floral Delicado", "Geométrico Moderno"],
      texto_boton_modal: "Ver Todos los Diseños",
    },
    {
      id: "fallback-tendencias",
      icono: "Gem",
      titulo: "Tendencias y Estilos (Fallback)",
      descripcion:
        "Nos actualizamos constantemente en las últimas tendencias y técnicas. Cambia de look cuantas veces quieras: uñas acrílicas, naturales, efectos y acabados modernos, todo para que siempre luzcas espectacular.",
      texto_boton_card: "Explorar Tendencias",
      opciones_modal: ["Uñas Acrílicas", "Gelish Duradero", "Efecto Espejo"],
      texto_boton_modal: "Ver Todas las Tendencias",
    },
  ];

  const servicesToRender = Array.isArray(servicesDataFromConfig) && servicesDataFromConfig.length > 0 ? servicesDataFromConfig : fallbackServicesData;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: "", icon: "", subcategoryNames: [], ctaButtonText: "" });

  const performCloseModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  const openModal = useCallback((service) => {
    setModalData({
      title: service.titulo,
      icon: service.icono,
      subcategoryNames: service.opciones_modal || [],
      ctaButtonText: service.texto_boton_modal || "Explorar",
    });
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
    window.history.pushState({ modalId: MODAL_HISTORY_STATE_ID }, "");
  }, []);

  const closeModal = useCallback(() => {
    if (window.history.state && window.history.state.modalId === MODAL_HISTORY_STATE_ID) {
      window.history.back();
    } else {
      performCloseModal();
    }
  }, [performCloseModal]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    const handlePopState = (event) => {
      if (isModalOpen && (!event.state || event.state.modalId !== MODAL_HISTORY_STATE_ID)) {
        performCloseModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleEsc);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isModalOpen, closeModal, performCloseModal]);

  return (
    <>
      <section className="py-8 px-4 sm:px-8 max-w-6xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-center text-white dark:text-white drop-shadow mt-10 mb-8">Nuestros Servicios Destacados</h2>
        <div className="block w-full h-[1px] bg-gray-300 dark:bg-white/20 mx-auto mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">
          {servicesToRender.map((service) => (
            <div
              key={service.id || service.titulo} // Usar service.id si existe, sino titulo como fallback key
              className="bg-background dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative w-full px-6 pt-12 pb-8 flex flex-col items-center flex-grow">
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-primary dark:bg-accent rounded-full p-3 shadow-md border-2 border-background dark:border-gray-800">
                  <DynamicIcon name={service.icono || "Sparkles"} className="size-8 text-white dark:text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary dark:text-primary-light">{service.titulo}</h3>
                <p className="text-sm text-textSecondary dark:text-gray-300 mb-6 flex-grow min-h-[60px]">{service.descripcion}</p>
                <button
                  onClick={() => openModal(service)}
                  className="cursor-pointer mt-auto w-full bg-accent dark:bg-primary hover:bg-accent-dark dark:hover:bg-primary-dark text-primary dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                >
                  {service.texto_boton_card || "Ver las opciones"}
                  <DynamicIcon name="Eye" className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoryPreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalData.title}
        icon={modalData.icon}
        subcategoryNames={modalData.subcategoryNames}
        ctaButtonText={modalData.ctaButtonText}
        // El botón del modal en CategoryPreviewModal ya redirige a CATALOGO_BASE_PATH
      />
    </>
  );
};

export default Servicios;
