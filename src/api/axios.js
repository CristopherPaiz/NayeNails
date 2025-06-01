import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000,
  // No establecer Content-Type globalmente aquí para permitir que Axios lo maneje para FormData
});

apiClient.interceptors.request.use(
  (config) => {
    // Si los datos son FormData, Axios establecerá el Content-Type automáticamente.
    // Si no, y es una petición que envía datos (POST, PUT, PATCH), establecer a application/json.
    if (!(config.data instanceof FormData) && (config.method === "post" || config.method === "put" || config.method === "patch")) {
      config.headers["Content-Type"] = "application/json";
    }
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
    if (error.code === "ERR_NETWORK") {
      console.log("Network error:", error);
    } else if (error.response) {
      console.log("Response error:", error.response);
    } else if (error.request) {
      console.log("Request error:", error.request);
    } else {
      console.log("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
