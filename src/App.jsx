import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter";
import Sidebar from "./components/admin/Sidebar";
import useStoreNails from "./store/store";
import useAuthStore from "./store/authStore";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import CRLoader from "./components/UI/CRLoader";
import { useTheme } from "./context/ThemeProvider";
import { useAnalytics } from "./hooks/useAnalytics";
import apiClient from "./api/axios";

const AppContent = () => {
  useAnalytics();
  const adminSidebarOpen = useStoreNails((state) => state.adminSidebarOpen);
  const toggleAdminSidebar = useStoreNails((state) => state.toggleAdminSidebar);
  const textosColoresConfig = useStoreNails((state) => state.textosColoresConfig);
  const isLoadingTextosColores = useStoreNails((state) => state.isLoadingTextosColores);
  const fetchDynamicNavItems = useStoreNails((state) => state.fetchDynamicNavItems);
  const fetchTodasLasUnas = useStoreNails((state) => state.fetchTodasLasUnas);
  const fetchConfiguracionesSitio = useStoreNails((state) => state.fetchConfiguracionesSitio);
  const fetchTextosColoresConfig = useStoreNails((state) => state.fetchTextosColoresConfig);
  const { isAuthenticated, isLoading: authIsLoading, checkAuthStatus } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useTheme();
  const [isServerReady, setIsServerReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Conectando con el servidor...");

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

  // Backend Wakeup / Initialization Logic
  useEffect(() => {
    let isMounted = true;
    let messageInterval = null;

    const messages = [
      "Eligiendo los mejores diseños para ti...",
      "Preparando los esmaltes...",
      "Limando asperezas...",
      "Aplicando base coat...",
      "Encendiendo lámpara UV...",
      "Mezclando colores...",
      "Puliendo detalles...",
    ];
    let msgIndex = 0;

    // Start rotating messages only if not ready
    if (!isServerReady) {
      messageInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        if (isMounted) setLoadingMessage(messages[msgIndex]);
      }, 2500);
    }

    const initialize = async () => {
      try {
        // 1. Wake up Backend
        let attempts = 0;
        const maxAttempts = 60;
        let connected = false;

        // Use a simple delay function
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        while (!connected && attempts < maxAttempts && isMounted) {
          try {
            // Use apiClient to ensure we use the correct Base URL configuration
            await apiClient.get("/health", { timeout: 5000 });
            connected = true;
          } catch (e) {
            // If error, wait and retry
            attempts++;
            if (isMounted) await delay(2000); // Wait 2s between pings (less aggressive)
          }
        }

        if (!isMounted) return;

        if (!connected) {
          console.warn("Backend did not respond after multiple attempts.");
        }

        // 2. Initialize Data
        // Execute fetches in parallel to speed up loading once connected
        await Promise.allSettled([
          checkAuthStatus(),
          fetchDynamicNavItems(),
          fetchTodasLasUnas(),
          fetchConfiguracionesSitio(),
          fetchTextosColoresConfig(),
        ]);

        // 3. Preload Carousel Images
        const preloadImage = (url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve;
          });
        };

        const storeState = useStoreNails.getState();
        const imagesToPreload = storeState.imagenesInicio || [];

        if (imagesToPreload.length > 0) {
          await Promise.all(imagesToPreload.map((img) => preloadImage(img.url)));
        }

        if (isMounted) setIsServerReady(true);
      } catch (error) {
        console.error("Initialization failed:", error);
        if (isMounted) setIsServerReady(true);
      } finally {
        if (messageInterval) clearInterval(messageInterval);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (messageInterval) clearInterval(messageInterval);
    };
  }, []); // Run once on mount

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Show loading screen if server not ready OR specific initial content is loading
  if (!isServerReady) {
    return (
      <div className="fixed inset-0 bg-backgroundSecondary dark:bg-background flex flex-col justify-center items-center z-[9999]">
        <CRLoader text={loadingMessage} style="nailPaint" size="lg" />
      </div>
    );
  }

  // Once server is ready, we might still have some internal loading (like auth),
  // but usually we want to show the app structure now.
  // If auth is strictly required for everything, we keep waiting.
  // But usually public pages should show.
  // The original code waited for authIsLoading || isLoadingTextosColores.
  // We can keep that behavior if desired, or assume they are fast now.
  // Let's keep the original "Global Loading" protection for Auth check if it's still running,
  // but usually checkAuthStatus finishes in the init block.

  if (authIsLoading || isLoadingTextosColores) {
    return (
      <div className="fixed inset-0 bg-backgroundSecondary dark:bg-background flex flex-col justify-center items-center z-[9999]">
        <CRLoader text="Cargando Naye Nails..." style="nailPaint" size="lg" />
      </div>
    );
  }

  return (
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
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
