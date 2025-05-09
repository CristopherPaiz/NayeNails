// src/components/Disenios.jsx
import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import LightGallery from "lightgallery/react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";

// GalleryItem se usa, así que asegúrate que la importación sea correcta
import GalleryItem from "./subcomponents/GalleryItem";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

const shuffleArray = (array) => {
  const newArray = [...array];
  let currentIndex = newArray.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const Disenios = memo(({ images = [] }) => {
  const navigate = useNavigate(); // Hook de React Router
  const [shuffledItems, setShuffledItems] = useState([]);
  const masonryContainerRef = useRef(null);
  const masonryInstanceRef = useRef(null);
  // No necesitamos lightGalleryApiRef si no vamos a llamar a .closeGallery() programáticamente
  // const lightGalleryApiRef = useRef(null);
  const [isLightGalleryOpen, setIsLightGalleryOpen] = useState(false);

  useEffect(() => {
    setShuffledItems(shuffleArray(images));
  }, [images]);

  // Efecto para Masonry (igual que tu original)
  useEffect(() => {
    if (!masonryContainerRef.current || shuffledItems.length === 0) {
      if (masonryInstanceRef.current) {
        try {
          masonryInstanceRef.current.destroy();
        } catch (e) {
          /* ignorable */
        }
        masonryInstanceRef.current = null;
      }
      return;
    }
    const containerElement = masonryContainerRef.current;
    let msnry;
    const timerId = setTimeout(() => {
      if (!containerElement) return;
      if (masonryInstanceRef.current) {
        try {
          masonryInstanceRef.current.destroy();
        } catch (e) {
          /* ignorable */
        }
      }
      try {
        msnry = new Masonry(containerElement, {
          itemSelector: ".gallery-item",
          columnWidth: ".grid-sizer",
          percentPosition: true,
          transitionDuration: 0, // Como en tu original
        });
        masonryInstanceRef.current = msnry;
        imagesLoaded(containerElement).on("always", () => {
          if (masonryInstanceRef.current) masonryInstanceRef.current.layout();
        });
        msnry.layout();
      } catch (error) {
        console.error("Failed to initialize Masonry:", error);
      }
    }, 100); // Como en tu original
    return () => {
      clearTimeout(timerId);
      if (masonryInstanceRef.current) {
        try {
          masonryInstanceRef.current.destroy();
        } catch (e) {
          /* ignorable */
        }
        masonryInstanceRef.current = null;
      }
    };
  }, [shuffledItems]);

  // Efecto para el resize de Masonry (igual que tu original)
  useEffect(() => {
    const handleResize = () => {
      if (masonryInstanceRef.current) masonryInstanceRef.current.layout();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Callbacks de LightGallery
  // onLgInit no es estrictamente necesario si no usamos la API de LG, pero no hace daño tenerla.
  // const onLgInit = useCallback((detail) => {
  //   if (detail && detail.instance) lightGalleryApiRef.current = detail.instance;
  // }, []);

  const onLgAfterOpen = useCallback(() => {
    setIsLightGalleryOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const onLgBeforeClose = useCallback(() => {
    navigate("/");
    setIsLightGalleryOpen(false);
    document.body.style.overflow = "auto";
  }, [navigate]);

  // Limpieza si el componente se desmonta con la galería abierta
  useEffect(() => {
    return () => {
      if (isLightGalleryOpen) {
        document.body.style.overflow = "auto";
      }
    };
  }, [isLightGalleryOpen]);

  const responsiveColWidthClass = "w-1/2 lg:w-1/4";
  const gridSizerClass = responsiveColWidthClass;
  const lightGalleryItemClass = "lg-react-item"; // Clase que LightGallery usa para encontrar items
  // Clases para tus items, como las tenías
  const galleryItemClassName = `gallery-item ${lightGalleryItemClass} ${responsiveColWidthClass} p-1 sm:p-1.5 block align-top`;
  const finalImageClassName = "w-full h-auto block rounded shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out";

  return (
    <div className="container mx-auto px-8 sm:px-4 relative overflow-hidden max-h-[900px]">
      <h2 className="text-2xl md:text-3xl text-textPrimary font-bold text-center my-6 md:my-8">Nuestros Diseños</h2>

      <LightGallery
        // onInit={onLgInit} // Opcional
        onAfterOpen={onLgAfterOpen}
        onBeforeClose={onLgBeforeClose}
        // Configuración de LightGallery como en tu versión original para apertura inmediata
        speed={0}
        backdropDuration={0}
        startAnimationDuration={0}
        zoomFromOrigin={false} // Como lo tenías
        closeOnTap={true} // Como lo tenías
        plugins={[lgThumbnail, lgZoom]}
        closable={true}
        download={false}
        selector={`.${lightGalleryItemClass}`}
        elementClassNames="lightgallery-custom-wrapper" // Como lo tenías
        // isMobile={true} // LightGallery suele detectar esto. Puedes mantenerlo si prefieres.
      >
        {/* Estructura de Masonry como en tu original */}
        <div ref={masonryContainerRef} className="masonry-wrapper-internal relative -m-1 sm:-m-1.5 overflow-hidden">
          <div className={`${gridSizerClass} grid-sizer p-1 sm:p-1.5`} aria-hidden="true"></div>
          {shuffledItems.map((item) => (
            <GalleryItem
              key={item.id}
              item={item}
              itemClassName={galleryItemClassName} // Usando tu clase original
              imageClassName={finalImageClassName} // Usando tu clase original
            />
          ))}
        </div>
      </LightGallery>
    </div>
  );
});

export default Disenios;
