// src/pages/ColorDetailPage.jsx
import { useParams } from "react-router-dom";

const ColorDetailPage = () => {
  const { colorId } = useParams(); // Obtiene el :colorId de la URL

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-[50vh]">
      <h1 className="text-3xl font-bold mb-4">Detalle del Color</h1>
      <p className="text-xl">
        ID del Color: <span className="font-semibold text-primary">{colorId}</span>
      </p>
      <p className="mt-4">Contenido específico para el color "{colorId}". Puedes mostrar muestras, etc.</p>
    </div>
  );
};

export default ColorDetailPage;
