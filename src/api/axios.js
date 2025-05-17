import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
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
