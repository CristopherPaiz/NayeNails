// src/pages/ContactoPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Phone, MapPin } from "lucide-react"; // Se quitó Mail

// --- Iconos SVG ---
// Se modificó FacebookIcon para aceptar iconClassName para mayor flexibilidad de estilo
const FacebookIcon = ({ iconClassName = "w-6 h-6 text-white dark:text-primary group-hover:scale-110 transition-transform" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClassName}>
    <path d="M12 2.03998C6.48 2.03998 2 6.51998 2 12.03C2 17.08 5.64 21.22 10.44 21.88V14.89H7.9V12.03H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.03H16.34L15.89 14.89H13.56V21.87C18.36 21.22 22 17.08 22 12.03C22 6.51998 17.52 2.03998 12 2.03998Z" />
  </svg>
);

// WhatsAppIcon se mantiene definido, aunque no se use directamente en este return,
// podría ser útil si se quisiera añadir un botón de WhatsApp separado en el futuro.
// Si no se va a usar, se podría eliminar para limpiar.
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-white dark:text-primary group-hover:scale-110 transition-transform"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2.05 22L7.31 20.64C8.76 21.42 10.37 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM12.04 20.13C10.56 20.13 9.13 19.73 7.9 19L7.54 18.79L4.49 19.58L5.3 16.61L5.07 16.26C4.21 14.95 3.83 13.46 3.83 11.91C3.83 7.39 7.51 3.71 12.04 3.71C16.57 3.71 20.25 7.39 20.25 11.91C20.25 16.43 16.57 20.13 12.04 20.13ZM17.36 14.55C17.13 14.44 16.13 13.95 15.93 13.88C15.73 13.8 15.58 13.77 15.42 14C15.27 14.23 14.82 14.78 14.67 14.93C14.52 15.08 14.37 15.11 14.14 15C13.91 14.89 13.01 14.59 11.93 13.6C11.11 12.86 10.56 11.94 10.41 11.71C10.26 11.48 10.39 11.36 10.51 11.25C10.62 11.14 10.76 10.96 10.88 10.81C11 10.67 11.06 10.55 11.18 10.35C11.31 10.15 11.25 9.98 11.19 9.87C11.14 9.76 10.6 8.59 10.4 8.14C10.21 7.7 10 7.75 9.85 7.74H9.4C9.25 7.74 9.02 7.79 8.81 8.02C8.6 8.25 8.08 8.73 8.08 9.78C8.08 10.84 8.84 11.86 8.96 12C9.08 12.14 10.63 14.45 12.92 15.37C13.49 15.62 13.91 15.78 14.24 15.9C14.79 16.09 15.26 16.05 15.6 15.99C15.99 15.91 16.92 15.37 17.09 14.93C17.27 14.5 17.27 14.15 17.21 14.04C17.16 13.93 17.01 13.88 16.81 13.77C16.61 13.66 17.59 14.66 17.36 14.55Z" />
  </svg>
);
// --- Fin Iconos SVG ---

const ContactoPage = () => {
  // Personaliza estos valores
  const nombreDelNegocio = "Naye Nails";
  const numeroWhatsAppRaw = "+50249425739";
  const numeroWhatsAppParaLink = numeroWhatsAppRaw.replace(/\D/g, "");
  const urlFacebook = "https://facebook.com/profile.php?id=61575180189391";
  // const emailContacto = "contacto@nayenails.com"; // Ya no se usa
  const direccionNegocio = "123 Calle de Ensueño, Ciudad Fantasía";

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

        {/* Sección de Información de Contacto Directa */}
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

          {/* Sección de Email reemplazada por Facebook */}
          <div className="flex items-start space-x-3 p-4 bg-pink-50 dark:bg-gray-700 rounded-lg">
            <FacebookIcon iconClassName="w-7 h-7 text-primary dark:text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-textPrimary dark:text-white text-lg">Facebook / Naye Nails</h3>
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

        {/* Sección de Redes Sociales eliminada */}
        {/*
        <div className="pt-8 border-t border-gray-300 dark:border-white/20">
          <p className="text-md text-textSecondary dark:text-gray-400 mb-5">Síguenos en nuestras redes sociales:</p>
          <div className="flex justify-center items-center space-x-6">
            <a
              href={urlFacebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visítanos en Facebook"
              className="group bg-primary dark:bg-accent hover:bg-primary-dark dark:hover:bg-accent-dark p-3 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FacebookIcon iconClassName="w-6 h-6 text-white dark:text-primary group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default ContactoPage;
