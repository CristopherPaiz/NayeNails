import { useState, useEffect } from "react";
import useStoreNails from "../store/store";
import useAuthStore from "../store/authStore";
import apiClient from "../api/axios";

export const useAppInitialization = () => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparando los esmaltes...");

  // Stores
  const fetchDynamicNavItems = useStoreNails((state) => state.fetchDynamicNavItems);
  const fetchTodasLasUnas = useStoreNails((state) => state.fetchTodasLasUnas);
  const fetchConfiguracionesSitio = useStoreNails((state) => state.fetchConfiguracionesSitio);
  const fetchTextosColoresConfig = useStoreNails((state) => state.fetchTextosColoresConfig);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    let isMounted = true;
    let messageInterval = null;

    const messages = [
      "Eligiendo los mejores diseños para ti...",
      "Limando asperezas...",
      "Aplicando base coat...",
      "Encendiendo lámpara UV...",
      "Mezclando colores...",
      "Puliendo detalles...",
    ];
    let msgIndex = 0;

    // Start rotating messages
    if (!isServerReady) {
      messageInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        if (isMounted) setLoadingMessage(messages[msgIndex]);
      }, 2500);
    }

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve; // Continue even if error
      });
    };

    const initialize = async () => {
      try {
        // 1. Wake up Backend
        let attempts = 0;
        const maxAttempts = 60;
        let connected = false;
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        while (!connected && attempts < maxAttempts && isMounted) {
          try {
            await apiClient.get("/health", { timeout: 5000 });
            connected = true;
          } catch {
            attempts++;
            if (isMounted) await delay(2000);
          }
        }

        if (!isMounted) return;

        // 2. Fetch Configuration ONLY
        // We prioritize this to know WHAT to download.
        await fetchConfiguracionesSitio();

        // 3. PRIORITY: Preload Images from the First Carousel
        const storeState = useStoreNails.getState();
        const imagesToPreload = storeState.imagenesInicio || [];

        if (imagesToPreload.length > 0) {
          setLoadingMessage("Descargando galería principal...");
          // STRICT PRIORITY: Await these fully before proceeding
          await Promise.all(imagesToPreload.map((img) => preloadImage(img.url)));
        }

        if (!isMounted) return;

        // 4. Load the rest of the application data
        setLoadingMessage("Cargando información...");
        await Promise.allSettled([fetchTextosColoresConfig(), fetchDynamicNavItems(), checkAuthStatus(), fetchTodasLasUnas()]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isServerReady, loadingMessage };
};
