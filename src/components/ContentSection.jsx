// /src/components/ContentSection.jsx
import { useRef, useState, useEffect } from "react";
import ScrollArrow from "./subcomponents/ScrollArrow";
import Servicios from "./Servicios";
import Disenios from "./Disenios";

const imageData = [
  { id: "img-1", src: "/pics/1.jpg", thumb: "/pics/1.jpg", alt: "Imagen 1", lgSize: "1920-1280" },
  { id: "img-2", src: "/pics/2.jpg", thumb: "/pics/2.jpg", alt: "Imagen 2", lgSize: "1024-768" },
  { id: "img-3", src: "/pics/3.jpg", thumb: "/pics/3.jpg", alt: "Imagen 3", lgSize: "1600-1200" },
  { id: "img-4", src: "/pics/4.jpg", thumb: "/pics/4.jpg", alt: "Imagen 4", lgSize: "1280-853" },
  { id: "img-5", src: "/pics/5.jpg", thumb: "/pics/5.jpg", alt: "Imagen 5", lgSize: "1920-1080" },
  { id: "img-6", src: "/pics/6.jpg", thumb: "/pics/6.jpg", alt: "Imagen 6", lgSize: "1000-667" },
  { id: "img-7", src: "/pics/7.jpg", thumb: "/pics/7.jpg", alt: "Imagen 7", lgSize: "1400-933" },
  { id: "img-8", src: "/pics/8.jpg", thumb: "/pics/8.jpg", alt: "Imagen 8", lgSize: "900-600" },
  { id: "img-9", src: "/pics/9.jpg", thumb: "/pics/9.jpg", alt: "Imagen 9", lgSize: "2048-1365" },
  { id: "img-10", src: "/pics/10.jpg", thumb: "/pics/10.jpg", alt: "Imagen 10", lgSize: "1600-1067" },
];

const ContentSection = () => {
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
      <div className="h-screen pt-16 sm:pt-24 flex justify-center items-center"></div>

      <div ref={serviciosRef} className="w-full bg-primary dark:bg-background flex flex-col justify-center items-center relative">
        <ScrollArrow showArrow={showArrowServicios} bg="bg-primary" bgDark="dark:bg-background" icon="Star" />
        <Servicios />
      </div>

      <div className="w-full bg-background dark:bg-primary flex flex-col justify-center items-center relative py-10">
        <ScrollArrow showArrow={false} bg="bg-background" bgDark="dark:bg-primary" icon="Sparkle" color="text-textPrimary dark:text-textPrimary" />
        <Disenios images={imageData} />
      </div>
    </div>
  );
};

export default ContentSection;
