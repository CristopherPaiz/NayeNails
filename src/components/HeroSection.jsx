import useStoreNails from "../store/store";
import CRCarousel from "./UI/CRCarousel";

const HeroSection = () => {
  const { imagenesInicio, textosColoresConfig } = useStoreNails();
  const slogan = textosColoresConfig?.slogan_negocio || "Donde la perfeccion es el estándar";
  const logoUrl = textosColoresConfig?.logo_negocio_url || "/nayeNails.svg";

  return (
    <div className="fixed inset-0 z-0">
      <CRCarousel interval={5000} data={imagenesInicio} showIndicator={false} widthPercentage={100} heightPercentage={"100dvh"} />
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex justify-center flex-col items-center text-white">
        <img src={logoUrl} alt="Naye Nails Logo" className="h-60 w-64 sm:h-80 sm:w-80" />
        <p className="text-md sm:text-2xl">{slogan}</p>
      </div>
    </div>
  );
};

export default HeroSection;
