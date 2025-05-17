import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DynamicIcon } from "../../utils/DynamicIcon";
import { CATALOGO_BASE_PATH } from "../../constants/navbar";

const CategoryPreviewModal = ({ isOpen, onClose, title, icon, subcategoryNames = [], ctaButtonText }) => {
  if (!isOpen) return null;

  const marqueeItems = useMemo(() => {
    if (subcategoryNames.length === 0) return [];
    let items = [...subcategoryNames];
    if (items.length > 0 && items.length < 10) {
      items = [...items, ...items, ...items, ...items];
    } else if (items.length > 0 && items.length < 20) {
      items = [...items, ...items];
    }
    return items.sort(() => 0.5 - Math.random());
  }, [subcategoryNames]);

  const halfIndex = Math.ceil(marqueeItems.length / 2);
  const marqueeRow1 = marqueeItems.slice(0, halfIndex);
  const marqueeRow2 = marqueeItems.slice(halfIndex);

  const marqueeCSS = `
    .marquee-container {
      position: relative;
      height: 7rem; /* 112px */
      overflow: hidden;
      margin-top: 1.5rem; /* my-6 */
      margin-bottom: 1.5rem; /* my-6 */
    }
    .marquee-fade {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 3rem; /* w-12 */
      z-index: 10;
      pointer-events: none;
    }
    .marquee-fade-left {
      left: 0;
      background: linear-gradient(to right, var(--modal-bg-color, white) 20%, transparent);
    }
    .marquee-fade-right {
      right: 0;
      background: linear-gradient(to left, var(--modal-bg-color, white) 20%, transparent);
    }
    .marquee-row {
      position: absolute;
      width: 100%;
      display: flex;
      animation-duration: 35s; /* Ajusta la duración/velocidad */
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    .marquee-row:hover {
      animation-play-state: paused;
    }
    .marquee-row-1 {
      top: 0.5rem; /* top-2 */
      animation-name: marquee-animation;
    }
    .marquee-row-2 {
      top: 3.5rem; /* top-14 */
      animation-name: marquee-reverse-animation;
      animation-duration: 40s; /* Ligeramente diferente velocidad */
    }
    .marquee-content {
      display: flex;
      flex-shrink: 0;
      align-items: center; /* Para centrar verticalmente los chips si tienen alturas variables */
    }
    .marquee-chip {
      /* Estilos de los chips (puedes usar clases de Tailwind aquí si prefieres para el chip en sí) */
      background-color: var(--chip-bg-color, #e5e7eb); /* bg-gray-200 */
      color: var(--chip-text-color, #374151); /* text-gray-700 */
      padding: 0.25rem 0.75rem; /* px-3 py-1 */
      border-radius: 9999px; /* rounded-full */
      font-size: 0.875rem; /* text-sm */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow */
      white-space: nowrap;
      margin-right: 0.75rem; /* space-x-3 */
    }

    @keyframes marquee-animation {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes marquee-reverse-animation {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0%); }
    }
  `;

  const [modalBgColor, setModalBgColor] = useState("white");
  const [chipBgColor, setChipBgColor] = useState("#e5e7eb");
  const [chipTextColor, setChipTextColor] = useState("#374151");

  useEffect(() => {
    
    if (document.documentElement.classList.contains("dark")) {
      setModalBgColor("#1f2937"); 
      setChipBgColor("#4b5563"); 
      setChipTextColor("#d1d5db"); 
    } else {
      setModalBgColor("white");
      setChipBgColor("#e0e7ff"); 
      setChipTextColor("#4338ca"); 
    }
  }, []);

  return (
    <>
      <style>
        {marqueeCSS
          .replace(/var\(--modal-bg-color, white\)/g, modalBgColor)
          .replace(/var\(--chip-bg-color, #e5e7eb\)/g, chipBgColor)
          .replace(/var\(--chip-text-color, #374151\)/g, chipTextColor)}
      </style>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      >
        <div
          className="bg-background dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out"
          style={{ transform: isOpen ? "scale(1)" : "scale(0.95)", opacity: isOpen ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary flex items-center">
              {icon && <DynamicIcon name={icon} className="w-6 h-6 mr-2" />}
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light p-1 rounded-full"
              aria-label="Cerrar modal"
            >
              <DynamicIcon name="X" size={20} />
            </button>
          </div>

          {marqueeItems.length > 0 && (
            <div className="marquee-container group">
              <div className="marquee-fade marquee-fade-left"></div>
              <div className="marquee-fade marquee-fade-right"></div>
              <div className="marquee-row marquee-row-1">
                <div className="marquee-content">
                  {marqueeRow1.map((name, idx) => (
                    <span key={`r1-${idx}`} className="marquee-chip">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="marquee-content">
                  {marqueeRow1.map((name, idx) => (
                    <span key={`r1-dup-${idx}`} className="marquee-chip">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="marquee-row marquee-row-2">
                <div className="marquee-content">
                  {marqueeRow2.map((name, idx) => (
                    <span key={`r2-${idx}`} className="marquee-chip">
                      {name}
                    </span>
                  ))}
                </div>
                <div className="marquee-content">
                  {marqueeRow2.map((name, idx) => (
                    <span key={`r2-dup-${idx}`} className="marquee-chip">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Link
            to={CATALOGO_BASE_PATH}
            onClick={onClose}
            className="w-full mt-8 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            {ctaButtonText || "Explorar Todos"}
            <DynamicIcon name="ArrowRight" className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default CategoryPreviewModal;
