import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { DynamicIcon } from "../utils/DynamicIcon";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);
  return (
    <div className="flex flex-1 pt-16">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={toggleSidebar}></div>}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto md:ml-64 transition-all duration-300 ease-in-out">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 mb-2 -mt-2 sm:-mt-4 -ml-1 text-primary dark:text-primary-light rounded-md hover:bg-primary/5 dark:hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary z-40 fixed top-18 left-2 sm:left-3" 
            aria-label="Abrir menú lateral"
          >
            <DynamicIcon name={"PanelLeftOpen"} size={24} />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
