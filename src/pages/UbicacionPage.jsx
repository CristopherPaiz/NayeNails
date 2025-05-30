import { Map, Navigation, ExternalLink, Phone, Clock } from "lucide-react";
import useScrollToTop from "../hooks/useScrollToTop";
import useStoreNails from "../store/store";

const UbicacionPage = () => {
  useScrollToTop();
  const { textosColoresConfig, isLoadingTextosColores } = useStoreNails();

  const direccion = textosColoresConfig?.texto_direccion_unificado || "12 Avenida 2-25, Zona 6, Quetzaltenango, Guatemala";
  const celular = textosColoresConfig?.telefono_unificado || "+50249425739";
  const coordenadas = textosColoresConfig?.coordenadas_mapa || "14.850236,-91.510423";
  const horario = textosColoresConfig?.horario_negocio || "Lunes a Viernes: 9:00 AM - 5:00 PM";
  const imagenUbicacion = textosColoresConfig?.imagen_ubicacion_url || "/pics/local.png";

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.8761753785793!2d${coordenadas.split(",")[1]}!3d${
    coordenadas.split(",")[0]
  }!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDUxJzAxLjAiTiA5McKwMzAnMzguMCJX!5e0!3m2!1ses!2sgt!4v1714768930733!5m2!1ses!2sgt`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordenadas}`;

  if (isLoadingTextosColores && !textosColoresConfig.nombre_negocio) {
    // Muestra un loader simple o null mientras carga la configuración inicial
    return <div className="container mx-auto px-6 py-8 pt-16 md:pt-14 text-center">Cargando datos de ubicación...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 pt-16 md:pt-14">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary dark:text-textPrimary">Nuestra Ubicación</h1>
      <div className="bg-primary/5 dark:bg-tertiary/10 rounded-2xl shadow-xl overflow-hidden border-2 border-primary dark:border-tertiary max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5">
            <img
              src={imagenUbicacion}
              alt="Nuestras instalaciones"
              className="w-full h-64 md:h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/pics/local.png";
              }} // Fallback
            />
          </div>

          <div className="w-full md:w-3/5 p-6 md:p-8 bg-gradient-to-br from-primary/5 to-tertiary/5 dark:from-tertiary/10 dark:to-primary/10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-primary dark:text-textPrimary">Detalles de Contacto</h2>
              <div className="space-y-4 text-textPrimary dark:text-textPrimary">
                <p className="flex items-start">
                  <Navigation className="mr-3 text-primary dark:text-tertiary flex-shrink-0 mt-1" size={20} />
                  <span>{direccion}</span>
                </p>
                <p className="flex items-center">
                  <Phone className="mr-3 text-primary dark:text-tertiary" size={20} />
                  <span>{celular}</span>
                </p>
                <p className="flex items-center">
                  <Clock className="mr-3 text-primary dark:text-tertiary" size={20} />
                  <span>{horario}</span>
                </p>
              </div>
            </div>

            <div className="md:hidden mt-8 mb-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-primary dark:bg-tertiary text-white py-3 px-4 rounded-full transition-colors shadow-md hover:bg-primary/90 dark:hover:bg-tertiary/90"
              >
                <Navigation className="mr-2" size={20} />
                Cómo llegar
              </a>
            </div>

            <div className="hidden md:block mt-8">
              <h3 className="text-xl font-semibold flex items-center mb-3 text-primary dark:text-textPrimary">
                <Map className="mr-2 text-primary dark:text-tertiary" size={22} />
                Encuéntranos en el Mapa
              </h3>
              <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-primary dark:border-tertiary shadow-md">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
              <div className="mt-4 text-right">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-primary dark:bg-tertiary text-white hover:bg-primary/90 dark:hover:bg-tertiary/90 transition-colors shadow-sm"
                >
                  Abrir en Google Maps
                  <ExternalLink className="ml-2" size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UbicacionPage;
