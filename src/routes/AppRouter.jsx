// src/routes/AppRouter.jsx
// NUEVO: Archivo central para definir las rutas de la aplicación.
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import EffectDetailPage from "../pages/EffectDetailPage";
import ColorDetailPage from "../pages/ColorDetailPage";
import AgendaPage from "../pages/AgendaPage";
import UbicacionPage from "../pages/UbicacionPage";
import ContactoPage from "../pages/ContactoPage";
import NailsPage from "../pages/NailsPage";
import NotFoundPage from "../pages/NotFoundPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta Principal */}
      <Route path="/" element={<HomePage />} />
      {/* Rutas Dinámicas para Servicios, Efectos y Colores */}
      {/* Usamos :id como parámetro dinámico en la URL */}
      <Route path="/servicios/:serviceId" element={<ServiceDetailPage />} />
      <Route path="/efectos/:effectId" element={<EffectDetailPage />} />
      <Route path="/colores/:colorId" element={<ColorDetailPage />} />
      {/* Rutas Específicas */}
      <Route path="/agendar-cita" element={<AgendaPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />
      <Route path="/nails" element={<NailsPage />} /> {/* Ruta del botón "Ver más" */}
      {/* Ruta para páginas no encontradas (404) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
