// src/App.jsx
// MODIFICADO: Ahora actúa como Layout Principal y contiene el Router.
import { BrowserRouter } from "react-router-dom"; // Importa BrowserRouter aquí
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter"; // Importa el componente que define las rutas
import useExampleStore from "./store/exampleStore"; // Importa el store de Zustand

const App = () => {
  // Ejemplo de cómo usar el store de Zustand en App (o cualquier componente)
  const messageFromZustand = useExampleStore((state) => state.message);
  const zustandSetter = useExampleStore((state) => state.setMessage); // Ejemplo de cómo obtener el setter

  console.log("Mensaje desde Zustand:", messageFromZustand);

  return (
    <BrowserRouter>
      <div className="bg-backgroundSecondary min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* <p>Zustand dice: {messageFromZustand}</p> */}
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
