import React, { useState } from "react";
import ParallaxTilt from "react-parallax-tilt";
import { DynamicIcon } from "../../utils/DynamicIcon";
import fondoFront from "/fondoFidelidadFront.webp";
import fondoBack from "/fondoFidelidadBack.webp";

const HolographicLoyaltyCard = ({
  nombreCliente,
  visitas = 0,
  logoUrl,
  isInteractive = true,
  onSlotClick,
  canjeDisponible = false,
  ciclosCompletados = 0,
  showCycles = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleCardClick = (e) => {
    if (e.target.closest(".interactive-slot") && onSlotClick) {
      return;
    }
    if (isInteractive) {
      setIsFlipped((prev) => !prev);
    }
  };

  const handleTouchStart = () => {
    if (isInteractive) setIsPressed(true);
  };

  const handleTouchEnd = () => {
    if (isInteractive) setIsPressed(false);
  };

  const visitasNecesarias = 4;

  return (
    <>
      <style>{`
        .card-container {
          perspective: 2000px;
        }
        .tilt-wrapper {
          width: 100%;
          height: auto; /* Altura automática para mantener el aspect ratio */
          aspect-ratio: 1080 / 608; /* Aspect ratio de las nuevas imágenes */
          transform-style: preserve-3d;
          position: relative;
        }
        .card-flipper {
          position: absolute;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 1.25rem; /* Borde más redondeado */
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          background-size: cover;
          background-position: center;
        }
        .card-face--front {
          background-image: url(${fondoFront});
        }
        .card-face--back {
          background-image: url(${fondoBack});
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .holographic-overlay {
          position: absolute;
          inset: -100%;
          background-image: conic-gradient(from 90deg at 40% -25%,#ffc4e8, #dab5ff, #b5dfff, #ffafc4, #ffc4e8); /* Colores más suaves */
          animation: spin 5s linear infinite;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          transform: scale(2);
        }
        .tilt-wrapper:hover .holographic-overlay,
        .tilt-wrapper.is-pressed .holographic-overlay {
          opacity: 0.15; /* Opacidad ajustada */
        }
        @keyframes spin {
          100% { transform: scale(2) rotate(360deg); }
        }
      `}</style>
      <div className="card-container w-full max-w-lg mx-auto">
        <div
          className={`tilt-wrapper ${isPressed ? "is-pressed" : ""}`}
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ParallaxTilt
            tiltEnable={isInteractive}
            glareEnable={isInteractive}
            glareMaxOpacity={1}
            glareColor="#ffffff"
            glarePosition="all"
            glareBorderRadius="1.25rem"
            scale={isInteractive ? 1.05 : 1}
            perspective={1200}
            transitionSpeed={1000}
            gyroscope={false}
            style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
          >
            <div className="card-flipper cursor-default" style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <div className="card-face card-face--front p-5 sm:p-6 flex flex-col justify-center items-center gap-y-4 sm:gap-y-6">
                {isInteractive && <div className="holographic-overlay"></div>}

                <div style={{ transform: "translateZ(30px)" }} className="relative z-10 text-center font-serif text-stone-800 mt-8 ">
                  <p className="font-semibold text-[clamp(0.8rem,3vw,1.1rem)] leading-tight text-amber-900">Al completar 4 citas</p>
                  <p className="font-semibold text-[clamp(0.8rem,3vw,1.1rem)] leading-tight text-amber-900">
                    consecutivas, obtén el <span className="font-extrabold">50% </span>de
                  </p>
                  <p className="font-semibold text-[clamp(0.8rem,3vw,1.1rem)] leading-tight text-amber-900">descuento en tu quinta cita</p>
                </div>

                <div style={{ transform: "translateZ(50px)" }} className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 w-full">
                  {Array.from({ length: visitasNecesarias }).map((_, index) => (
                    <div
                      key={index}
                      onClick={
                        onSlotClick
                          ? (e) => {
                              e.stopPropagation();
                              onSlotClick(index);
                            }
                          : undefined
                      }
                      className={`interactive-slot w-[12%] aspect-square flex items-center justify-center transition-all duration-300 ${
                        onSlotClick ? "cursor-pointer transform hover:scale-110" : "cursor-default"
                      }`}
                    >
                      <DynamicIcon
                        name="Heart"
                        className={`w-full h-full drop-shadow-sm ${index < visitas ? "text-amber-600 fill-current" : "text-white/50 fill-current"}`}
                      />
                    </div>
                  ))}
                  <div className="w-[15%] aspect-square flex items-center justify-center relative ml-2">
                    <DynamicIcon name="Heart" className="w-full h-full text-amber-900 fill-current drop-shadow-md" />
                    <span className="absolute -mt-[5px] ml-[4px] text-white font-bold text-[clamp(0.6rem,2vw,1.1rem)]">50%</span>
                  </div>
                </div>

                <div style={{ transform: "translateZ(20px)" }} className="relative z-10 text-center h-8 flex items-center justify-center">
                  {canjeDisponible ? (
                    <p className="font-bold text-yellow-600 animate-pulse text-xl">¡Felicidades! Ya tienes 50% de descuento.</p>
                  ) : (
                    showCycles &&
                    ciclosCompletados > 0 && <p className="text-xs text-stone-500 font-semibold">Ciclos completados: {ciclosCompletados}</p>
                  )}
                </div>
              </div>

              <div className="card-face card-face--back p-6">
                {isInteractive && <div className="holographic-overlay"></div>}
                <div style={{ transform: "translateZ(60px)" }} className="relative z-10 flex flex-col items-center">
                  {logoUrl && <img src={logoUrl} alt="Logo de la empresa" className="size-24 sm:size-32 object-contain drop-shadow-lg invert" />}
                  <p className="text-xl sm:text-2xl font-bold text-stone-800 mt-1 text-center">{nombreCliente}</p>
                  {showCycles && ciclosCompletados > 0 && <p className="text-sm text-stone-600 mt-2">Ciclos completados: {ciclosCompletados}</p>}
                </div>
              </div>
            </div>
          </ParallaxTilt>
        </div>
      </div>
    </>
  );
};

export default HolographicLoyaltyCard;
