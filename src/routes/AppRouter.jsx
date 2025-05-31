import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Homepage";
import AgendaPage from "../pages/AgendaPage";
import UbicacionPage from "../pages/UbicacionPage";
import ContactoPage from "../pages/ContactoPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import ProtectedRoute from "../layouts/ProtectedRoute";

import { CATALOGO_BASE_PATH } from "../constants/navbar";
import Explorar from "../pages/Explorar";
import Configuraciones from "../pages/Admin/Configuraciones"; // Para imágenes de carruseles/galería
import Perfil from "../pages/Admin/Perfil";
import Disenios from "../pages/Admin/Disenios";
import Categorias from "../pages/Admin/Categorias";
import TextosColoresPage from "../pages/Admin/TextosColoresPage"; // NUEVA PÁGINA

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path={CATALOGO_BASE_PATH} element={<Explorar />} />
      <Route path="/agendar-cita" element={<AgendaPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="disenios" element={<Disenios />} />
          <Route path="config" element={<Configuraciones />} /> {/* Para imágenes de carruseles/galería */}
          <Route path="textos-colores" element={<TextosColoresPage />} /> {/* NUEVA RUTA */}
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
