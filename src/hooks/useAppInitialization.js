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
          } catch (e) {
            attempts++;
            if (isMounted) await delay(2000);
          }
        }

        if (!isMounted) return;

        // 2. Fetch Configuration & Critical Data FIRST
        // We need 'fetchConfiguracionesSitio' (or wherever 'imagenesInicio' live) to start loading images.
        // Assuming 'fetchConfiguracionesSitio' populates 'imagenesInicio' in the store?
        // Let's verify store usage. Usually configurations come first.

        // Execute fetches that populate store URLs
        await Promise.allSettled([
          fetchConfiguracionesSitio(), // Likely contains carousel images
          fetchTextosColoresConfig(),
          fetchDynamicNavItems(),
          checkAuthStatus(),
        ]);

        // 3. PRIORITY: Preload Images from the First Carousel
        // Get the updated state directly to find the URLs
        const storeState = useStoreNails.getState();
        const imagesToPreload = storeState.imagenesInicio || [];

        if (imagesToPreload.length > 0) {
          setLoadingMessage("Descargando galería principal..."); // User feedback
          // STRICT PRIORITY: We AWAIT these. The app will NOT proceed until these are done.
          await Promise.all(imagesToPreload.map((img) => preloadImage(img.url)));
        }

        // 4. Low Priority: Fetch rest of data
        // Trigger these requests but DO NOT blocking-await them for the loading screen?
        // OR await them if they are fast JSON.
        // fetchTodasLasUnas likely fetches a large JSON list of gallery items.
        // It's usually fast (just text), so we can await it or let it run.
        // Given 'fetchTodasLasUnas' name, it sounds like the main gallery data.
        await fetchTodasLasUnas();

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
  }, []);

  return { isServerReady, loadingMessage };
};
