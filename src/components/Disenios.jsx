// src/components/Disenios.jsx
import React, { useEffect, useState, useRef, memo } from "react";
import LightGallery from "lightgallery/react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";
import { Link } from "react-router-dom";

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
  const [shuffledItems, setShuffledItems] = useState([]);
  const masonryContainerRef = useRef(null);
  const masonryInstanceRef = useRef(null);

  useEffect(() => {
    setShuffledItems(shuffleArray(images));
  }, [images]);

  useEffect(() => {
    if (!masonryContainerRef.current || shuffledItems.length === 0) {
      if (masonryInstanceRef.current) {
        masonryInstanceRef.current.destroy();
        masonryInstanceRef.current = null;
      }
      return;
    }

    const containerElement = masonryContainerRef.current;
    let msnry;

    const timerId = setTimeout(() => {
      if (!containerElement) return;

      if (masonryInstanceRef.current) {
        masonryInstanceRef.current.destroy();
      }

      try {
        msnry = new Masonry(containerElement, {
          itemSelector: ".gallery-item",
          columnWidth: ".grid-sizer",
          percentPosition: true,
          transitionDuration: 0,
        });
        masonryInstanceRef.current = msnry;

        imagesLoaded(containerElement).on("always", () => {
          if (masonryInstanceRef.current) {
            masonryInstanceRef.current.layout();
          }
        });

        msnry.layout();
      } catch (error) {
        console.error("Failed to initialize Masonry:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (masonryInstanceRef.current) {
        masonryInstanceRef.current.destroy();
        masonryInstanceRef.current = null;
      }
    };
  }, [shuffledItems]);

  useEffect(() => {
    const handleResize = () => {
      if (masonryInstanceRef.current) {
        masonryInstanceRef.current.layout();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        speed={0}
        backdropDuration={0}
        startAnimationDuration={0}
        zoomFromOrigin={false}
        closeOnTap={true}
        plugins={[lgThumbnail, lgZoom]}
        closable={true}
        download={false}
        selector={`.${lightGalleryItemClass}`}
        elementClassNames="lightgallery-custom-wrapper"
        isMobile={true}
      >
        <div ref={masonryContainerRef} className="masonry-wrapper-internal relative -m-1 sm:-m-1.5 overflow-hidden">
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
