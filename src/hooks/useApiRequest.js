import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axios";
import CRAlert from "../components/UI/CRAlert"; 

/**
 * Hook genérico para realizar peticiones API usando React Query.
 * @param {object} params - Parámetros de configuración.
 * @param {string | string[]} params.queryKey - Clave para la query cache (tu 'nameUrl'). Usado para GET.
 * @param {string} params.url - URL del endpoint (sin el base path).
 * @param {string} [params.method='GET'] - Método HTTP (GET, POST, PUT, DELETE, PATCH).
 * @param {object} [params.config={}] - Configuración adicional para Axios (ej: headers, params para GET).
 * @param {object} [params.options={}] - Opciones adicionales para React Query (ej: enabled, onSuccess, onError).
 * @param {boolean} [params.notificationEnabled=true] - Habilitar notificaciones con CRAlert.
 * @param {string} [params.successMessage] - Mensaje de éxito personalizado.
 * @param {string} [params.errorMessage] - Mensaje de error personalizado.
 * @returns {object} Resultado de useQuery o useMutation, dependiendo del método.
 */
const useApiRequest = ({
  queryKey: customQueryKey,
  url,
  method = "GET",
  config = {},
  options = {},
  notificationEnabled = true,
  successMessage,
  errorMessage,
}) => {
  const queryClient = useQueryClient();
  
  const queryKey = customQueryKey || (method.toUpperCase() === "GET" ? [url, config.params || {}] : [url]);

  const defaultSuccessHandler = (data, defaultMsg) => {
    if (notificationEnabled) {
      const msg = successMessage || data?.message || defaultMsg || "Operation successful";
      CRAlert.alert({ title: "Éxito", message: msg, type: "success" });
    }
  };

  const defaultErrorHandler = (error, defaultMsg) => {
    if (notificationEnabled) {
      const msg = errorMessage || error.response?.data?.message || error.message || defaultMsg || "An error occurred";
      CRAlert.alert({ title: "Error", message: msg, type: "error" });
    }
  };

  if (method.toUpperCase() === "GET") {
    const queryFn = async () => {
      const response = await apiClient.get(url, config);
      return response.data;
    };

    return useQuery({
      queryKey,
      queryFn,
      enabled: options.enabled, 
      onSuccess: (data) => {
        defaultSuccessHandler(data, "Datos obtenidos con éxito");
        if (options.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        defaultErrorHandler(error, "Error al obtener los datos");
        if (options.onError) options.onError(error);
      },
      ...options, 
    });
  } else {
    
    const mutationFn = async (data) => {
      
      const response = await apiClient[method.toLowerCase()](url, data, config);
      return response.data;
    };

    return useMutation({
      mutationFn,
      onSuccess: (data, variables, context) => {
        defaultSuccessHandler(data, "Operación exitosa");
        
        
        if (options.onSuccess) options.onSuccess(data, variables, context);
      },
      onError: (error, variables, context) => {
        defaultErrorHandler(error, "La operación falló");
        if (options.onError) options.onError(error, variables, context);
      },
      ...options, 
    });
  }
};

export default useApiRequest;
