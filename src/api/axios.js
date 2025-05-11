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
    // console.log('Starting Request', JSON.stringify(config, null, 2));
    return config;
  },
  (error) => {
    // console.error('Request Error', JSON.stringify(error, null, 2));
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  },
  (error) => {
    // console.error('Response Error', JSON.stringify(error, null, 2));
    // Aquí es donde probablemente se está capturando el ERR_NETWORK
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - Is the backend server running at " + API_BASE_URL + " and accessible?");
      // Podrías mostrar una alerta más amigable al usuario aquí
      // CRAlert.alert({ title: 'Error de Red', message: 'No se pudo conectar al servidor. Verifica tu conexión y que el servidor esté en línea.', type: 'error' });
    } else if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
      console.error("Backend Error:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      // `error.request` es una instancia de XMLHttpRequest en el navegador
      console.error("No response received:", error.request);
    } else {
      // Algo más sucedió al configurar la solicitud que desencadenó un error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
