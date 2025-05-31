import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
