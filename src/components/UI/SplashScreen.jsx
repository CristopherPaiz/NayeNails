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
        background: "radial-gradient(circle at center, #fff0f5 0%, #ffe4e1 45%, #ffe6f4ff 100%)", // Much lighter, pastel pinks
      }}
      onTransitionEnd={onAnimationEnd}
    >
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* Loader Animation */}
        <div className="scale-125">
          <CRLoader text={message} style="nailPaint" size="lg" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
