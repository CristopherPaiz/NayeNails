// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
// Importa la nueva página
import AgendaPage from "../pages/AgendaPage";
import UbicacionPage from "../pages/UbicacionPage";
import ContactoPage from "../pages/ContactoPage";
// Ya no necesitas NailsPage si ExplorarUnasPage lo reemplaza
// import NailsPage from "../pages/NailsPage";
import NotFoundPage from "../pages/NotFoundPage";
// Ya no necesitas las DetailPage individuales para la navegación principal
// import ServiceDetailPage from "../pages/ServiceDetailPage";
// import EffectDetailPage from "../pages/EffectDetailPage";
// import ColorDetailPage from "../pages/ColorDetailPage";

// Importa la constante de la ruta base si la necesitas aquí
import { CATALOGO_BASE_PATH } from "../constants/navbar";
import Explorar from "../pages/Explorar";

const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta Principal */}
      <Route path="/" element={<HomePage />} />

      {/* NUEVA RUTA PARA EL CATÁLOGO CON FILTROS */}
      <Route path={CATALOGO_BASE_PATH} element={<Explorar />} />

      {/* Rutas Específicas (se mantienen) */}
      <Route path="/agendar-cita" element={<AgendaPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />

      {/* La ruta /nails podría redirigir a CATALOGO_BASE_PATH o ser eliminada si no se usa */}
      {/* <Route path="/nails" element={<NailsPage />} />  */}

      {/* Ruta para páginas no encontradas (404) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
