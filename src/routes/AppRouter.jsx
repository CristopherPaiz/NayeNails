// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Homepage";
import AgendaPage from "../pages/AgendaPage";
import UbicacionPage from "../pages/UbicacionPage";
import ContactoPage from "../pages/ContactoPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage"; // Importar LoginPage
import DashboardPage from "../pages/DashboardPage"; // Importar DashboardPage (ejemplo)
import ProtectedRoute from "../layouts/ProtectedRoute"; // Importar ProtectedRoute

import { CATALOGO_BASE_PATH } from "../constants/navbar";
import Explorar from "../pages/Explorar";

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path={CATALOGO_BASE_PATH} element={<Explorar />} />
      <Route path="/agendar-cita" element={<AgendaPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Envuelve las rutas que quieres proteger */}
        {/* Ejemplo: <Route path="/admin" element={<AdminPage />} /> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Puedes agregar más rutas protegidas aquí */}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
