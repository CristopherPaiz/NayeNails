import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const AdminLayout = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [authIsLoading, isAuthenticated, navigate, location]);

  if (authIsLoading) {
    return <div className="flex justify-center items-center h-dvh">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-6 pt-8 pb-8">
      <Outlet />
    </div>
  );
};

export default AdminLayout;
