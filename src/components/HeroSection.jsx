import CRCarousel from "./UI/CRCarousel";

const images = [
  { url: "http://www.origi-nails.com/images/hair_01.jpg", legend: "Amanecer" },
  { url: "http://www.origi-nails.com/images/pedi_01.jpg", legend: "Atardecer" },
  { url: "http://www.origi-nails.com/images/slider_02.jpg", legend: "Noche" },
];

const handleImageClick = ({ item, index }) => {
  console.log(`Clicked image ${index}: ${item.legend}`);
};

const HeroSection = () => (
  <div className="fixed inset-0 z-0">
    <CRCarousel
      interval={5000}
      data={images}
      showIndicator={false}
      widthPercentage={100}
      heightPercentage={"100dvh"}
      onClickItem={handleImageClick}
    />
    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex justify-center flex-col items-center text-white">
      <img src="/nayeNails.svg" alt="Naye Nails Logo" className="h-60 w-64" />
      <p className="text-sm">Donde la perfección es el estándar</p>
    </div>
  </div>
);

export default HeroSection;
