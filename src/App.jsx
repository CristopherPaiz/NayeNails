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

const AppContent = () => {
  useAnalytics();
  const {
    adminSidebarOpen,
    toggleAdminSidebar,
    textosColoresConfig,
    isLoadingTextosColores,
    fetchDynamicNavItems,
    fetchTodasLasUnas,
    fetchConfiguracionesSitio,
    fetchTextosColoresConfig,
  } = useStoreNails();
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
    const messages = [
      "Eligiendo los mejores diseños para ti...",
      "Preparando los esmaltes...",
      "Limando asperezas...",
      "Aplicando base coat...",
      "Encendiendo lámpara UV...",
      "Despertando a la API...",
      "Mezclando colores...",
      "Puliendo detalles...",
    ];
    let msgIndex = 0;

    // Interval for rotating messages
    const messageInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 2500);

    const initialize = async () => {
      try {
        // 1. Wake up Backend
        let attempts = 0;
        const maxAttempts = 50; // Try for quite a while (e.g., 25s - 50s depending on timeout)
        let connected = false;

        const checkHealth = async () => {
          // We use the base URL from Vite env or default to relative if proxied,
          // but since we need to hit the API, best to rely on how axios is configured or just use relative /api/health
          // Assuming proxy or configured base URL. Let's try relative first.
          // Note: If running locally without proxy, this might fail if not fully configured,
          // but production usually has same origin or configured CORS.
          // Given existing code uses apiClient, let's try a simple fetch to the presumed API URL.
          // Actually, let's just use the known endpoint structure.
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
          // Remove trailing slash if present
          const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

          try {
            const res = await fetch(`${baseUrl}/health`);
            if (res.ok) return true;
          } catch (e) {
            // Ignore error, retry
          }
          return false;
        };

        while (!connected && attempts < maxAttempts) {
          connected = await checkHealth();
          if (!connected) {
            attempts++;
            await new Promise((r) => setTimeout(r, 1000)); // Wait 1s between pings
          }
        }

        if (!connected) {
          // Fallback or show error? For now, we proceed and let regular error handling take over,
          // or we could show a "Server Down" screen.
          // Let's proceed to allow retry via UI or just let auth fail gracefully.
          console.warn("Backend did not respond after multiple attempts.");
        }

        // 2. Initialize Data
        await checkAuthStatus();
        fetchDynamicNavItems();
        fetchTodasLasUnas();
        fetchConfiguracionesSitio();
        fetchTextosColoresConfig();

        setIsServerReady(true);
      } catch (error) {
        console.error("Initialization failed:", error);
        // Even if fail, we might want to let the app try to render or show error
        setIsServerReady(true);
      }
    };

    initialize();

    return () => clearInterval(messageInterval);
  }, [checkAuthStatus, fetchDynamicNavItems, fetchTodasLasUnas, fetchConfiguracionesSitio, fetchTextosColoresConfig]);

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
