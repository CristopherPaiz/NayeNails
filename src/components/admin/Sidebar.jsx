import React from "react";
import { NavLink } from "react-router-dom";
import { ADMIN_ITEMS } from "../../constants/navbar";
import { DynamicIcon } from "../../utils/DynamicIcon";
import useAuthStore from "../../store/authStore";

// Ahora Sidebar recibe isMobile e isAdminRoute
const Sidebar = ({ isSidebarOpen, toggleSidebar, isMobile, isAdminRoute }) => {
  const { user } = useAuthStore();

  const adminNavItems = ADMIN_ITEMS.administracion?.categorías || [];

  const baseLinkClass = "flex items-center px-4 py-2.5 rounded-lg transition-colors duration-150 ease-in-out text-sm";
  const inactiveLinkClass =
    "text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary";
  const activeLinkClass = "bg-primary text-white shadow-md font-medium";

  const handleLinkClick = () => {
    if (isSidebarOpen && isMobile) {
      // Solo cerrar si está abierto y es móvil
      toggleSidebar();
    }
  };

  // Clases base del sidebar
  let sidebarClasses = `
    fixed top-16 left-0 w-64 bg-backgroundSecondary dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
    h-[calc(100vh-4rem)]  max-h-dvh
    transform transition-transform duration-300 ease-in-out
    flex flex-col
  `;

  // Lógica de clases condicionales
  if (isMobile) {
    sidebarClasses += ` ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} z-40`;
  } else {
    // Desktop
    if (isAdminRoute) {
      sidebarClasses += " md:translate-x-0 md:sticky md:top-16 z-30"; // Visible y fijo en admin
    } else {
      sidebarClasses += " md:-translate-x-full z-30 h-dvh"; // Oculto fuera de admin en desktop
    }
  }

  return (
    <aside id="admin-sidebar-panel" className={sidebarClasses}>
      <div className="flex-grow flex flex-col">
        <nav className="flex-grow p-3 pt-4 space-y-1.5 overflow-y-auto">
          <NavLink
            to="/admin/dashboard"
            onClick={handleLinkClick}
            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
          >
            <DynamicIcon name="LayoutDashboard" className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.slug}
              to={item.slug}
              onClick={handleLinkClick}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              {item.icon && <DynamicIcon name={item.icon} className="w-5 h-5 mr-3" />}
              <span>{item.nombre}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <p className="text-xs text-slate-500 dark:text-slate-400">Conectado como:</p>
            <p className="text-sm font-medium text-textPrimary dark:text-white truncate">{user.nombre || user.username}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
