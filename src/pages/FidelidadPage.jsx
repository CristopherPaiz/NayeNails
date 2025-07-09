import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import useScrollToTop from "../hooks/useScrollToTop";
import CRLoader from "../components/UI/CRLoader";
import HolographicLoyaltyCard from "../components/UI/HolographicLoyaltyCard";
import IMAGELOCAL from "/nayeNails.webp";
import { DynamicIcon } from "../utils/DynamicIcon";

const OtpInput = ({ value, onChange, onComplete }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const { value: inputValue } = e.target;
    if (!/^\d*$/.test(inputValue)) return;

    const newOtp = [...value];
    newOtp[index] = inputValue.slice(-1);
    onChange(newOtp);

    if (inputValue && index < 7) {
      inputsRef.current[index + 1].focus();
    }

    if (newOtp.join("").length === 8) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="tel"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-8 h-10 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary dark:focus:border-primary-light rounded-lg outline-none transition-all duration-200"
        />
      ))}
    </div>
  );
};

const FidelidadPage = () => {
  useScrollToTop();
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(8).fill(""));
  const [tarjeta, setTarjeta] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(!!codigo);

  useEffect(() => {
    const fetchTarjetaPorCodigo = async () => {
      if (!codigo) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/fidelidad/public/${codigo}`);
        setTarjeta(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "No se pudo cargar la tarjeta.");
        navigate("/fidelidad", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTarjetaPorCodigo();
  }, [codigo, navigate]);

  const handleSearch = async (fullPhone) => {
    if (fullPhone.length !== 8) {
      setError("Por favor, ingresa los 8 dígitos de tu teléfono.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/fidelidad/public/buscar?telefono=${fullPhone}`);
      navigate(`/fidelidad/${response.data.codigo}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Error al buscar la tarjeta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh pt-16 sm:pt-0 -mt-24 px-4 bg-backgroundSecondary dark:bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <CRLoader style="nailPaint" size="lg" text="Buscando tu tarjeta..." />
        ) : tarjeta ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary dark:text-primary-light">¡Hola de nuevo!</h1>
              <p className="text-textSecondary dark:text-gray-400 mt-1">Este es el progreso de tu tarjeta de fidelidad.</p>
            </div>
            <HolographicLoyaltyCard
              nombreCliente={tarjeta.nombre_cliente}
              visitas={tarjeta.visitas_acumuladas}
              canjeDisponible={tarjeta.canje_disponible === 1}
              logoUrl={IMAGELOCAL}
              isInteractive={true}
              showCycles={false}
            />
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>✨ Toca la tarjeta para girarla.</p>
              {/* <p>📱 Inclina tu dispositivo para ver los efectos.</p> */}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full">
              <DynamicIcon name="Sparkles" className="mx-auto h-12 w-12 text-primary dark:text-primary-light mb-4" />
              <h1 className="text-2xl font-bold text-primary dark:text-primary-light mb-2">Consulta tu Tarjeta de Fidelidad</h1>
              <p className="text-textSecondary dark:text-gray-400 mb-6">Ingresa tu número de teléfono para ver tus visitas.</p>
              <form onSubmit={(e) => e.preventDefault()}>
                <OtpInput value={otp} onChange={setOtp} onComplete={handleSearch} />
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
              </form>
            </div>
            <div className="mt-6 text-sm text-textSecondary dark:text-gray-400">
              <p>¿Aún no tienes tu tarjeta?</p>
              <Link to="/agendar-cita" className="font-semibold text-primary dark:text-primary-light hover:underline">
                Visítanos para obtener la tuya y empezar a ganar.
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FidelidadPage;
