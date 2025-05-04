// src/store/exampleStore.js
import { create } from "zustand";

// Creamos el store
const useExampleStore = create((set) => ({
  // ---- STATE ----
  // Aquí defines el estado inicial
  message: "Hola Mundo desde Zustand!",
  count: 0,
  // ---- ACTIONS ----
  // Aquí defines las funciones que modifican el estado
  // 'set' es una función segura para actualizar el estado
  setMessage: (newMessage) => set({ message: newMessage }),

  increment: () => set((state) => ({ count: state.count + 1 })),

  decrement: () => set((state) => ({ count: state.count - 1 })),

  // Acción asíncrona (ejemplo)
  fetchMessage: async () => {
    try {
      // Simulamos una llamada API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const fetchedMsg = `Mensaje obtenido a las ${new Date().toLocaleTimeString()}`;
      set({ message: fetchedMsg });
    } catch (error) {
      console.error("Error fetching message:", error);
      set({ message: "Error al cargar mensaje" });
    }
  },
}));

export default useExampleStore;
