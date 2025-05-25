import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import AppRouter from "./routes/AppRouter";
import Sidebar from "./components/admin/Sidebar";
import useStoreNails from "./store/store";
import useAuthStore from "./store/authStore";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

const AppContent = () => {
  const { adminSidebarOpen, toggleAdminSidebar } = useStoreNails();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="bg-backgroundSecondary min-h-screen flex flex-col">
      <Header />
      <div className="flex w-full -mt-9 sm:mt-0">
        {isAuthenticated && (
          <Sidebar isSidebarOpen={adminSidebarOpen} toggleSidebar={toggleAdminSidebar} isMobile={isMobile} isAdminRoute={isAdminRoute} />
        )}
        {isAuthenticated && adminSidebarOpen && isMobile && (
          <div className="fixed inset-0 bg-black/60 md:hidden" onClick={toggleAdminSidebar} aria-hidden="true" style={{ zIndex: 30 }}></div>
        )}
        <main
          className={`
            flex-grow transition-all duration-300 ease-in-out
            pt-8 w-full overflow-hidden
            ${isMobile && adminSidebarOpen ? "overflow-hidden" : ""}
            ${isAuthenticated && !isMobile && isAdminRoute ? "md:ml-4" : "ml-0"}
          `}
        >
          <AppRouter />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
