// src/components/Servicios.jsx
import React, { useState, useEffect, useCallback } from "react"; // Añadido useCallback
import { DynamicIcon } from "../utils/DynamicIcon";
import { NAV_ITEMS } from "../constants/navbar";
import CategoryPreviewModal from "./subcomponents/CategoryPreviewModal";

const servicesData = [
  {
    icon: "Palette",
    title: "Colores Infinitos",
    description:
      "Explora una paleta vibrante de varios tonos de esmalte en gel. Siempre encontrarás el color perfecto para cualquier ocasión y personalidad.",
    navItemsKey: "Colores",
    ctaButtonText: "Explorar Todos los Colores",
  },
  {
    icon: "Sparkles",
    title: "Diseños Exclusivos",
    description:
      "Llevamos tu creatividad a otro nivel: desde estilos minimalistas hasta arte en tendencia, personalizamos cada diseño para que tus uñas sean únicas y reflejen tu esencia.",
    navItemsKey: "Servicios",
    ctaButtonText: "Explorar Todos los Servicios",
  },
  {
    icon: "Gem",
    title: "Tendencias y Estilos",
    description:
      "Nos actualizamos constantemente en las últimas tendencias y técnicas. Cambia de look cuantas veces quieras: uñas acrílicas, naturales, efectos y acabados modernos, todo para que siempre luzcas espectacular.",
    navItemsKey: "Efectos",
    ctaButtonText: "Explorar Todos los Efectos",
  },
];

const Servicios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: "", icon: "", subcategoryNames: [], ctaButtonText: "" });

  const openModal = useCallback((service) => {
    const navCategory = NAV_ITEMS[service.navItemsKey];
    const subcategories = navCategory && navCategory.categorías ? navCategory.categorías.map((sub) => sub.nombre) : [];

    setModalData({
      title: service.title,
      icon: service.icon,
      subcategoryNames: subcategories,
      ctaButtonText: service.ctaButtonText,
    });
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []); // No tiene dependencias que cambien

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") closeModal();
    };
    if (isModalOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen, closeModal]);

  return (
    <>
      <section className="py-8 px-4 sm:px-8 max-w-6xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-center text-white dark:text-white drop-shadow mt-10 mb-8">Nuestros Servicios Destacados</h2>
        <div className="block w-full h-[1px] bg-gray-300 dark:bg-white/20 mx-auto mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8">
          {servicesData.map((service) => (
            <div
              key={service.title}
              className="bg-background dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative w-full px-6 pt-12 pb-8 flex flex-col items-center flex-grow">
                {/* Aumentado pt y pb */}
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-primary dark:bg-accent rounded-full p-3 shadow-md border-2 border-background dark:border-gray-800">
                  <DynamicIcon name={service.icon} className="size-8 text-white dark:text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-primary dark:text-primary-light">{service.title}</h3>
                <p className="text-sm text-textSecondary dark:text-gray-300 mb-6 flex-grow min-h-[60px]">{service.description}</p>{" "}
                {/* min-h para igualar alturas */}
                <button
                  onClick={() => openModal(service)}
                  className="cursor-pointer mt-auto w-full bg-accent dark:bg-primary hover:bg-accent-dark dark:hover:bg-primary-dark text-primary dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center"
                >
                  Ver las opciones
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
      />
    </>
  );
};

export default Servicios;
