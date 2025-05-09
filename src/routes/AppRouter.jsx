// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Homepage";
import AgendaPage from "../pages/AgendaPage";
import UbicacionPage from "../pages/UbicacionPage";
import ContactoPage from "../pages/ContactoPage";
import NotFoundPage from "../pages/NotFoundPage";

import { CATALOGO_BASE_PATH } from "../constants/navbar";
import Explorar from "../pages/Explorar";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path={CATALOGO_BASE_PATH} element={<Explorar />} />

      <Route path="/agendar-cita" element={<AgendaPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
