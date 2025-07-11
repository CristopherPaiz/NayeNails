import React, { useMemo, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { format, subDays, eachDayOfInterval, parseISO, formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

import DashboardCard from "../../components/admin/DashboardCard";
import useAuthStore from "../../store/authStore";
import { capitalizeWords } from "../../utils/textUtils";
import useApiRequest from "../../hooks/useApiRequest";
import CRLoader from "../../components/UI/CRLoader";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRButton from "../../components/UI/CRButton";
import { useTheme } from "../../context/ThemeProvider";
import useStoreNails from "../../store/store";
import useScrollToTop from "../../hooks/useScrollToTop";
import apiClient from "../../api/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const formatSeconds = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
      isActive
        ? "border-primary text-primary dark:text-primary-light"
        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/50"
    }`}
  >
    <DynamicIcon name={icon} className="w-5 h-5" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-primary dark:hover:text-primary-light" title="Copiar IP">
      <DynamicIcon name={copied ? "Check" : "Copy"} className="w-3.5 h-3.5" />
    </button>
  );
};

const SessionItem = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const iconMap = {
    device: {
      mobile: { icon: "Smartphone", label: "Móvil" },
      desktop: { icon: "Monitor", label: "Escritorio" },
      tablet: { icon: "Tablet", label: "Tablet" },
      Desconocido: { icon: "HelpCircle", label: "Desconocido" },
    },
    browser: {
      Chrome: { icon: "Chrome", label: "Chrome" },
      Firefox: { icon: "Firefox", label: "Firefox" },
      Safari: { icon: "Compass", label: "Safari" },
      Edge: { icon: "Globe", label: "Edge" },
      Desconocido: { icon: "HelpCircle", label: "Desconocido" },
    },
    os: {
      Windows: { icon: "Windows", label: "Windows" },
      macOS: { icon: "Apple", label: "macOS" },
      Android: { icon: "Android", label: "Android" },
      iOS: { icon: "Apple", label: "iOS" },
      Linux: { icon: "Linux", label: "Linux" },
      Desconocido: { icon: "HelpCircle", label: "Desconocido" },
    },
  };

  const fetchDetails = useCallback(async () => {
    if (details) {
      setIsExpanded(!isExpanded);
      return;
    }
    setIsLoadingDetails(true);
    try {
      const response = await apiClient.get(`/analytics/session/${session.session_id}`);
      setDetails(response.data);
    } catch (error) {
      console.error("Error fetching session details", error);
    } finally {
      setIsLoadingDetails(false);
      setIsExpanded(true);
    }
  }, [details, isExpanded, session.session_id]);

  const duration = formatDistanceStrict(parseISO(session.last_visit), parseISO(session.first_visit), { locale: es });

  const deviceIcon = iconMap.device[session.device_type] || iconMap.device.Desconocido;
  const browserIcon = iconMap.browser[session.browser_name] || iconMap.browser.Desconocido;
  const osIcon = iconMap.os[session.os_name] || iconMap.os.Desconocido;

  return (
    <li className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-textPrimary dark:text-slate-200">{session.ip_address}</span>
            <CopyButton textToCopy={session.ip_address} />
          </div>
          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1 text-gray-500 dark:text-slate-400 text-xs">
            <span className="flex items-center gap-1" title={deviceIcon.label}>
              <DynamicIcon name={deviceIcon.icon} className="w-4 h-4" />
              {deviceIcon.label}
            </span>
            <span className="flex items-center gap-1" title={browserIcon.label}>
              <DynamicIcon name={browserIcon.icon} className="w-4 h-4" />
              {browserIcon.label}
            </span>
            <span className="flex items-center gap-1" title={osIcon.label}>
              <DynamicIcon name={osIcon.icon} className="w-4 h-4" />
              {osIcon.label}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span className="font-bold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-full text-xs">
            {session.views} vistas
          </span>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1" title={`Duración: ${duration}`}>
            {duration}
          </p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
        <button onClick={fetchDetails} disabled={isLoadingDetails} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
          {isLoadingDetails ? (
            <CRLoader style="circle" size="sm" onlyIcon />
          ) : (
            <DynamicIcon name={isExpanded ? "ChevronUp" : "ChevronDown"} className="w-3 h-3" />
          )}
          {isExpanded ? "Ocultar Rutas" : "Ver Rutas"}
        </button>
        {isExpanded && details && (
          <ol className="mt-2 space-y-1 pl-4 list-decimal list-inside">
            {details.map((visit, idx) => (
              <li key={idx} className="text-xs text-gray-600 dark:text-gray-300">
                {visit.page_path} {visit.views > 1 && <span className="font-semibold text-primary/80">(x{visit.views})</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </li>
  );
};

const TopSessionsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
        <DynamicIcon name="Hourglass" className="w-12 h-12 mb-2 opacity-50" />
        <p>No hay sesiones activas hoy aún.</p>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto h-full pr-2">
      <ul className="space-y-3">
        {data.map((session, index) => (
          <SessionItem key={index} session={session} />
        ))}
      </ul>
    </div>
  );
};

const AdminDashboardPage = () => {
  useScrollToTop();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { textosColoresConfig } = useStoreNails();
  const [activeTab, setActiveTab] = useState("general");

  const {
    data: dashboardData,
    isLoading: isLoadingData,
    error: errorData,
    refetch: refetchData,
  } = useApiRequest({
    queryKey: ["dashboardStats"],
    url: "/dashboard/estadisticas",
    method: "GET",
    notificationEnabled: false,
  });

  const themeColors = useMemo(() => {
    const mode = theme === "dark" ? "dark" : "light";
    return (
      textosColoresConfig?.configuracion_colores?.[mode] || {
        primary: "#FF65B2",
        secondary: "#FFBCE1",
        tertiary: "#C972F4",
        accent: "#FDF2F8",
        textPrimary: "#5B535B",
        textSecondary: "#764D78",
        textTertiary: "#AF9CAD",
        background: "#FFFFFF",
        backgroundSecondary: "#F9F9F9",
      }
    );
  }, [theme, textosColoresConfig]);

  const cardItems = useMemo(
    () => [
      {
        title: "Visitantes Únicos (Mes)",
        value: dashboardData?.visitantesUnicosMes?.toLocaleString() ?? "0",
        iconName: "Users",
      },
      {
        title: "Vistas de Página (Mes)",
        value: dashboardData?.totalPageViewsMes?.toLocaleString() ?? "0",
        iconName: "Eye",
      },
      {
        title: "Tasa de Rebote (Mes)",
        value: `${dashboardData?.bounceRate?.toFixed(1) ?? "0.0"}%`,
        iconName: "ZapOff",
      },
      {
        title: "Duración Media Sesión (Mes)",
        value: formatSeconds(dashboardData?.avgSessionDuration ?? 0),
        iconName: "Timer",
      },
      {
        title: "Citas Próximas",
        value: dashboardData?.citasProximas?.toLocaleString() ?? "0",
        iconName: "CalendarCheck2",
      },
      {
        title: "Diseños Activos",
        value: dashboardData?.totalDisenios?.toLocaleString() ?? "0",
        iconName: "Archive",
      },
    ],
    [dashboardData]
  );

  const chartOptionsBase = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: themeColors.textSecondary,
            font: { size: 12 },
          },
        },
        title: {
          display: true,
          color: themeColors.textPrimary,
          font: { size: 16, weight: "bold" },
        },
        tooltip: {
          enabled: true,
          backgroundColor: theme === "dark" ? "rgba(40,40,40,0.9)" : "rgba(255,255,255,0.9)",
          titleColor: themeColors.textPrimary,
          bodyColor: themeColors.textSecondary,
          borderColor: themeColors.accent,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: themeColors.textTertiary, font: { size: 10 } },
          grid: { color: `${themeColors.textTertiary}33` },
        },
        y: {
          ticks: { color: themeColors.textTertiary, font: { size: 10 } },
          grid: { color: `${themeColors.textTertiary}33` },
          beginAtZero: true,
        },
      },
    }),
    [themeColors, theme]
  );

  const visitantesDiariosData = useMemo(() => {
    const labels = [];
    const visitantesData = [];
    const vistasData = [];
    const today = new Date();
    const dateRange = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
    dateRange.forEach((date) => {
      labels.push(format(date, "dd MMM", { locale: es }));
      const dailyData = dashboardData?.visitantesDiarios?.find((v) => v.dia === format(date, "yyyy-MM-dd"));
      visitantesData.push(dailyData?.total_visitantes ?? 0);
      vistasData.push(dailyData?.total_vistas ?? 0);
    });
    return {
      labels,
      datasets: [
        {
          label: "Visitantes Únicos",
          data: visitantesData,
          borderColor: themeColors.primary,
          backgroundColor: `${themeColors.primary}33`,
          yAxisID: "y",
        },
        {
          label: "Vistas de Página",
          data: vistasData,
          borderColor: themeColors.tertiary,
          backgroundColor: `${themeColors.tertiary}33`,
          yAxisID: "y1",
        },
      ],
    };
  }, [dashboardData?.visitantesDiarios, themeColors]);

  const lineChartVisitantesOptions = useMemo(
    () => ({
      ...chartOptionsBase,
      plugins: {
        ...chartOptionsBase.plugins,
        title: {
          ...chartOptionsBase.plugins.title,
          text: "Actividad Diaria (Últimos 7 Días)",
        },
      },
      scales: {
        ...chartOptionsBase.scales,
        y: {
          ...chartOptionsBase.scales.y,
          position: "left",
          title: {
            display: true,
            text: "Visitantes",
            color: themeColors.primary,
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Vistas", color: themeColors.tertiary },
        },
      },
    }),
    [chartOptionsBase, themeColors]
  );

  const visitantesPorDispositivoData = useMemo(() => {
    const labels = dashboardData?.visitantesPorDispositivo?.map((d) => capitalizeWords(d.device_type)) ?? [];
    const dataPoints = dashboardData?.visitantesPorDispositivo?.map((d) => d.total) ?? [];
    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: [themeColors.primary, themeColors.secondary, themeColors.tertiary],
          borderColor: themeColors.background,
          borderWidth: 2,
        },
      ],
    };
  }, [dashboardData?.visitantesPorDispositivo, themeColors]);

  const doughnutChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { ...chartOptionsBase.plugins.legend.labels, boxWidth: 15 },
      },
      title: { ...chartOptionsBase.plugins.title, text: title },
    },
  });

  const topPaginasData = useMemo(() => {
    const labels = dashboardData?.topPaginas?.map((p) => p.page_path) ?? [];
    const dataPoints = dashboardData?.topPaginas?.map((p) => p.views) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Vistas",
          data: dataPoints,
          backgroundColor: `${themeColors.primary}B3`,
          borderColor: themeColors.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.topPaginas, themeColors]);

  const barChartOptions = (title, indexAxis = "x") => ({
    ...chartOptionsBase,
    indexAxis,
    plugins: {
      ...chartOptionsBase.plugins,
      title: { ...chartOptionsBase.plugins.title, text: title },
      legend: { display: false },
    },
  });

  const citasPorEstadoData = useMemo(() => {
    const labels = dashboardData?.citasPorEstado?.map((c) => capitalizeWords(c.estado)) ?? [];
    const dataPoints = dashboardData?.citasPorEstado?.map((c) => c.total) ?? [];
    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: [themeColors.primary, themeColors.secondary, themeColors.tertiary, "#FFCA28", "#EF5350"],
          borderColor: themeColors.background,
          borderWidth: 2,
        },
      ],
    };
  }, [dashboardData?.citasPorEstado, themeColors]);

  const citasDiariasAgendadasData = useMemo(() => {
    const labels = [];
    const dataPoints = [];
    const today = new Date();
    const dateRange = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });
    dateRange.forEach((date) => {
      labels.push(format(date, "dd MMM", { locale: es }));
      const citaData = dashboardData?.citasDiariasAgendadas?.find((c) => c.dia === format(date, "yyyy-MM-dd"));
      dataPoints.push(citaData?.total ?? 0);
    });
    return {
      labels,
      datasets: [
        {
          label: "Citas Agendadas",
          data: dataPoints,
          borderColor: themeColors.secondary,
          backgroundColor: `${themeColors.secondary}33`,
        },
      ],
    };
  }, [dashboardData?.citasDiariasAgendadas, themeColors]);

  const serviciosMasSolicitadosData = useMemo(() => {
    const labels = dashboardData?.serviciosMasSolicitados?.map((s) => `${s.nombre_categoria_padre} - ${s.nombre_subcategoria}`) ?? [];
    const dataPoints = dashboardData?.serviciosMasSolicitados?.map((s) => s.total_citas) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Nº de Citas",
          data: dataPoints,
          backgroundColor: `${themeColors.tertiary}B3`,
          borderColor: themeColors.tertiary,
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.serviciosMasSolicitados, themeColors]);

  const diseniosPorCategoriaData = useMemo(() => {
    const labels = dashboardData?.diseniosPorCategoria?.map((d) => d.categoria_padre) ?? [];
    const dataPoints = dashboardData?.diseniosPorCategoria?.map((d) => d.total_disenios) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Nº de Diseños",
          data: dataPoints,
          backgroundColor: `${themeColors.primary}B3`,
          borderColor: themeColors.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.diseniosPorCategoria, themeColors]);

  if (isLoadingData && !dashboardData) {
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
        <p className="text-textSecondary dark:text-slate-400 mt-3">Aquí tienes un resumen de la actividad de tu sitio web.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mb-8">
        {cardItems.map((item, index) => (
          <DashboardCard key={index} title={item.title} value={item.value} iconName={item.iconName} />
        ))}
      </div>

      <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton label="General" icon="Activity" isActive={activeTab === "general"} onClick={() => setActiveTab("general")} />
          <TabButton label="Contenido" icon="FileText" isActive={activeTab === "contenido"} onClick={() => setActiveTab("contenido")} />
          <TabButton label="Negocio" icon="Briefcase" isActive={activeTab === "negocio"} onClick={() => setActiveTab("negocio")} />
        </nav>
      </div>

      <div>
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
              <Line key="line-visitantes" options={lineChartVisitantesOptions} data={visitantesDiariosData} />
            </div>
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
              <Doughnut
                key="doughnut-dispositivos"
                options={doughnutChartOptions("Visitantes por Dispositivo (Mes)")}
                data={visitantesPorDispositivoData}
              />
            </div>
          </div>
        )}

        {activeTab === "contenido" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
              <Bar key="bar-paginas" options={barChartOptions("Páginas Más Vistas (Mes)", "y")} data={topPaginasData} />
            </div>
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
              <h3 className="text-lg font-semibold text-textPrimary dark:text-white mb-4">Top Sesiones de Hoy</h3>
              <TopSessionsTable data={dashboardData?.topSessionsToday} />
            </div>
          </div>
        )}

        {activeTab === "negocio" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
              <Doughnut key="doughnut-citas" options={doughnutChartOptions("Citas por Estado (Últimos 30 Días)")} data={citasPorEstadoData} />
            </div>
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
              <Line
                key="line-citas-diarias"
                options={{
                  ...chartOptionsBase,
                  plugins: {
                    ...chartOptionsBase.plugins,
                    title: {
                      ...chartOptionsBase.plugins.title,
                      text: "Citas Agendadas por Día (Últimos 30 Días)",
                    },
                  },
                }}
                data={citasDiariasAgendadasData}
              />
            </div>
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
              <Bar
                key="bar-servicios"
                options={barChartOptions("Top 5 Servicios Más Solicitados (Últimos 30 Días)", "y")}
                data={serviciosMasSolicitadosData}
              />
            </div>
            <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
              <Bar key="bar-disenios" options={barChartOptions("Top 5 Categorías por Nº de Diseños", "y")} data={diseniosPorCategoriaData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
