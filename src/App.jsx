// src/App.jsx
// MODIFICADO: Ahora actúa como Layout Principal y contiene el Router.
import { BrowserRouter } from "react-router-dom"; // Importa BrowserRouter aquí
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter"; // Importa el componente que define las rutas
// import useExampleStore from "./store/exampleStore"; // Importa el store de Zustand

const App = () => {
  // Ejemplo de cómo usar el store de Zustand en App (o cualquier componente)
  // const { message, setMessage, fetchMessage } = useExampleStore();

  return (
    <div className="bg-backgroundSecondary min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* <p>Zustand dice: {message}</p>
          <button onClick={() => setMessage("Nuevo mensaje desde App!")} className="bg-blue-500 text-white p-2 rounded">
            Cambiar mensaje en Zustand
          </button>
          <button onClick={fetchMessage} className="bg-green-500 text-white p-2 rounded">
            Obtener mensaje (simulación API)
          </button> */}
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
