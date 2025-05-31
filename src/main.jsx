import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./store/authStore.js";
import useStoreNails from "./store/store.js";
import apiClient from "./api/axios.js";
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

const initializeApp = async () => {
  await useAuthStore.getState().checkAuthStatus();
  useStoreNails.getState().fetchDynamicNavItems();
  useStoreNails.getState().fetchTodasLasUnas();
  useStoreNails.getState().fetchConfiguracionesSitio();
  useStoreNails.getState().fetchTextosColoresConfig(); // NUEVA CARGA

  const { isAuthenticated, isLoading } = useAuthStore.getState();
  if (!isLoading && !isAuthenticated) {
    try {
      apiClient.post("/visitas/registrar").catch((err) => console.warn("Fallo al registrar visita (segundo plano):", err.message));
    } catch (error) {
      console.warn("Fallo al registrar visita (segundo plano):", error.message);
    }
  }

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
};

initializeApp();
