import React from "react";

const Intermedio = ({ to = "/nails", buttonColor = "bg-primary text-white dark:bg-white dark:text-primary" }) => {
  const mobileFadeHeight = "h-[300px]";
  const desktopFadeHeight = "sm:h-[350px]";

  return (
    <div className="relative z-10 flex flex-col justify-center items-center" aria-hidden="true">
      <div
        className={`
                    absolute bottom-0 left-0 right-0
                    ${mobileFadeHeight} ${desktopFadeHeight}
                    bg-gradient-to-t from-background via-background to-transparent
                    dark:from-primary dark:via-primary dark:to-transparent
                    pointer-events-none
                `}
      ></div>
      <a
        href={to}
        className={`w-1/2 sm:w-1/3
                    z-20
                    pointer-events-auto cursor-pointer
                    ${buttonColor}
                    px-5 py-3 rounded-full shadow-md
                    hover:opacity-80 transition-opacity duration-200 text-sm text-center
                    mb-10
                `}
      >
        Ver más
      </a>
    </div>
  );
};

export default Intermedio;
