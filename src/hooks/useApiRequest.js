import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axios";
import CRAlert from "../components/UI/CRAlert";

const useApiRequest = ({
  queryKey: customQueryKey,
  url: baseUrl,
  method = "GET",
  config = {},
  options = {},
  notificationEnabled = true,
  successMessage,
  errorMessage,
}) => {
  const queryClient = useQueryClient();

  const queryKey = customQueryKey || (method.toUpperCase() === "GET" ? [baseUrl, config.params || {}] : [baseUrl]);

  const defaultSuccessHandler = (data, defaultMsg) => {
    if (notificationEnabled) {
      const msg = successMessage || data?.message || defaultMsg || "Operación exitosa";
      CRAlert.alert({ title: "Éxito", message: msg, type: "success" });
    }
  };

  const defaultErrorHandler = (error, defaultMsg) => {
    if (notificationEnabled) {
      const msg = errorMessage || error.response?.data?.message || error.message || defaultMsg || "Ocurrió un error";
      CRAlert.alert({ title: "Error", message: msg, type: "error" });
    }
  };

  if (method.toUpperCase() === "GET") {
    const queryFn = async () => {
      const response = await apiClient.get(baseUrl, config);
      return response.data;
    };

    return useQuery({
      queryKey,
      queryFn,
      enabled: options.enabled,
      onSuccess: (data) => {
        if (options.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        defaultErrorHandler(error, "Error al obtener los datos");
        if (options.onError) options.onError(error);
      },
      ...options,
    });
  } else {
    const mutationFn = async (variables) => {
      let finalUrl = baseUrl;
      let dataPayload;
      const methodUpper = method.toUpperCase();

      if (typeof variables === "object" && variables !== null && variables.url !== undefined) {
        finalUrl = variables.url;
        dataPayload = variables.data;
      } else {
        dataPayload = variables; // Si no hay .url, variables es el payload directamente
      }

      if (!finalUrl) {
        console.error("Error: No se proporcionó URL para la mutación en useApiRequest.", { baseUrl, variables });
        throw new Error("No se proporcionó URL para la mutación.");
      }

      // Asegurar que PATCH/POST/PUT envíen un cuerpo JSON incluso si dataPayload es null/undefined
      // para evitar el error de JSON.parse en el backend.
      // DELETE puede no necesitar cuerpo.
      if ((methodUpper === "POST" || methodUpper === "PUT" || methodUpper === "PATCH") && (dataPayload === null || dataPayload === undefined)) {
        dataPayload = {};
      }

      const response = await apiClient[method.toLowerCase()](finalUrl, dataPayload, config);
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
