import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ContentSection from "./components/ContentSection";

const App = () => (
  <div className="bg-backgroundSecondary">
    <div className="relative w-full">
      <HeroSection />
      <div className="fixed top-0 left-0 w-full z-30">
        <Header />
      </div>
      <ContentSection />
    </div>
  </div>
);

export default App;
