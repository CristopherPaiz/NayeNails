// /src/components/ContentSection.jsx
import { useRef, useState, useEffect } from "react";
import ScrollArrow from "./subcomponents/ScrollArrow";
import Servicios from "./Servicios";
import Disenios from "./Disenios";
import Objetivo from "./Objetivo";
import useStoreNails from "../store/store";
import Intermedio from "./Intermedio";
import Ubicacion from "./Ubicacion";
import AgendaContacto from "./AgendaContacto";

const ContentSection = () => {
  const { imagenesGaleria } = useStoreNails();
  const [showArrowServicios, setShowArrowServicios] = useState(true);
  const serviciosRef = useRef(null);

  useEffect(() => {
    const observerCallback = ([entry]) => {
      const shouldShow = !entry.isIntersecting;
      setShowArrowServicios((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.1 });
    const currentRef = serviciosRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative z-20">
      {/* DIV VACIO DEJAR VER EL CARUSEL */}
      <div className="h-screen pt-16 sm:pt-24 mt-2 sm:mt-9 flex justify-center items-center"></div>

      {/* DIV DE SERVICIOS */}
      <div ref={serviciosRef} className="w-full bg-primary dark:bg-background flex flex-col justify-center items-center relative">
        <ScrollArrow showArrow={showArrowServicios} bg="bg-primary" bgDark="dark:bg-background" icon="Star" />
        <Servicios />
      </div>

      {/* DIV DE GALERIA */}
      <div className="w-full bg-background dark:bg-primary flex flex-col justify-center items-center relative py-10">
        <ScrollArrow showArrow={false} bg="bg-background" bgDark="dark:bg-primary" icon="Sparkle" color="text-textPrimary dark:text-textPrimary" />
        <Disenios images={imagenesGaleria} />
      </div>

      {/* DIV DE INTERMEDIO */}
      <Intermedio />

      {/* DIV DE OBJETIVO */}
      <div className="w-full bg-transparent dark:bg-transparent flex flex-col justify-center items-center relative">
        <Objetivo />
      </div>

      {/* DIV DE UBICACION */}
      <div className="w-full bg-background dark:bg-background flex flex-col justify-center items-center relative py-10">
        <ScrollArrow showArrow={false} bg="bg-background" bgDark="dark:bg-background" icon="House" color="text-primary dark:text-textPrimary" />
        <Ubicacion />
      </div>
      {/* DIV DE UBICACION */}
      <div className="w-full bg-background dark:bg-background flex flex-col justify-center items-center relative py-10">
        <ScrollArrow showArrow={false} bg="bg-background" bgDark="dark:bg-background" icon="Calendar" color="text-primary dark:text-textPrimary" />
        <AgendaContacto />
      </div>
    </div>
  );
};

export default ContentSection;
