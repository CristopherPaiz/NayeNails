import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    // Puedes mostrar un spinner/loader global aquí
    return <div className="flex justify-center items-center h-screen">Verificando autenticación...</div>;
  }

  if (!isAuthenticated) {
    // Redirige al login, guardando la ubicación actual para volver después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />; // Renderiza children o Outlet si se usa como layout wrapper
};

export default ProtectedRoute;
