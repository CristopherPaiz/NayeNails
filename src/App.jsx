import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <div className="bg-backgroundSecondary min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
