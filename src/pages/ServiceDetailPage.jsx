// src/pages/ServiceDetailPage.jsx
import { useParams, useLocation } from "react-router-dom";

// Componente de ejemplo para mostrar detalles de un servicio
const ServiceDetailPage = () => {
  const { serviceId } = useParams(); // Obtiene el :serviceId de la URL
  const location = useLocation(); // Hook para obtener información de la ubicación actual
  const queryParams = new URLSearchParams(location.search); // Parsea los query params

  // Ejemplo de cómo leer query params:
  const colorParam = queryParams.get("color");
  const efectoParam = queryParams.get("efecto");

  // Aquí buscarías la información del servicio 'serviceId'
  // y mostrarías los detalles.
  // También podrías usar colorParam y efectoParam para filtrar o mostrar algo específico.

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-[50vh]">
      {" "}
      {/* Añadido pt-24 por el header fijo */}
      <h1 className="text-3xl font-bold mb-4">Detalle del Servicio</h1>
      <p className="text-xl mb-2">
        ID del Servicio: <span className="font-semibold text-primary">{serviceId}</span>
      </p>
      {colorParam && (
        <p>
          Color solicitado: <span className="font-semibold">{colorParam}</span>
        </p>
      )}
      {efectoParam && (
        <p>
          Efecto solicitado: <span className="font-semibold">{efectoParam}</span>
        </p>
      )}
      {/* Muestra aquí la info detallada del servicio */}
      <p className="mt-4">
        Contenido específico para el servicio "{serviceId}". Puedes buscar datos basados en este ID y mostrarlos aquí. Los query parameters
        (?color=rojo&efecto=...) también están disponibles si los necesitas.
      </p>
    </div>
  );
};

export default ServiceDetailPage;
