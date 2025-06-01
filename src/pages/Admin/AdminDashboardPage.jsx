import React, { useMemo } from "react";
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
import { format, subDays, startOfMonth, endOfMonth, eachMonthOfInterval, eachDayOfInterval } from "date-fns";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const AdminDashboardPage = () => {
  useScrollToTop();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { textosColoresConfig } = useStoreNails();

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
        title: "Diseños Activos",
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
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              let value;

              if (typeof context.parsed === "number") {
                value = context.parsed;
              } else if (context.parsed && typeof context.parsed.y === "number") {
                value = context.parsed.y;
              } else if (context.parsed && typeof context.parsed.x === "number") {
                value = context.parsed.x;
              } else {
                value = context.raw;
              }

              return `${label}: ${value}`;
            },
          },
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

  const visitasDiariasData = useMemo(() => {
    const labels = [];
    const dataPoints = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      labels.push(format(date, "dd MMM", { locale: es }));
      const visitData = dashboardData?.visitasDiarias?.find((v) => v.dia === format(date, "yyyy-MM-dd"));
      dataPoints.push(visitData?.total ?? 0);
    }
    return {
      labels,
      datasets: [
        {
          label: "Visitas",
          data: dataPoints,
          borderColor: themeColors.primary,
          backgroundColor: `${themeColors.primary}33`,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: themeColors.primary,
          pointBorderColor: themeColors.background,
          pointHoverBackgroundColor: themeColors.background,
          pointHoverBorderColor: themeColors.primary,
        },
      ],
    };
  }, [dashboardData?.visitasDiarias, themeColors]);

  const lineChartOptionsVisitas = useMemo(
    () => ({
      ...chartOptionsBase,
      plugins: {
        ...chartOptionsBase.plugins,
        title: { ...chartOptionsBase.plugins.title, text: "Visitas Diarias (Últimos 7 Días)" },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `Visitas: ${context.parsed.y}`;
            },
          },
        },
      },
    }),
    [chartOptionsBase]
  );

  const citasPorEstadoData = useMemo(() => {
    const labels = dashboardData?.citasPorEstado?.map((c) => capitalizeWords(c.estado)) ?? [];
    const dataPoints = dashboardData?.citasPorEstado?.map((c) => c.total) ?? [];
    const backgroundColors = [themeColors.primary, themeColors.secondary, themeColors.tertiary, "#FFCA28", "#EF5350", "#4CAF50", "#2196F3"];
    return {
      labels,
      datasets: [
        {
          label: "Citas",
          data: dataPoints,
          backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
          borderColor: themeColors.background,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [dashboardData?.citasPorEstado, themeColors]);

  const doughnutChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { ...chartOptionsBase.plugins.legend.labels, boxWidth: 15 } },
        title: { ...chartOptionsBase.plugins.title, text: "Citas por Estado (Últimos 30 Días)" },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed} citas`;
            },
          },
        },
      },
    }),
    [chartOptionsBase]
  );

  const diseniosPorCategoriaData = useMemo(() => {
    const labels = dashboardData?.diseniosPorCategoria?.map((d) => d.categoria_padre) ?? [];
    const dataPoints = dashboardData?.diseniosPorCategoria?.map((d) => d.total_disenios) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Nº de Diseños",
          data: dataPoints,
          backgroundColor: labels.map(
            (_, i) => [themeColors.primary, themeColors.secondary, themeColors.tertiary, themeColors.accent, "#4CAF50"][i % 5] + "B3"
          ),
          borderColor: labels.map((_, i) => [themeColors.primary, themeColors.secondary, themeColors.tertiary, themeColors.accent, "#4CAF50"][i % 5]),
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.diseniosPorCategoria, themeColors]);

  const barChartDiseniosOptions = useMemo(
    () => ({
      ...chartOptionsBase,
      indexAxis: "y",
      elements: { bar: { borderWidth: 2 } },
      plugins: {
        ...chartOptionsBase.plugins,
        title: { ...chartOptionsBase.plugins.title, text: "Top 5 Categorías por Nº de Diseños Activos" },
        legend: { display: false },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `Diseños: ${context.parsed.x}`;
            },
          },
        },
      },
      scales: {
        x: {
          ...chartOptionsBase.scales.x,
          suggestedMax: Math.max(...(diseniosPorCategoriaData.datasets[0]?.data || [0])) + 2,
          title: { display: true, text: "Cantidad de Diseños", color: themeColors.textSecondary },
        },
        y: { ...chartOptionsBase.scales.y, ticks: { ...chartOptionsBase.scales.y.ticks, autoSkip: false } },
      },
    }),
    [chartOptionsBase, diseniosPorCategoriaData, themeColors]
  );

  const visitasMensualesData = useMemo(() => {
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subDays(endDate, 365));
    const monthDateObjects = eachMonthOfInterval({ start: startDate, end: endDate });

    const monthLabels = monthDateObjects.map((date) => format(date, "MMM yyyy", { locale: es }));

    const dataPoints = monthDateObjects.map((dateObj) => {
      const monthYearKey = format(dateObj, "yyyy-MM");
      const visitData = dashboardData?.visitasMensuales?.find((v) => v.mes === monthYearKey);
      return visitData?.total ?? 0;
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: "Visitas Mensuales",
          data: dataPoints,
          backgroundColor: `${themeColors.tertiary}B3`,
          borderColor: themeColors.tertiary,
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.visitasMensuales, themeColors]);

  const barChartVisitasMensualesOptions = useMemo(
    () => ({
      ...chartOptionsBase,
      plugins: {
        ...chartOptionsBase.plugins,
        title: { ...chartOptionsBase.plugins.title, text: "Visitas Mensuales (Últimos 12 Meses)" },
        legend: { display: false },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `Visitas: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: { ...chartOptionsBase.scales.x, title: { display: true, text: "Mes", color: themeColors.textSecondary } },
        y: { ...chartOptionsBase.scales.y, title: { display: true, text: "Número de Visitas", color: themeColors.textSecondary } },
      },
    }),
    [chartOptionsBase, themeColors]
  );

  const citasDiariasAgendadasData = useMemo(() => {
    const labels = [];
    const dataPoints = [];
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);

    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

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
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [dashboardData?.citasDiariasAgendadas, themeColors]);

  const lineChartCitasDiariasOptions = useMemo(
    () => ({
      ...chartOptionsBase,
      plugins: {
        ...chartOptionsBase.plugins,
        title: { ...chartOptionsBase.plugins.title, text: "Citas Agendadas por Día (Últimos 30 Días)" },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `Citas Agendadas: ${context.parsed.y}`;
            },
          },
        },
      },
    }),
    [chartOptionsBase]
  );

  const serviciosMasSolicitadosData = useMemo(() => {
    const labels = dashboardData?.serviciosMasSolicitados?.map((s) => `${s.nombre_categoria_padre} - ${s.nombre_subcategoria}`) ?? [];
    const dataPoints = dashboardData?.serviciosMasSolicitados?.map((s) => s.total_citas) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Nº de Citas",
          data: dataPoints,
          backgroundColor: labels.map(
            (_, i) => [themeColors.primary, themeColors.secondary, themeColors.tertiary, "#FFCA28", "#4CAF50"][i % 5] + "B3"
          ),
          borderColor: labels.map((_, i) => [themeColors.primary, themeColors.secondary, themeColors.tertiary, "#FFCA28", "#4CAF50"][i % 5]),
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData?.serviciosMasSolicitados, themeColors]);

  const barChartServiciosOptions = useMemo(
    () => ({
      ...chartOptionsBase,
      indexAxis: "y",
      plugins: {
        ...chartOptionsBase.plugins,
        title: { ...chartOptionsBase.plugins.title, text: "Top 5 Servicios Más Solicitados (Últimos 30 Días)" },
        legend: { display: false },
        tooltip: {
          ...chartOptionsBase.plugins.tooltip,
          callbacks: {
            label: function (context) {
              return `Citas: ${context.parsed.x}`;
            },
          },
        },
      },
      scales: {
        x: {
          ...chartOptionsBase.scales.x,
          title: { display: true, text: "Cantidad de Citas", color: themeColors.textSecondary },
          suggestedMax: Math.max(...(serviciosMasSolicitadosData.datasets[0]?.data || [0])) + 2,
        },
        y: { ...chartOptionsBase.scales.y, ticks: { ...chartOptionsBase.scales.y.ticks, autoSkip: false } },
      },
    }),
    [chartOptionsBase, serviciosMasSolicitadosData, themeColors]
  );

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
        <p className="text-textSecondary dark:text-slate-400 mt-3">Aquí tienes un resumen de la actividad de Naye Nails.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
          {dashboardData?.visitasDiarias?.length > 0 ? (
            <Line options={lineChartOptionsVisitas} data={visitasDiariasData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="LineChart" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de visitas diarias.</p>
            </div>
          )}
        </div>
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[350px] sm:h-[400px]">
          {dashboardData?.citasPorEstado?.length > 0 ? (
            <Doughnut options={doughnutChartOptions} data={citasPorEstadoData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="PieChart" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de citas por estado.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
          {dashboardData?.visitasMensuales?.length > 0 ? (
            <Bar options={barChartVisitasMensualesOptions} data={visitasMensualesData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="BarChartBig" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de visitas mensuales.</p>
            </div>
          )}
        </div>
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
          {dashboardData?.citasDiariasAgendadas?.length > 0 ? (
            <Line options={lineChartCitasDiariasOptions} data={citasDiariasAgendadasData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="CalendarDays" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de citas diarias agendadas.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
          {dashboardData?.diseniosPorCategoria?.length > 0 ? (
            <Bar options={barChartDiseniosOptions} data={diseniosPorCategoriaData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="BarChartHorizontalBig" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de diseños por categoría.</p>
            </div>
          )}
        </div>
        <div className="bg-background dark:bg-slate-800 p-4 rounded-xl shadow-lg h-[400px] sm:h-[450px]">
          {dashboardData?.serviciosMasSolicitados?.length > 0 ? (
            <Bar options={barChartServiciosOptions} data={serviciosMasSolicitadosData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-textSecondary dark:text-slate-400">
              <DynamicIcon name="Sparkles" className="w-12 h-12 mb-2 opacity-50" />
              <p>No hay datos de servicios más solicitados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
