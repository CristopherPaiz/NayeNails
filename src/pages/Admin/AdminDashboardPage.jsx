import React from "react";
import DashboardCard from "../../components/admin/DashboardCard";
import useAuthStore from "../../store/authStore";
import { capitalizeWords } from "../../utils/textUtils";

const AdminDashboardPage = () => {
  const { user } = useAuthStore();

  const dashboardData = {
    totalNails: 1250,
    monthlyVisitors: 3450,
    scheduledAppointments: 85,
  };

  const cardItems = [
    {
      title: "Total de Diseños Registrados",
      value: dashboardData.totalNails.toLocaleString(),
      iconName: "Archive",
      iconBgClass: "bg-primary/10 dark:bg-primary/20",
      iconColorClass: "text-primary dark:text-primary-light",
    },
    {
      title: "Visitas este Mes",
      value: dashboardData.monthlyVisitors.toLocaleString(),
      iconName: "Users",
      iconBgClass: "bg-tertiary/10 dark:bg-tertiary/20",
      iconColorClass: "text-tertiary dark:text-tertiary",
    },
    {
      title: "Citas Agendadas (Próximas)",
      value: dashboardData.scheduledAppointments,
      iconName: "CalendarCheck2",
      iconBgClass: "bg-secondary/20 dark:bg-secondary/30",
      iconColorClass: "text-secondary-dark dark:text-secondary",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-white">
          ¡Bienvenido(a), {user ? capitalizeWords(user.nombre ?? user.username) : "Admin"}!
        </h1>
        <p className="text-textSecondary dark:text-slate-400 mt-3">Aquí tienes un resumen de la actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardItems.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            iconName={item.iconName}
            iconBgClass={item.iconBgClass}
            iconColorClass={item.iconColorClass}
          />
        ))}
      </div>

      <div className="mt-10 p-6 bg-background dark:bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-textPrimary dark:text-white mb-4">Próximas Funcionalidades</h2>
        <p className="text-textSecondary dark:text-slate-400">Estamos trabajando para traerte más herramientas y análisis útiles. ¡Vuelve pronto!</p>
        <ul className="list-disc list-inside mt-3 text-sm text-textSecondary dark:text-slate-400 space-y-1">
          <li>Gráficos de rendimiento detallados.</li>
          <li>Gestión de usuarios avanzada.</li>
          <li>Reportes personalizables.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
