import React from "react";
import { DynamicIcon } from "../utils/DynamicIcon";

const services = [
  {
    icon: "Palette",
    title: "Colores Infinitos",
    description:
      "Explora una paleta vibrante de varios tonos de esmalte en gel. Siempre encontrarás el color perfecto para cualquier ocasión y personalidad.",
  },
  {
    icon: "Sparkles",
    title: "Diseños Exclusivos",
    description:
      "Llevamos tu creatividad a otro nivel: desde estilos minimalistas hasta arte en tendencia, personalizamos cada diseño para que tus uñas sean únicas y reflejen tu esencia.",
  },
  {
    icon: "Gem",
    title: "Tendencias y Estilos",
    description:
      "Nos actualizamos constantemente en las últimas tendencias y técnicas. Cambia de look cuantas veces quieras: uñas acrílicas, naturales, efectos y acabados modernos, todo para que siempre luzcas espectacular.",
  },
];

const Servicios = () => {
  return (
    <section className="py-8 px-8 max-w-6xl mx-auto mb-24">
      <h2 className="text-2xl font-bold text-center text-white drop-shadow mt-10 mb-8">Nuestros Servicios</h2>
      {/* DIVIDER  */}
      <div className="block w-full h-[1px] bg-white/20 mx-auto mb-14" />
      <div className="flex flex-col md:flex-row md:flex-wrap gap-10 md:gap-8">
        {services.map((service, idx) => (
          <React.Fragment key={service.title}>
            <div className="hover:scale-105 transition-transform ease-in hover:cursor-default relative bg-white/80 dark:bg-white/20 rounded-xl shadow-lg px-6 py-4 flex flex-col items-center text-center flex-1 md:w-[22%] md:min-w-[calc(25%-2rem)] md:mx-2 min-h-52 sm:min-h-72">
              <div className="absolute -top-7 left-1/2 border border-white/80 -translate-x-1/2 bg-primary dark:bg-background rounded-full p-2 shadow-md">
                <DynamicIcon name={service.icon} className="size-10 text-white" />
              </div>
              <div className="flex-1 flex flex-col justify-center w-full">
                <h3 className="text-lg font-semibold mb-2 text-primary">{service.title}</h3>
                <p className="text-textPrimary">{service.description}</p>
              </div>
            </div>
            {idx < services.length - 1 && (
              <>
                <div className="block md:hidden w-24 h-1 bg-pink-200 rounded-full mx-auto my-2 -mt-1" />
                {(idx + 1) % 4 !== 3 && <div className="hidden md:block w-1 h-24 bg-pink-200 rounded-full mx-4 my-auto" />}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Servicios;
