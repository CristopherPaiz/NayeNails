import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./store/authStore.js";
import useStoreNails from "./store/store.js";
import "./index.css";
import App from "./App.jsx";
import "react-big-calendar/lib/css/react-big-calendar.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
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
  useStoreNails.getState().fetchTextosColoresConfig();

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
