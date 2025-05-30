import React from "react";
import useStoreNails from "../store/store";
import CRCarousel from "./UI/CRCarousel";

const Objetivo = () => {
  const { imagenesCarouselSecundario, textosColoresConfig } = useStoreNails();
  const textoCarrusel =
    textosColoresConfig?.texto_carrusel_secundario || "El compromiso principal es satisfacer las necesidades de nuestras clientas.";

  return (
    <div
      className="w-full bg-fixed bg-center bg-cover relative"
      style={{
        height: "300px",
        maxHeight: "300px",
      }}
    >
      <CRCarousel
        transitionMode="blur"
        interval={5000}
        data={imagenesCarouselSecundario}
        showIndicator={false}
        widthPercentage={100}
        height={300}
        contentFit="cover"
      />
      <div className="absolute inset-0 bg-black/70">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.1) 1px,
              transparent 2px,
              transparent 7px
            )`,
          }}
        ></div>

        <div className="absolute inset-0 flex justify-center items-center text-white">
          <section className="text-center w-4/5 sm:w-2/12 text-pretty">
            <p className="text-white dark:text-textPrimary text-2xl">{textoCarrusel}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Objetivo;
