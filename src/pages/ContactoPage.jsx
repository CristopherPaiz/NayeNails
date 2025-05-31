import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Phone, MapPin } from "lucide-react";
import useScrollToTop from "../hooks/useScrollToTop";
import useStoreNails from "../store/store"; // Importar el store

const FacebookIcon = ({ iconClassName = "w-6 h-6 text-white dark:text-primary group-hover:scale-110 transition-transform" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClassName}>
    <path d="M12 2.03998C6.48 2.03998 2 6.51998 2 12.03C2 17.08 5.64 21.22 10.44 21.88V14.89H7.9V12.03H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.03H16.34L15.89 14.89H13.56V21.87C18.36 21.22 22 17.08 22 12.03C22 6.51998 17.52 2.03998 12 2.03998Z" />
  </svg>
);

const ContactoPage = () => {
  useScrollToTop();
  const { textosColoresConfig } = useStoreNails();

  const nombreDelNegocio = textosColoresConfig?.nombre_negocio || "Naye Nails";
  const numeroWhatsAppRaw = textosColoresConfig?.telefono_unificado || "+50249425739";
  const numeroWhatsAppParaLink = numeroWhatsAppRaw.replace(/\D/g, "");
  const urlFacebook = textosColoresConfig?.url_facebook || "https://facebook.com/profile.php?id=61575180189391";
  const direccionNegocio = textosColoresConfig?.texto_direccion_unificado || "12 Avenida 2-25, Zona 6, Quetzaltenango, Guatemala";

  const obtenerSaludoDelDia = () => {
    const horaActual = new Date().getHours();
    if (horaActual < 12) return "buenos días";
    if (horaActual < 18) return "buenas tardes";
    return "buenas noches";
  };

  const saludoDelDia = obtenerSaludoDelDia();
  const mensajeWhatsAppBase = `Hola ${saludoDelDia}, ${nombreDelNegocio}, quisiera más información.`;
  const whatsappUrl = `https://wa.me/${numeroWhatsAppParaLink}?text=${encodeURIComponent(mensajeWhatsAppBase)}`;

  return (
    <div className="container mx-auto py-4 px-4 min-h-[calc(100vh-var(--navbar-height,80px))] flex flex-col items-center justify-center">
      <div className="bg-background dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-12 text-center w-full max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-primary-light mb-6">Ponte en Contacto</h1>
        <p className="text-lg text-textSecondary dark:text-gray-300 mb-10 max-w-xl mx-auto">
          ¡Estamos aquí para ayudarte! Si tienes preguntas, deseas agendar tu cita o simplemente quieres saludarnos, no dudes en comunicarte.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="flex items-start space-x-3 p-4 bg-pink-50 dark:bg-gray-700 rounded-lg">
            <Phone className="w-7 h-7 text-primary dark:text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-textPrimary dark:text-white text-lg">Teléfono / WhatsApp</h3>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary dark:text-primary-light hover:underline break-all"
              >
                Toca aquí para chatear
              </a>
              <p className="text-xs text-textSecondary dark:text-gray-400 mt-1">Respuesta rápida</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-pink-50 dark:bg-gray-700 rounded-lg">
            <FacebookIcon iconClassName="w-7 h-7 text-primary dark:text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-textPrimary dark:text-white text-lg">Facebook / {nombreDelNegocio}</h3>
              <a
                href={urlFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary dark:text-primary-light hover:underline break-all"
              >
                Toca aquí para ver nuestro perfil
              </a>
              <p className="text-xs text-textSecondary dark:text-gray-400 mt-1">Síguenos para novedades y promociones</p>
            </div>
          </div>

          {direccionNegocio && (
            <div className="md:col-span-2 flex items-start space-x-3 p-4 bg-pink-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-7 h-7 text-primary dark:text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-textPrimary dark:text-white text-lg">Nuestra Ubicación</h3>
                <p className="text-textSecondary dark:text-gray-300">{direccionNegocio}</p>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/agendar-cita"
          className="inline-flex items-center justify-center bg-accent dark:bg-primary hover:bg-accent-dark dark:hover:bg-primary-dark text-primary dark:text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mb-10"
        >
          <CalendarPlus className="mr-2 h-5 w-5" />
          Agenda tu Cita Online
        </Link>
      </div>
    </div>
  );
};

export default ContactoPage;
