import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./store/authStore.js";
import useStoreNails from "./store/store.js";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Cargas iniciales
useAuthStore.getState().checkAuthStatus();
useStoreNails.getState().fetchDynamicNavItems();
useStoreNails.getState().fetchTodasLasUnas(); // Cargar diseños
useStoreNails.getState().fetchConfiguracionesSitio(); // Cargar configuraciones de imágenes

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
