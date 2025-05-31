import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import CRButton from "../components/UI/CRButton";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authIsLoadingGlobal, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || (user?.rol === "admin" ? "/admin/config" : "/admin/dashboard");

  useEffect(() => {
    if (isAuthenticated && !authIsLoadingGlobal) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authIsLoadingGlobal, navigate, from]);

  // Función para manejar cambios en el username
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    // Convertir a minúsculas y quitar espacios
    const cleanValue = value.toLowerCase().replace(/\s/g, "");
    setUsername(cleanValue);
  };

  // Función para manejar cambios en la contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    // Quitar espacios en blanco
    const cleanValue = value.replace(/\s/g, "");
    setPassword(cleanValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ username, password });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoadingGlobal && !isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-backgroundSecondary text-textPrimary p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="bg-backgroundSecondary flex flex-col justify-center items-center p-4 h-dvh -mt-16 sm:-mt-24">
      <div className="sm:mt-10 mt-0 w-full max-w-md bg-background dark:bg-gray-800 shadow-xl rounded-xl p-8 space-y-8 border border-transparent dark:border-gray-700">
        <div>
          <img className="mx-auto h-32 w-36 -mb-6 invert dark:invert-0" src="/nayeNails.svg" alt="Naye Nails Logo" />
          <h2 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold text-primary dark:text-primary tracking-tight">Bienvenido/a</h2>
          <p className="mt-2 text-center text-sm text-textSecondary dark:text-gray-300">Ingresa tus credenciales para acceder.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">
              Nombre de Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={handleUsernameChange}
              placeholder="Tu nombre de usuario"
              className="appearance-none block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-textTertiary dark:placeholder-gray-400 text-textPrimary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              disabled={isSubmitting || authIsLoadingGlobal}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-textPrimary dark:text-gray-200 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="Tu contraseña"
              className="appearance-none block w-full px-4 py-3 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-textTertiary dark:placeholder-gray-400 text-textPrimary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              disabled={isSubmitting || authIsLoadingGlobal}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-sm leading-5 text-textTertiary dark:text-gray-400 hover:text-primary dark:hover:text-primary-light focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={isSubmitting || authIsLoadingGlobal}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div>
            <CRButton
              type="submit"
              title="Ingresar Ahora"
              loading={isSubmitting}
              loadingText="Ingresando..."
              className="w-full py-3 px-4 rounded-lg shadow-md font-semibold text-base
                         bg-primary text-white
                         hover:opacity-90
                         dark:bg-primary dark:text-textPrimary dark:hover:opacity-90
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                         dark:focus:ring-offset-gray-800
                         disabled:opacity-70"
              disabled={isSubmitting || authIsLoadingGlobal}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
