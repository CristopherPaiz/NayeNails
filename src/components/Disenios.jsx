import React, { useEffect, useState, useRef, memo } from "react";
import LightGallery from "lightgallery/react";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";

import GalleryItem from "./subcomponents/GalleryItem";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

const mobileFadeHeight = "h-[250px]";
const desktopFadeHeight = "sm:h-[600px]";

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
    <div className="container mx-auto px-2 sm:px-4 relative">
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
        <div ref={masonryContainerRef} className="masonry-wrapper-internal relative -m-1 sm:-m-1.5">
          <div className={`${gridSizerClass} grid-sizer p-1 sm:p-1.5`} aria-hidden="true"></div>
          {shuffledItems.map((item) => (
            <GalleryItem key={item.id} item={item} itemClassName={galleryItemClassName} imageClassName={finalImageClassName} />
          ))}
        </div>
      </LightGallery>

      <div
        className={`
          absolute -bottom-3 left-0 right-0 z-10
          ${mobileFadeHeight} ${desktopFadeHeight}
          bg-gradient-to-t from-background via-background to-transparent
          dark:from-primary dark:via-primary dark:to-transparent
          pointer-events-none
        `}
        aria-hidden="true"
      >
        <button
          className={`w-1/2 sm:w-1/3
            absolute z-20 bottom-16 sm:bottom-36 left-1/2 -translate-x-1/2
            pointer-events-auto cursor-pointer
            bg-primary text-white dark:bg-white dark:text-primary
            px-5 py-3 rounded-full shadow-md
            hover:opacity-80 transition-opacity duration-200 text-sm
          `}
          onClick={() => {
            window.location.href = "/nails";
          }}
        >
          Ver más
        </button>
      </div>
    </div>
  );
});
export default Disenios;
