// src/store/authStore.js
import { create } from "zustand";
import apiClient from "../api/axios"; // Verifica esta ruta
import CRAlert from "../components/UI/CRAlert"; // Verifica esta ruta

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (credentials) => {
    // set({ isLoading: true }); // Puedes activar un estado de carga específico para el login si quieres
    try {
      const response = await apiClient.post("/auth/login", credentials); // Endpoint relativo a baseURL

      if (response.data && response.data.user) {
        set({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false,
        });
        CRAlert.alert({
          title: "Éxito",
          message: response.data.message || "Inicio de sesión exitoso.",
          type: "success",
        });
        return response.data;
      } else {
        CRAlert.alert({
          title: "Error de Respuesta",
          message: "Respuesta inesperada del servidor durante el login.",
          type: "error",
        });
        set({ isAuthenticated: false, user: null, isLoading: false });
        // Lanzar un error aquí para que el componente lo maneje si es necesario
        throw new Error("Respuesta inesperada del servidor durante el login.");
      }
    } catch (error) {
      // El interceptor de Axios ya debería haber logueado detalles del error de red.
      // CRAlert ya se maneja en el interceptor de Axios si es un error de backend con mensaje,
      // o aquí si es otro tipo de error.
      const errorMessage =
        error.response?.data?.message || // Mensaje del backend
        (error.code === "ERR_NETWORK" ? "Error de red. No se pudo conectar al servidor." : error.message) || // Mensaje de Axios
        "Error desconocido al iniciar sesión.";

      CRAlert.alert({
        title: "Error de Inicio de Sesión",
        message: errorMessage,
        type: "error",
      });
      set({ isAuthenticated: false, user: null, isLoading: false });
      throw error; // Re-lanza para que el componente LoginPage lo pueda atrapar
    }
  },

  // ... (logout y checkAuthStatus permanecen igual, pero también se beneficiarían de logs similares si fallan)
  logout: async () => {
    try {
      const response = await apiClient.post("/auth/logout");
      set({ isAuthenticated: false, user: null, isLoading: false });
      CRAlert.alert({
        title: "Sesión Cerrada",
        message: response.data.message || "Has cerrado sesión exitosamente.",
        type: "info",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK" ? "Error de red al cerrar sesión." : error.message) ||
        "Error desconocido al cerrar sesión.";
      CRAlert.alert({
        title: "Error al Cerrar Sesión",
        message: errorMessage,
        type: "error",
      });
      set({ isAuthenticated: false, user: null, isLoading: false });
      throw error;
    }
  },

  checkAuthStatus: async () => {
    if (!get().isLoading) set({ isLoading: true });
    try {
      const response = await apiClient.get("/auth/me");
      if (response.data && response.data.user) {
        set({ isAuthenticated: true, user: response.data.user, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch (error) {
      console.warn("[authStore] Check auth status failed (this can be normal if not logged in):", error.code, error.message);
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
