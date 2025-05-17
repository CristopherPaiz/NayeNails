
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
      
      

      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", 
      });
    } catch (error) {
      
      
      
      console.error("useScrollToTop: Error al intentar hacer scroll:", error);
    }
  }, [pathname]); 

  
  return null;
};

export default useScrollToTop;
