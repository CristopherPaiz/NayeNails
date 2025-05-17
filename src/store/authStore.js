
import { create } from "zustand";
import apiClient from "../api/axios"; 
import CRAlert from "../components/UI/CRAlert"; 

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (credentials) => {
    
    try {
      const response = await apiClient.post("/auth/login", credentials); 

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
        
        throw new Error("Respuesta inesperada del servidor durante el login.");
      }
    } catch (error) {
      
      
      
      const errorMessage =
        error.response?.data?.message || 
        (error.code === "ERR_NETWORK" ? "Error de red. No se pudo conectar al servidor." : error.message) || 
        "Error desconocido al iniciar sesión.";

      CRAlert.alert({
        title: "Error de Inicio de Sesión",
        message: errorMessage,
        type: "error",
      });
      set({ isAuthenticated: false, user: null, isLoading: false });
      throw error; 
    }
  },

  
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
