import React, { useEffect, useState } from "react";
import CRLoader from "./CRLoader";

const SplashScreen = ({ isVisible, message }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) setShouldRender(true);
  }, [isVisible]);

  const onAnimationEnd = () => {
    if (!isVisible) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "radial-gradient(circle at center, #fce4ec 0%, #f8bbd0 40%, #f48fb1 100%)", // Pinkish radial gradient usually fits nails/salon
      }}
      onTransitionEnd={onAnimationEnd}
    >
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* Animated Brand Name */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 tracking-wider animate-pulse font-serif italic drop-shadow-md">Naye Nails</h1>

        {/* Loader Animation */}
        <div className="scale-125">
          <CRLoader text={message} style="nailPaint" size="lg" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
