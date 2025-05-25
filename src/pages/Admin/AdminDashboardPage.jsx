import DashboardCard from "../../components/admin/DashboardCard";
import useAuthStore from "../../store/authStore";
import { capitalizeWords } from "../../utils/textUtils";
import useApiRequest from "../../hooks/useApiRequest";
import CRLoader from "../../components/UI/CRLoader";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRButton from "../../components/UI/CRButton";

const AdminDashboardPage = () => {
  const { user } = useAuthStore();

  const {
    data: dashboardData,
    isLoading: isLoadingData,
    error: errorData,
    refetch: refetchData,
  } = useApiRequest({
    queryKey: ["dashboardStats"],
    url: "/dashboard/estadisticas",
    method: "GET",
    notificationEnabled: false, // Las notificaciones de error se manejan localmente
  });

  const cardItems = [
    {
      title: "Total de Diseños Registrados",
      value: dashboardData?.totalDisenios?.toLocaleString() ?? "0",
      iconName: "Archive",
      iconBgClass: "bg-primary/10 dark:bg-primary/20",
      iconColorClass: "text-primary dark:text-primary-light",
    },
    {
      title: "Visitas este Mes",
      value: dashboardData?.visitasEsteMes?.toLocaleString() ?? "0",
      iconName: "Users",
      iconBgClass: "bg-tertiary/10 dark:bg-tertiary/20",
      iconColorClass: "text-tertiary dark:text-tertiary",
    },
    {
      title: "Citas Próximas",
      value: dashboardData?.citasProximas?.toLocaleString() ?? "0",
      iconName: "CalendarCheck2",
      iconBgClass: "bg-secondary/20 dark:bg-secondary/30",
      iconColorClass: "text-secondary-dark dark:text-secondary",
    },
  ];

  if (isLoadingData) {
    return <CRLoader text="Cargando datos del dashboard..." fullScreen={false} style="circle" size="lg" />;
  }

  if (errorData) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <DynamicIcon name="AlertTriangle" className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">Error al cargar datos del dashboard: {errorData.message ?? "Error desconocido"}</p>
        <CRButton onClick={() => refetchData()} title="Reintentar" className="mt-4 bg-primary text-white" />
      </div>
    );
  }

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
          <li>Gestión de citas completa.</li>
          <li>Reportes personalizables.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
