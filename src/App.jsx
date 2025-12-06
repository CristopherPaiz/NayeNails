import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter";
import Sidebar from "./components/admin/Sidebar";
import useStoreNails from "./store/store";
import useAuthStore from "./store/authStore";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeProvider";
import { useAnalytics } from "./hooks/useAnalytics";
import SplashScreen from "./components/UI/SplashScreen";
import { useAppInitialization } from "./hooks/useAppInitialization";

const AppContent = () => {
  useAnalytics();
  const adminSidebarOpen = useStoreNails((state) => state.adminSidebarOpen);
  const toggleAdminSidebar = useStoreNails((state) => state.toggleAdminSidebar);
  const textosColoresConfig = useStoreNails((state) => state.textosColoresConfig);

  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();

  // Initialization Hook
  const { isServerReady, loadingMessage } = useAppInitialization();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (textosColoresConfig?.configuracion_colores) {
      const root = document.documentElement;
      const themeMode = theme === "dark" ? "dark" : "light";
      const colorsToApply = textosColoresConfig.configuracion_colores[themeMode];

      if (colorsToApply) {
        for (const [key, value] of Object.entries(colorsToApply)) {
          if (value) {
            root.style.setProperty(`--color-${key}`, value);
          }
        }
      }
    }
  }, [textosColoresConfig, theme]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <SplashScreen isVisible={!isServerReady} message={loadingMessage} />

      {/* Main App Content - Rendered behind loader once ready */}
      {isServerReady && (
        <div className="bg-backgroundSecondary min-h-screen flex flex-col">
          <Header />
          <div className="flex w-full -mt-9 sm:mt-0">
            {isAuthenticated && (
              <Sidebar isSidebarOpen={adminSidebarOpen} toggleSidebar={toggleAdminSidebar} isMobile={isMobile} isAdminRoute={isAdminRoute} />
            )}
            {isAuthenticated && adminSidebarOpen && isMobile && (
              <div className="fixed inset-0 bg-black/60 md:hidden" onClick={toggleAdminSidebar} aria-hidden="true" style={{ zIndex: 30 }}></div>
            )}
            <main
              className={`
                  flex-grow transition-all duration-300 ease-in-out
                  pt-8 w-full overflow-hidden
                  ${isMobile && adminSidebarOpen ? "overflow-hidden" : ""}
                  ${isAuthenticated && !isMobile && isAdminRoute ? "md:ml-4" : "ml-0"}
                `}
            >
              <AppRouter />
            </main>
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
