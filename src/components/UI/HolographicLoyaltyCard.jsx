import React, { useState } from "react";
import ParallaxTilt from "react-parallax-tilt";
import { DynamicIcon } from "../../utils/DynamicIcon";

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

  return (
    <>
      <style>{`
        .card-container {
          perspective: 2000px;
        }
        .tilt-wrapper {
          width: 100%;
          height: 265px;
          aspect-ratio: 2.5 / 3.5;
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
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
          background: radial-gradient(circle at 100% 100%, #fdf2f8 0%,rgb(236, 216, 255) 40%, #e6f9ff 90%);
        }
        .card-face--back {
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .holographic-overlay {
          position: absolute;
          inset: -100%;
          background-image: conic-gradient(from 90deg at 40% -25%,rgb(255, 157, 206), #c972f4, #61dafb, #c972f4, #ff65b2);
          animation: spin 5s linear infinite;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          transform: scale(2);
        }
        .tilt-wrapper:hover .holographic-overlay,
        .tilt-wrapper.is-pressed .holographic-overlay {
          opacity: 0.25;
        }
        .card-pattern {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(135deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px,transparent 1px, transparent 10px),
                              repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px,transparent 1px, transparent 10px);
          z-index: 0;
        }
        @keyframes spin {
          100% { transform: scale(2) rotate(360deg); }
        }
      `}</style>
      <div className="card-container w-full max-w-sm mx-auto scale-90 sm:scale-100">
        <div
          className={`tilt-wrapper ${isPressed ? "is-pressed" : ""}`}
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ParallaxTilt
            tiltEnable={isInteractive}
            glareEnable={isInteractive}
            glareMaxOpacity={0.5}
            glareColor="#ffffff"
            glarePosition="all"
            glareBorderRadius="1rem"
            scale={isInteractive ? 1.05 : 1}
            perspective={900}
            transitionSpeed={1000}
            gyroscope={false}
            style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
          >
            <div className="card-flipper" style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              {/* CARA FRONTAL */}
              <div className="card-face card-face--front p-6 flex flex-col">
                <div className="card-pattern"></div>
                {isInteractive && <div className="holographic-overlay"></div>}

                <div style={{ transform: "translateZ(20px)" }} className="relative z-10 text-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-pink-600 drop-shadow-sm">Tarjeta de Fidelidad</h2>
                  <p className="text-base sm:text-lg font-semibold text-gray-700 mt-1 truncate">{nombreCliente}</p>
                </div>

                <div style={{ transform: "translateZ(40px)" }} className="relative z-10 grid grid-cols-5 gap-3 mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
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
                      className={`interactive-slot aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-105 ${
                        onSlotClick ? "cursor-pointer" : "cursor-default"
                      } ${index < visitas ? "bg-primary/90 border-pink-400 shadow-lg" : "bg-black/5 border-pink-200/50 backdrop-blur-sm"}`}
                    >
                      {index < visitas && logoUrl && <img src={logoUrl} alt="Logo" className="" />}
                      {index < visitas && !logoUrl && <DynamicIcon name="Check" className="w-3/4 h-3/4 text-white" />}
                    </div>
                  ))}
                </div>

                <div style={{ transform: "translateZ(30px)" }} className="relative z-10 text-center mt-auto">
                  {canjeDisponible ? (
                    <p className="text-base sm:text-lg font-bold text-green-500 animate-pulse">¡Felicidades! Tu próximo servicio es GRATIS.</p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Te faltan <span className="font-bold text-pink-500">{5 - visitas}</span> visita(s) para tu premio.
                    </p>
                  )}
                  {showCycles && ciclosCompletados > 0 && <p className="text-xs text-gray-500 mt-1">Ciclos completados: {ciclosCompletados}</p>}
                </div>
              </div>

              {/* CARA TRASERA */}
              <div className="card-face card-face--back p-6">
                <div className="card-pattern"></div>
                {isInteractive && <div className="holographic-overlay"></div>}
                <div style={{ transform: "translateZ(60px)" }} className="relative z-10">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo de la empresa" className="w-32 h-32 object-contain drop-shadow-lg invert" />
                  ) : (
                    <DynamicIcon name="Award" className="w-32 h-32 text-pink-400" />
                  )}
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
