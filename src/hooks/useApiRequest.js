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
  successMessage, // Este es el mensaje personalizado para éxito
  errorMessage, // Este es el mensaje personalizado para error
}) => {
  const queryClient = useQueryClient();

  const queryKey = customQueryKey || (method.toUpperCase() === "GET" ? [baseUrl, config.params || {}] : [baseUrl]);

  const defaultSuccessHandler = (data, defaultMsgOverride) => {
    if (notificationEnabled) {
      const msg = successMessage || data?.message || defaultMsgOverride || "Operación exitosa";
      CRAlert.alert({ title: "Éxito", message: msg, type: "success" });
    }
  };

  const defaultErrorHandler = (error, defaultMsgOverride) => {
    if (notificationEnabled) {
      const msg = errorMessage || error.response?.data?.message || error.message || defaultMsgOverride || "Ocurrió un error";
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
        // Para GET, no usamos defaultSuccessHandler a menos que se especifique
        if (options.onSuccess) options.onSuccess(data);
      },
      onError: (error) => {
        defaultErrorHandler(error, "Error al obtener los datos");
        if (options.onError) options.onError(error);
      },
      ...options,
    });
  } else {
    // Mutaciones (POST, PUT, PATCH, DELETE)
    const mutationFn = async (variables) => {
      let finalUrl = baseUrl;
      let dataPayload;
      const methodUpper = method.toUpperCase();

      if (typeof variables === "object" && variables !== null && variables.url !== undefined) {
        finalUrl = variables.url;
        dataPayload = variables.data;
      } else {
        dataPayload = variables;
      }

      if (!finalUrl) {
        console.error("Error: No se proporcionó URL para la mutación en useApiRequest.", { baseUrl, variables });
        throw new Error("No se proporcionó URL para la mutación.");
      }

      if ((methodUpper === "POST" || methodUpper === "PUT" || methodUpper === "PATCH") && (dataPayload === null || dataPayload === undefined)) {
        dataPayload = {};
      }

      const response = await apiClient[method.toLowerCase()](finalUrl, dataPayload, config);
      return response.data;
    };

    const mutationResult = useMutation({
      // Guardamos el resultado de useMutation
      mutationFn,
      onSuccess: (data, variables, context) => {
        defaultSuccessHandler(data, "Operación exitosa"); // Usar el successMessage personalizado si existe
        if (options.onSuccess) options.onSuccess(data, variables, context);
      },
      onError: (error, variables, context) => {
        defaultErrorHandler(error, "La operación falló"); // Usar el errorMessage personalizado si existe
        if (options.onError) options.onError(error, variables, context);
      },
      // No pasar 'isLoading' o 'isPending' directamente aquí en options
      // ya que son parte del objeto que devuelve useMutation.
      // Se propagan las demás opciones como retry, etc.
      ...options,
    });

    // Devolvemos el objeto de mutación completo, y explícitamente mapeamos isPending a isLoading
    return {
      ...mutationResult,
      isLoading: mutationResult.isPending,
    };
  }
};

export default useApiRequest;
