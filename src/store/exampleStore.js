// src/store/exampleStore.js
import { create } from "zustand";

// Creamos el store
const useExampleStore = create((set) => ({
  // ---- STATE ----
  // Aquí defines el estado inicial
  message: "Hola Mundo desde Zustand!",
  // ---- ACTIONS ----
  // Aquí defines las funciones que modifican el estado
  // 'set' es una función segura para actualizar el estado
  setMessage: (newMessage) => set({ message: newMessage }),

  // Acción asíncrona (ejemplo)
  fetchMessage: async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1));
      const fetchedMsg = `Mensaje obtenido a las ${new Date().toLocaleTimeString()}`;
      set({ message: fetchedMsg });
    } catch (error) {
      console.error("Error fetching message:", error);
      set({ message: "Error al cargar mensaje" });
    }
  },
}));

export default useExampleStore;
