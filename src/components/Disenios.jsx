
import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LightGallery from "lightgallery/react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";

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
  const navigate = useNavigate();
  const [shuffledItems, setShuffledItems] = useState([]);
  const masonryContainerRef = useRef(null);
  const masonryInstanceRef = useRef(null);

  const isLgActuallyOpen = useRef(false);
  const isClosingProcessRef = useRef(false);

  
  
  const [lightGalleryKey, setLightGalleryKey] = useState(Date.now());

  useEffect(() => {
    setShuffledItems(shuffleArray(images));
  }, [images]);

  
  
  useEffect(() => {
    if (!masonryContainerRef.current || shuffledItems.length === 0) {
      if (masonryInstanceRef.current) {
        try {
          masonryInstanceRef.current.destroy();
        } catch (e) {
          console.warn("Masonry destroy (no container/items):", e);
        }
        masonryInstanceRef.current = null;
      }
      return;
    }

    const containerElement = masonryContainerRef.current;
    
    if (masonryInstanceRef.current) {
      try {
        masonryInstanceRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying previous Masonry instance (ignorable):", e);
      }
      masonryInstanceRef.current = null; 
    }

    
    const timerId = setTimeout(() => {
      if (!containerElement) {
        
        return;
      }
      console.log("Initializing new Masonry instance");
      try {
        const msnry = new Masonry(containerElement, {
          itemSelector: ".gallery-item",
          columnWidth: ".grid-sizer",
          percentPosition: true,
          transitionDuration: 50, 
        });
        masonryInstanceRef.current = msnry;

        imagesLoaded(containerElement)
          .on("always", () => {
            if (masonryInstanceRef.current) {
              masonryInstanceRef.current.layout();
            }
          })
          .on("progress", (instance, image) => {
            if (masonryInstanceRef.current && image.isLoaded) {
              masonryInstanceRef.current.layout();
            }
          });
        
        msnry.layout();
      } catch (error) {
        console.error("Failed to initialize Masonry:", error);
      }
    }, 50); 

    return () => {
      clearTimeout(timerId);
      if (masonryInstanceRef.current) {
        try {
          masonryInstanceRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying Masonry in cleanup (ignorable):", e);
        }
        masonryInstanceRef.current = null;
      }
    };
  }, [shuffledItems, lightGalleryKey]); 

  
  useEffect(() => {
    const handleResize = () => {
      if (masonryInstanceRef.current) {
        masonryInstanceRef.current.layout();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLgAfterOpen = useCallback(() => {
    isLgActuallyOpen.current = true;
    isClosingProcessRef.current = false;
  }, []);

  const onLgBeforeClose = useCallback(() => {
    if (isClosingProcessRef.current) {
      return;
    }
    isClosingProcessRef.current = true;
    isLgActuallyOpen.current = false;

    
    
    setLightGalleryKey(Date.now());

    setTimeout(() => {
      navigate("/");
    }, 50);
  }, [navigate]);

  
  useEffect(() => {
    return () => {
      if (isLgActuallyOpen.current || document.body.style.overflow === "hidden") {
        document.body.style.overflow = "auto";
      }
    };
  }, []);

  const responsiveColWidthClass = "w-1/2 lg:w-1/4";
  const gridSizerClass = responsiveColWidthClass;
  const lightGalleryItemClass = "lg-react-item";
  const galleryItemClassName = `gallery-item ${lightGalleryItemClass} ${responsiveColWidthClass} p-1 sm:p-1.5 block align-top`;
  const finalImageClassName = "w-full h-auto block rounded shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out";

  return (
    <div className="container mx-auto px-8 sm:px-4 relative overflow-hidden max-h-[900px]">
      <h2 className="text-2xl md:text-3xl text-textPrimary font-bold text-center my-6 md:my-8">Nuestros Diseños</h2>
      <LightGallery
        key={lightGalleryKey}
        onAfterOpen={onLgAfterOpen}
        onBeforeClose={onLgBeforeClose}
        speed={100}
        backdropDuration={100}
        startAnimationDuration={50}
        zoomFromOrigin={true}
        closeOnTap={true}
        hideScrollbar={true}
        plugins={[lgThumbnail, lgZoom]}
        closable={true}
        download={false}
        selector={`.${lightGalleryItemClass}`}
        elementClassNames="lightgallery-custom-wrapper"
      >
        <div ref={masonryContainerRef} className="masonry-wrapper-internal relative -m-1 sm:-m-1.5 overflow-hidden">
          {/* Grid sizer debe estar presente para Masonry ANTES de que se inicialice */}
          <div className={`${gridSizerClass} grid-sizer p-1 sm:p-1.5`} aria-hidden="true"></div>
          {shuffledItems.map((item) => (
            <GalleryItem key={item.id} item={item} itemClassName={galleryItemClassName} imageClassName={finalImageClassName} />
          ))}
        </div>
      </LightGallery>
    </div>
  );
});

export default Disenios;
