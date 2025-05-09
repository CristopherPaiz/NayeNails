// src/hooks/useScrollToTop.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook personalizado para desplazar la ventana al inicio (0,0)
 * cada vez que el pathname de la URL cambia o el componente se monta.
 * Asegúrate de que tu aplicación esté envuelta en un Router de react-router-dom.
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      // Intenta hacer scroll. Esto es compatible con la mayoría de los navegadores.
      //   window.scrollTo(0, 0);

      // Alternativa para un scroll suave (opcional, descomentar si se prefiere):
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", // 'auto' para instantáneo, 'smooth' para animado
      });
    } catch (error) {
      // Esto podría suceder en entornos donde `window` no está completamente disponible
      // (ej. durante algunas fases de Server-Side Rendering antes de la hidratación)
      // o si `scrollTo` no está soportado, aunque es muy raro.
      console.error("useScrollToTop: Error al intentar hacer scroll:", error);
    }
  }, [pathname]); // El efecto se re-ejecuta cada vez que `pathname` cambia

  // Este hook no necesita retornar nada, ya que su propósito es un efecto secundario.
  return null;
};

export default useScrollToTop;
