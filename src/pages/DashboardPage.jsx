import React from "react";
import useAuthStore from "../store/authStore";
import CRButton from "../components/UI/CRButton"; // Asumiendo que tienes este componente

const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-primary">Dashboard (Ruta Protegida)</h1>
      {user && (
        <div className="mt-4">
          <p className="text-textPrimary">Bienvenido, {user.nombre || user.username}!</p>
          <p className="text-textSecondary">ID de Usuario: {user.id}</p>
          {/* Aquí mostrarías más información o funcionalidades del dashboard */}
        </div>
      )}
      <CRButton onClick={logout} className="mt-6">
        Cerrar Sesión
      </CRButton>
    </div>
  );
};

export default DashboardPage;
