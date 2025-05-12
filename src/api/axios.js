// src/api/axios.js
import axios from "axios";
import { API_BASE_URL } from "../constants/api"; // Asegúrate que esta constante es 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL, // DEBE SER 'http://localhost:3000/api'
  withCredentials: true, // Correcto para enviar cookies
  timeout: 10000, // Añadido un timeout de 10 segundos (opcional, pero bueno para depurar)
});

apiClient.interceptors.request.use(
  (config) => {
    // Puedes loguear la configuración de la solicitud aquí para depurar
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Aquí es donde probablemente se está capturando el ERR_NETWORK
    if (error.code === "ERR_NETWORK") {
      // Podrías mostrar una alerta más amigable al usuario aquí
      // CRAlert.alert({ title: 'Error de Red', message: 'No se pudo conectar al servidor. Verifica tu conexión y que el servidor esté en línea.', type: 'error' });
    } else if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      // `error.request` es una instancia de XMLHttpRequest en el navegador
    } else {
      // Algo más sucedió al configurar la solicitud que desencadenó un error
    }
    return Promise.reject(error);
  }
);

export default apiClient;
