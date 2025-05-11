// src/main.jsx
import React, { StrictMode } from "react"; // React importado correctamente
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <--- AÑADIR
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <--- AÑADIR
import useAuthStore from "./store/authStore.js"; // <--- AÑADIR (asegúrate que la ruta es correcta)
import "./index.css";
import App from "./App.jsx";

// 1. Crear una instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de staleTime como ejemplo
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 2. Llamar a checkAuthStatus al cargar la aplicación
// Esto se ejecutará una vez cuando la app se monte por primera vez.
// Es importante que esto se llame ANTES del primer render si es posible,
// o muy temprano en el ciclo de vida de la app.
// Llamarlo aquí asegura que el store intente verificar el estado de auth.
useAuthStore.getState().checkAuthStatus();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 3. Envolver con BrowserRouter */}
    <BrowserRouter>
      {/* 4. Envolver con QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
