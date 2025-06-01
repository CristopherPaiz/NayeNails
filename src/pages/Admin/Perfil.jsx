import React, { useState, useEffect } from "react";
import CRInput from "../../components/UI/CRInput";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useAuthStore from "../../store/authStore";
import useApiRequest from "../../hooks/useApiRequest";
import { capitalizeWords } from "../../utils/textUtils";
import useScrollToTop from "../../hooks/useScrollToTop";

const PerfilPage = () => {
  useScrollToTop();
  const { user, checkAuthStatus } = useAuthStore();
  const [nombre, setNombre] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setNombre(user.nombre ?? "");
    }
  }, [user]);

  const updateNombreMutation = useApiRequest({
    url: "/usuarios/me/nombre", // Endpoint para actualizar nombre
    method: "PUT",
    options: {
      onSuccess: () => {
        checkAuthStatus(); // Actualizar el estado del usuario en Zustand
        setErrors({});
      },
      onError: (error) => {
        setErrors({ nombre: error.response?.data?.message ?? "Error al actualizar el nombre." });
      },
    },
    successMessage: "Nombre actualizado con éxito.",
  });

  const updatePasswordMutation = useApiRequest({
    url: "/usuarios/me/password", // Endpoint para actualizar contraseña
    method: "PUT",
    options: {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrors({});
      },
      onError: (error) => {
        setErrors({ password: error.response?.data?.message ?? "Error al actualizar la contraseña." });
      },
    },
    successMessage: "Contraseña actualizada con éxito.",
  });

  const handleNombreSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre no puede estar vacío.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    await updateNombreMutation.mutateAsync({ nombre: nombre.trim() });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "La contraseña actual es obligatoria.";
    if (!newPassword) newErrors.newPassword = "La nueva contraseña es obligatoria.";
    else if (newPassword.length < 6) newErrors.newPassword = "La nueva contraseña debe tener al menos 6 caracteres.";
    if (newPassword !== confirmNewPassword) newErrors.confirmNewPassword = "Las nuevas contraseñas no coinciden.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  const isLoading = updateNombreMutation.isPending || updatePasswordMutation.isPending;

  if (!user) {
    return <CRLoader text="Cargando perfil..." fullScreen={false} style="circle" size="lg" />;
  }

  return (
    <div className="sm:px">
      {isLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white mb-8">Perfil de {capitalizeWords(user.username)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cambiar Nombre */}
        <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-6 flex items-center">
            <DynamicIcon name="UserCog" className="w-6 h-6 mr-2 text-primary" />
            Actualizar Nombre
          </h2>
          <form onSubmit={handleNombreSubmit} className="space-y-4">
            <div>
              <CRInput
                title="Nombre Completo"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                error={errors.nombre}
                placeholder="Tu nombre completo"
              />
            </div>
            <CRButton
              type="submit"
              title="Guardar Nombre"
              className="bg-primary text-white w-full sm:w-auto"
              loading={updateNombreMutation.isPending}
            />
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-background dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-6 flex items-center">
            <DynamicIcon name="LockKeyhole" className="w-6 h-6 mr-2 text-primary" />
            Cambiar Contraseña
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <CRInput
                title="Contraseña Actual"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={errors.currentPassword}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            <div>
              <CRInput
                title="Nueva Contraseña"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <CRInput
                title="Confirmar Nueva Contraseña"
                name="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                error={errors.confirmNewPassword}
                placeholder="Repite tu nueva contraseña"
              />
            </div>
            {errors.password && <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>}
            <CRButton
              type="submit"
              title="Actualizar Contraseña"
              className="bg-primary text-white w-full sm:w-auto"
              loading={updatePasswordMutation.isPending}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
