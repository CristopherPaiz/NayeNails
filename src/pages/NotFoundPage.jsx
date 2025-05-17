
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="container mx-auto px-4 py-8 pt-24 text-center min-h-[50vh]">
    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
    <h2 className="text-3xl font-semibold mb-6">Página No Encontrada</h2>
    <p className="text-textSecondary mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
    <Link to="/" className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity">
      Volver al Inicio
    </Link>
  </div>
);
export default NotFoundPage;
