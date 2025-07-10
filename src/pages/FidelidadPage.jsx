import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import useScrollToTop from "../hooks/useScrollToTop";
import CRLoader from "../components/UI/CRLoader";
import HolographicLoyaltyCard from "../components/UI/HolographicLoyaltyCard";
import IMAGELOCAL from "/nayeNails.webp";
import { DynamicIcon } from "../utils/DynamicIcon";

const OtpInput = ({ value, onChange, onComplete, length, inputType }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    let inputValue = e.target.value;

    if (inputType === "phone" && !/^\d*$/.test(inputValue)) return;
    if (inputType === "code") {
      inputValue = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    const newOtp = [...value];
    newOtp[index] = inputValue.slice(-1);
    onChange(newOtp);

    if (inputValue && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    let processedData = pastedData;

    if (inputType === "phone") {
      processedData = pastedData.replace(/\D/g, "");
    } else if (inputType === "code") {
      processedData = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (processedData.length === length) {
      const newOtp = processedData.split("");
      onChange(newOtp);
      onComplete(processedData);
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type={inputType === "phone" ? "tel" : "text"}
          pattern={inputType === "phone" ? "\\d*" : "[A-Z0-9]*"}
          maxLength="1"
          value={value[index] || ""}
          autoComplete="off"
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

  const [searchMode, setSearchMode] = useState("phone");
  const [otp, setOtp] = useState(new Array(8).fill(""));
  const [tarjeta, setTarjeta] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(!!codigo);

  useEffect(() => {
    setOtp(new Array(searchMode === "phone" ? 8 : 4).fill(""));
    setError("");
  }, [searchMode]);

  useEffect(() => {
    const fetchTarjetaPorCodigo = async () => {
      if (!codigo) {
        setTarjeta(null);
        setError("");
        setIsLoading(false);
        setOtp(new Array(searchMode === "phone" ? 8 : 4).fill(""));
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const response = await apiClient.get(`/fidelidad/public/${codigo}`);
        setTarjeta(response.data);
      } catch (err) {
        setError(err.response?.data?.message + " Verifica bien el código." || "No se pudo cargar la tarjeta.");
        setTarjeta(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTarjetaPorCodigo();
  }, [codigo, navigate, searchMode]);

  const handleComplete = async (value) => {
    setError("");
    setIsLoading(true);
    if (searchMode === "phone") {
      if (!value || value.length !== 8) {
        setError("Por favor, ingresa los 8 dígitos de tu teléfono.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`/fidelidad/public/buscar?telefono=${value}`);
        navigate(`/fidelidad/${response.data.codigo}`, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Error al buscar la tarjeta.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!value || value.length !== 4) {
        setError("Por favor, ingresa el código de 4 caracteres.");
        setIsLoading(false);
        return;
      }
      navigate(`/fidelidad/${value.toUpperCase()}`, { replace: true });
    }
  };

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === "phone" ? "code" : "phone"));
  };

  return (
    <div className="min-h-dvh pt-24 sm:pt-0 -mt-24 px-4 bg-[#f8f5f2] dark:bg-slate-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <CRLoader style="nailPaint" size="lg" text="Buscando tu tarjeta..." />
        ) : tarjeta ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary dark:text-primary-light">¡Hola de nuevo, {tarjeta.nombre_cliente}!</h1>
              <p className="text-textSecondary dark:text-gray-400 mt-1">
                {tarjeta.canje_disponible === 1
                  ? "¡Felicidades! Ya puedes reclamar tu descuento."
                  : `Te faltan ${4 - tarjeta.visitas_acumuladas} visitas para tu premio.`}
              </p>
            </div>
            <HolographicLoyaltyCard
              nombreCliente={tarjeta.nombre_cliente}
              visitas={tarjeta.visitas_acumuladas}
              ciclosCompletados={Math.floor(tarjeta.visitas_acumuladas / 4)}
              canjeDisponible={tarjeta.canje_disponible === 1}
              logoUrl={IMAGELOCAL}
              isInteractive={true}
              showCycles={false}
            />
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>✨ Toca la tarjeta para girarla.</p>
              {tarjeta.canje_disponible === 1 && <p className="font-bold text-green-600">¡Agenda tu cita para usar tu 50% de descuento!</p>}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full">
              <DynamicIcon name="Sparkles" className="mx-auto h-12 w-12 text-primary dark:text-primary-light mb-4" />
              <h1 className="text-2xl font-bold text-primary dark:text-primary-light mb-2">Consulta tu Tarjeta de Fidelidad</h1>
              <p className="text-textSecondary dark:text-gray-400 mb-6">
                {searchMode === "phone" ? "Ingresa tu número de teléfono para ver tus visitas." : "Ingresa tu código de 4 caracteres."}
              </p>
              <form onSubmit={(e) => e.preventDefault()}>
                <OtpInput value={otp} onChange={setOtp} onComplete={handleComplete} length={searchMode === "phone" ? 8 : 4} inputType={searchMode} />
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={toggleSearchMode}
                  className="text-sm text-primary dark:text-primary-light hover:underline flex items-center gap-1 mx-auto"
                >
                  <DynamicIcon name="Repeat" className="w-4 h-4" />
                  {searchMode === "phone" ? "Buscar por Código" : "Buscar por Teléfono"}
                </button>
              </div>
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
