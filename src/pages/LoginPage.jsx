// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import CRButton from "../components/UI/CRButton";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Iconos para ver/ocultar contraseña y loader

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authIsLoadingGlobal, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader específico para el submit del login

  const from = location.state?.from?.pathname || (user?.rol === "admin" ? "/admin/dashboard" : "/dashboard");

  useEffect(() => {
    if (isAuthenticated && !authIsLoadingGlobal) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authIsLoadingGlobal, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      // CRAlert ya está integrado en authStore para errores de API,
      // pero podrías añadir una alerta local para validación de campos vacíos si prefieres.
      // CRAlert.alert({ title: "Campos Requeridos", message: "Por favor, ingresa tu usuario y contraseña.", type: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ username, password });
      // La redirección se maneja en el useEffect
    } catch (error) {
      console.log(error);
      // El error ya es manejado por CRAlert en authStore
      // El campo de contraseña podría limpiarse aquí si se desea tras un fallo
      // setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el estado de autenticación global se está cargando (ej. checkAuthStatus)
  // Y el usuario aún no está autenticado, muestra un loader de página completa.
  if (authIsLoadingGlobal && !isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-sky-400 mb-4" />
        <p className="text-xl">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-xl p-8 space-y-8">
        <div>
          {/* Puedes agregar un logo aquí si quieres */}
          {/* <img className="mx-auto h-12 w-auto" src="/path-to-your-logo.svg" alt="Your Company" /> */}
          <h2 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Bienvenido de Nuevo</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Ingresa tus credenciales para acceder.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-sky-300 sr-only" // sr-only si usas placeholder como label visual
            >
              Nombre de Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de Usuario"
              className="appearance-none block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
              disabled={isSubmitting || authIsLoadingGlobal}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-sky-300 sr-only">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="appearance-none block w-full px-4 py-3 pr-10 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
              disabled={isSubmitting || authIsLoadingGlobal}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-400 hover:text-sky-300 focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={isSubmitting || authIsLoadingGlobal}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Opcional: Link para "Olvidé mi contraseña" */}
          {/* <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="#" className="font-medium text-sky-400 hover:text-sky-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div> */}

          <div>
            <CRButton
              type="submit"
              title={isSubmitting ? "Ingresando..." : "Ingresar Ahora"}
              loading={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-transform transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting || authIsLoadingGlobal}
            ></CRButton>
          </div>
        </form>

        {/* Opcional: Link para registrarse */}
        {/* <p className="mt-8 text-center text-sm text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300">
            Regístrate aquí
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;
