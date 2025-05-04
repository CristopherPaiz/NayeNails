// src/pages/EffectDetailPage.jsx
import { useParams, useLocation } from "react-router-dom";

const EffectDetailPage = () => {
  const { effectId } = useParams(); // Obtiene el :effectId de la URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Ejemplo: Leer un query param 'intensidad'
  const intensidadParam = queryParams.get("intensidad");

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-[50vh]">
      <h1 className="text-3xl font-bold mb-4">Detalle del Efecto</h1>
      <p className="text-xl mb-2">
        ID del Efecto: <span className="font-semibold text-primary">{effectId}</span>
      </p>
      {intensidadParam && (
        <p>
          Intensidad solicitada: <span className="font-semibold">{intensidadParam}</span>
        </p>
      )}
      <p className="mt-4">Contenido específico para el efecto "{effectId}".</p>
    </div>
  );
};

export default EffectDetailPage;
