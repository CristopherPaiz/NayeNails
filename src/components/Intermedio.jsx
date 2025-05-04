import React from "react";

const Intermedio = ({ to = "/nails", buttonColor = "bg-primary text-white dark:bg-white dark:text-primary" }) => {
  const mobileFadeHeight = "h-[150px]";
  const desktopFadeHeight = "sm:h-[150px]";

  return (
    <div className="relative z-10 flex flex-col justify-center items-center -mt-8" aria-hidden="true">
      {/* Degradado superior - usando el sistema de gradientes de Tailwind */}
      <div
        className={`
          absolute top-0 left-0 right-0
          ${mobileFadeHeight} ${desktopFadeHeight}
          bg-gradient-to-b from-background from-0% via-background via-50% to-transparent to-100%
          dark:from-primary dark:from-0% dark:via-primary dark:via-50% dark:to-transparent dark:to-100%
          pointer-events-none
        `}
      ></div>

      {/* Botón centrado */}
      <a
        href={to}
        className={`w-1/2 sm:w-1/3
          z-20
          pointer-events-auto cursor-pointer
          ${buttonColor}
          px-5 py-3 rounded-full shadow-md
          hover:opacity-80 transition-opacity duration-200 text-sm text-center
        `}
      >
        Ver más
      </a>

      {/* Degradado inferior */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          ${mobileFadeHeight} ${desktopFadeHeight}
          bg-gradient-to-t from-background from-0% via-background via-50% to-transparent to-100%
          dark:from-primary dark:from-0% dark:via-primary dark:via-50% dark:to-transparent dark:to-100%
          pointer-events-none
        `}
      ></div>
    </div>
  );
};

export default Intermedio;
