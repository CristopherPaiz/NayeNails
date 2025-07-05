import { useState, useEffect, useMemo } from "react";
import { format, parseISO, startOfWeek, getDay, addMinutes, parse } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import useApiRequest from "../../hooks/useApiRequest";
import CRLoader from "../../components/UI/CRLoader";
import CRButton from "../../components/UI/CRButton";
import CRSwitch from "../../components/UI/CRSwitch";
import CRModal from "../../components/UI/CRModal";
import CRSelect from "../../components/UI/CRSelect";
import CRInput from "../../components/UI/CRInput";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRAlert from "../../components/UI/CRAlert";
import useStoreNails from "../../store/store";
import useScrollToTop from "../../hooks/useScrollToTop";

function formatTimeToAMPM(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${minutes} ${suffix}`;
}

// Función más robusta para ajustar la zona horaria
const ajustarZonaHoraria = (fechaServidor, horasDiferencia = 6) => {
  if (!fechaServidor) return null;

  try {
    let fecha;
    if (fechaServidor.includes("T")) {
      fecha = new Date(fechaServidor);
    } else {
      fecha = new Date(fechaServidor.replace(" ", "T"));
    }

    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaServidor);
      return new Date();
    }

    const fechaAjustada = new Date(fecha.getTime() - horasDiferencia * 60 * 60 * 1000);

    return fechaAjustada;
  } catch (error) {
    console.error("Error al ajustar zona horaria:", error);
    return new Date();
  }
};

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

const CitasLista = ({
  citas,
  onReagendar,
  onToggleAceptada,
  onGenerarLinkWhatsApp,
  isUpdating,
  isLoading,
  filtroDia,
  setFiltroDia,
  filtroMes,
  setFiltroMes,
}) => {
  const [expandedCitaId, setExpandedCitaId] = useState(null);

  const handleFiltroMesChange = (e) => {
    setFiltroMes(e.target.value);
    setFiltroDia("");
  };

  const citasMostradas = useMemo(() => {
    if (!citas) return [];
    if (filtroDia) {
      return citas.filter((c) => c.fecha_cita === filtroDia);
    }
    if (filtroMes) {
      return citas.filter((c) => c.fecha_cita.startsWith(filtroMes));
    }
    return citas;
  }, [citas, filtroDia, filtroMes]);

  if (isLoading) return <CRLoader text="Cargando citas..." style="dots" />;

  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="filtroMes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Mes:
            </label>
            <input
              type="month"
              id="filtroMes"
              value={filtroMes}
              onChange={handleFiltroMesChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-textPrimary dark:text-white"
            />
          </div>
        </div>
      </div>

      {citasMostradas.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay citas que coincidan con los filtros seleccionados.</p>
      ) : (
        <div className="space-y-4">
          {citasMostradas.map((cita) => (
            <div
              key={cita.id}
              className={`p-4 rounded-lg shadow-md ${
                cita.aceptada
                  ? "bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500"
                  : "bg-white dark:bg-slate-800 border-l-4 border-yellow-500"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-primary-light">{cita.nombre_cliente}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <DynamicIcon name="Phone" className="inline w-4 h-4 mr-1" /> {cita.telefono_cliente}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <DynamicIcon name="Calendar" className="inline w-4 h-4 mr-1" />
                    {format(parseISO(cita.fecha_cita), "EEEE, dd 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <DynamicIcon name="Clock" className="inline w-4 h-4 mr-1" /> {formatTimeToAMPM(cita.hora_cita)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <DynamicIcon name="Wrench" className="inline w-4 h-4 mr-1" />
                    {cita.nombre_categoria_padre ? `${cita.nombre_categoria_padre}: ` : ""}
                    {cita.nombre_subcategoria || "Servicio no especificado"}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <CRSwitch
                    label={cita.aceptada ? "Aceptada" : "Pendiente"}
                    checked={!!cita.aceptada}
                    onChange={() => onToggleAceptada(cita)}
                    colorOn="bg-green-500"
                    colorOff="bg-yellow-500"
                    disabled={isUpdating}
                  />
                  <CRButton
                    title="Detalles"
                    onClick={() => setExpandedCitaId(expandedCitaId === cita.id ? null : cita.id)}
                    className="!py-1 !px-2 !text-xs !bg-blue-500 hover:!bg-blue-600 text-white"
                    externalIcon={<DynamicIcon name={expandedCitaId === cita.id ? "ChevronUp" : "ChevronDown"} className="w-3 h-3" />}
                    iconPosition="right"
                  />
                </div>
              </div>
              {expandedCitaId === cita.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Notas:</strong> {cita.notas || "Ninguna"}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    <strong>Estado actual:</strong> <span className="font-medium">{cita.estado}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Fecha:</strong> {format(parseISO(cita.fecha_cita), "EEEE, dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Creada:</strong> {format(ajustarZonaHoraria(cita.fecha_creacion), "dd/MM/yyyy 'a las' h:mm a", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Última actualización:</strong>{" "}
                    {format(ajustarZonaHoraria(cita.fecha_actualizacion), "dd/MM/yyyy 'a las' h:mm a", { locale: es })}
                  </p>
                  <div className="mt-3 flex w-full gap-2">
                    <CRButton
                      title="Reagendar"
                      onClick={() => onReagendar(cita)}
                      className="!bg-orange-500 hover:!bg-orange-600 text-white"
                      externalIcon={<DynamicIcon name="CalendarClock" className="w-4 h-4" />}
                      disabled={isUpdating}
                    />
                    <CRButton
                      title="WhatsApp"
                      onClick={() => onGenerarLinkWhatsApp(cita)}
                      className="!bg-green-500 hover:!bg-green-600 text-white"
                      externalIcon={<DynamicIcon name="MessageCircle" className="w-4 h-4" />}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminCitasPage = () => {
  useScrollToTop();

  const [viewMode, setViewMode] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isReagendarModalOpen, setIsReagendarModalOpen] = useState(false);
  const [citaParaReagendar, setCitaParaReagendar] = useState(null);
  const [nuevaFechaReagenda, setNuevaFechaReagenda] = useState("");
  const [nuevaHoraReagenda, setNuevaHoraReagenda] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [addForm, setAddForm] = useState({
    nombre_cliente: "",
    telefono_cliente: "",
    fecha_cita: "",
    hora_cita: "",
    id_subcategoria_servicio: null,
    notas: "",
  });
  const [resetServicioSelect, setResetServicioSelect] = useState(false);

  const [filtroDia, setFiltroDia] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filtroMes, setFiltroMes] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  const horaOptions = defaultTimes.map((time) => ({ label: formatTimeToAMPM(time), value: time }));

  const queryParams = useMemo(() => {
    if (viewMode === "list" && filtroMes) {
      const [year, month] = filtroMes.split("-");
      return { anio: year, mes: month };
    }
    return {
      anio: format(currentDate, "yyyy"),
      mes: format(currentDate, "MM"),
    };
  }, [currentDate, viewMode, filtroMes]);

  const {
    data: citasData,
    isLoading,
    refetch,
  } = useApiRequest({
    queryKey: ["adminCitas", queryParams],
    url: "/citas/admin",
    method: "GET",
    config: { params: queryParams },
    notificationEnabled: false,
  });

  useEffect(() => {
    if (citasData) {
      const events = citasData.map((cita) => {
        const start = parseISO(`${cita.fecha_cita}T${cita.hora_cita}`);
        return {
          id: cita.id,
          title: `${formatTimeToAMPM(cita.hora_cita)} - ${cita.nombre_cliente}`,
          start,
          end: addMinutes(start, 120),
          resource: cita,
        };
      });
      setCalendarEvents(events);
    }
  }, [citasData]);

  const { data: categoriasData, isLoading: isLoadingCategorias } = useApiRequest({
    queryKey: ["categoriasPublic"],
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });
  const serviciosOptions = useMemo(() => {
    if (!categoriasData) return [];
    return categoriasData.flatMap((catPadre) =>
      catPadre.activo && catPadre.subcategorias
        ? catPadre.subcategorias.filter((sub) => sub.activo).map((sub) => ({ value: sub.id, label: `${catPadre.nombre} - ${sub.nombre}` }))
        : []
    );
  }, [categoriasData]);

  const { mutate: actualizarCitaMutate, isLoading: isUpdatingCita } = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: () => {
        refetch();
        setIsReagendarModalOpen(false);
        setCitaParaReagendar(null);
      },
    },
    successMessage: "Cita actualizada correctamente.",
  });

  const { mutate: crearCitaAdminMutate, isLoading: isCreatingCita } = useApiRequest({
    url: "/citas/admin",
    method: "POST",
    options: {
      onSuccess: () => {
        refetch();
        closeAddModal();
      },
    },
    successMessage: "Cita creada exitosamente.",
  });

  const handleToggleAceptada = (cita) => {
    actualizarCitaMutate({
      url: `/citas/admin/${cita.id}/estado`,
      data: { aceptada: !cita.aceptada, estado: !cita.aceptada ? "confirmada" : "pendiente" },
    });
  };

  const handleOpenReagendarModal = (cita) => {
    setCitaParaReagendar(cita);
    setNuevaFechaReagenda(cita.fecha_cita ? format(parseISO(cita.fecha_cita), "yyyy-MM-dd") : "");
    setNuevaHoraReagenda(cita.hora_cita || "");
    setIsReagendarModalOpen(true);
  };

  const handleReagendarCita = () => {
    if (!citaParaReagendar || !nuevaFechaReagenda || !nuevaHoraReagenda) {
      CRAlert.alert({ title: "Atención", message: "Debe seleccionar una nueva fecha y hora.", type: "warning" });
      return;
    }
    actualizarCitaMutate({
      url: `/citas/admin/${citaParaReagendar.id}/estado`,
      data: { fecha_cita: nuevaFechaReagenda, hora_cita: nuevaHoraReagenda, estado: "pendiente", aceptada: 0 },
    });
  };

  const generarLinkWhatsApp = (cita, tipoMensaje = "confirmacion") => {
    const nombreCliente = cita.nombre_cliente;
    const telefonoCliente = cita.telefono_cliente.replace(/\D/g, "");
    const fechaFormateada = format(parseISO(cita.fecha_cita), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
    const horaFormateada = formatTimeToAMPM(cita.hora_cita);
    const servicio =
      cita.nombre_categoria_padre && cita.nombre_subcategoria
        ? `${cita.nombre_categoria_padre}: ${cita.nombre_subcategoria}`
        : cita.nombre_subcategoria || "el servicio solicitado";
    const notas = cita.notas ? `\n📝 Nota: '${cita.notas}'.` : "";
    const nombreNegocio = useStoreNails.getState().textosColoresConfig?.nombre_negocio || "Naye Nails";
    let mensaje;
    if (tipoMensaje === "reagenda" && citaParaReagendar) {
      const nuevaFechaFormateada = format(parseISO(nuevaFechaReagenda), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
      const nuevaHoraFormateada = formatTimeToAMPM(nuevaHoraReagenda);
      mensaje = `💬 ¡Hola ${nombreCliente}! 💖\nTu cita en *${nombreNegocio}* ha sido reagendada ✨\nPara ${servicio} 💅\n📅 *${nuevaFechaFormateada}* a las *${nuevaHoraFormateada}* 🕒\nSi tienes alguna duda, no dudes en responder este mensaje 💕`;
    } else {
      mensaje = `💬 ¡Hola ${nombreCliente}! 💖\nTe confirmamos tu cita en *${nombreNegocio}* ✨\n*Solicitaste:*\n${servicio} 💅${notas}\n📅 *${fechaFormateada}* a las *${horaFormateada}* 🕒\n\n¡Te esperamos! 🌸💅💕`;
    }
    const url = `https://api.whatsapp.com/send?phone=${telefonoCliente}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const openAddModal = (slotInfo) => {
    let fecha = "";
    let hora = "";

    if (slotInfo) {
      fecha = format(slotInfo.start, "yyyy-MM-dd");

      if (currentView !== "month") {
        hora = format(slotInfo.start, "HH:mm");
      }
    }

    setAddForm({
      nombre_cliente: "",
      telefono_cliente: "",
      fecha_cita: fecha,
      hora_cita: hora,
      id_subcategoria_servicio: null,
      notas: "",
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddForm({ nombre_cliente: "", telefono_cliente: "", fecha_cita: "", hora_cita: "", id_subcategoria_servicio: null, notas: "" });
    setResetServicioSelect((prev) => !prev);
  };

  const handleAddFormChange = (field, value) => setAddForm((prev) => ({ ...prev, [field]: value }));
  const handleAddCitaSubmit = (e) => {
    e.preventDefault();
    const { nombre_cliente, telefono_cliente, fecha_cita, hora_cita, id_subcategoria_servicio } = addForm;
    if (!nombre_cliente || !telefono_cliente || !fecha_cita || !hora_cita || !id_subcategoria_servicio) {
      CRAlert.alert({ title: "Campos Incompletos", message: "Por favor, rellena todos los campos obligatorios.", type: "warning" });
      return;
    }
    crearCitaAdminMutate(addForm);
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource.aceptada ? "var(--color-primary)" : "var(--color-secondary)";
    const style = { backgroundColor, borderRadius: "5px", opacity: 0.9, color: "white", border: "0px", display: "block" };
    return { style };
  };

  const handleOpenDetallesModal = (cita) => {
    setCitaSeleccionada(cita);
    setIsDetallesModalOpen(true);
  };

  const handleCloseDetallesModal = () => {
    setIsDetallesModalOpen(false);
    setTimeout(() => setCitaSeleccionada(null), 300);
  };

  const handleReagendarDesdeDetalles = () => {
    handleCloseDetallesModal();
    handleOpenReagendarModal(citaSeleccionada);
  };

  ////////////////////////////////////////////////////////
  // SCROLL
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  // Agregar estas funciones antes del return del componente
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIsScrolling(false);
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const deltaY = Math.abs(touchY - touchStartY);

    // Si el movimiento es mayor a 10px, consideramos que es scroll
    if (deltaY > 10) {
      setIsScrolling(true);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsScrolling(false), 100);
  };

  ////////////////////////////////////////////////////////

  return (
    <div>
      {(isLoading || isUpdatingCita || isCreatingCita) && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="nailPaint" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Gestión de Citas</h1>
        <div className="flex gap-2">
          <CRButton
            title="Añadir Cita"
            onClick={() => openAddModal(null)}
            className="!bg-green-500 hover:!bg-green-600 text-white"
            externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
          />
        </div>
      </div>
      <div className="mb-6 flex justify-center bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
        <CRButton
          title="Calendario"
          onClick={() => setViewMode("calendar")}
          className={`w-4/3 !my-0 !rounded-full !py-1.5 ${
            viewMode === "calendar" ? "!bg-primary text-white shadow" : "!bg-transparent text-textPrimary dark:text-slate-300"
          }`}
          externalIcon={<DynamicIcon name="CalendarDays" className="w-4 h-4" />}
        />
        <CRButton
          title="Lista"
          onClick={() => setViewMode("list")}
          className={`w-4/3 !my-0 !rounded-full !py-1.5 ${
            viewMode === "list" ? "!bg-primary text-white shadow" : "!bg-transparent text-textPrimary dark:text-slate-300"
          }`}
          externalIcon={<DynamicIcon name="List" className="w-4 h-4" />}
        />
      </div>

      {viewMode === "calendar" ? (
        <div
          className="p-1 sm:p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg h-[80vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day"]}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            defaultView="month"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            onSelectEvent={(event) => handleOpenDetallesModal(event.resource)}
            onSelectSlot={(slotInfo) => {
              if (!isScrolling) {
                openAddModal(slotInfo);
              }
            }}
            selectable={!isScrolling}
            longPressThreshold={10}
            onDrillDown={(date) => {
              if (!isScrolling) {
                openAddModal({ start: date, end: date });
              }
            }}
            drilldownView={null}
            popup
            popupOffset={{ x: 10, y: 10 }}
            onSelecting={() => {
              return !isScrolling;
            }}
            formats={{
              monthHeaderFormat: (date) => format(date, "MMMM yyyy", { locale: es }),
              dayHeaderFormat: (date) => format(date, "EEEE dd/MM", { locale: es }),
              dayRangeHeaderFormat: ({ start, end }) => `${format(start, "dd", { locale: es })} - ${format(end, "dd MMMM yyyy", { locale: es })}`,
              weekdayFormat: (date) => format(date, "EEEE", { locale: es }).slice(0, 3),
              timeGutterFormat: (date) => format(date, "HH:mm", { locale: es }),
              eventTimeRangeFormat: ({ start, end }) => `${format(start, "HH:mm", { locale: es })} - ${format(end, "HH:mm", { locale: es })}`,
              agendaTimeFormat: (date) => format(date, "HH:mm", { locale: es }),
              agendaDateFormat: (date) => format(date, "EEEE dd/MM", { locale: es }),
            }}
            messages={{
              next: isMobile ? "Siguiente ►" : "►",
              previous: isMobile ? "◄ Anterior" : "◄",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay citas en este rango.",
              showMore: (total) => `+ Ver más (${total})`,
            }}
            eventPropGetter={eventStyleGetter}
          />
          <style>{`
            .rbc-event { padding: 2px 5px; font-size: 0.8rem; line-height: 1.2; }
            .rbc-toolbar button { background-color: transparent !important; color: var(--color-primary) !important; border: 1px solid var(--color-primary) !important; padding: 5px 10px !important; transition: all 0.2s; }
            .rbc-toolbar button:hover, .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background-color: var(--color-primary) !important; color: white !important; box-shadow: none !important; }
            .rbc-today { background-color: var(--color-accent) !important; }

            /* AGREGAR ESTAS LÍNEAS PARA MEJORAR LA SELECCIÓN: */
            .rbc-date-cell {
              cursor: pointer;
            }
            .rbc-date-cell:hover {
              background-color: rgba(var(--color-primary-rgb), 0.1) !important;
            }
            /* FIN DE LÍNEAS A AGREGAR */

            @media (max-width: 768px) {
              .rbc-toolbar { flex-direction: column; gap: 8px; }
              .rbc-toolbar .rbc-btn-group:first-child { display: flex; justify-content: space-between; width: 100%; }
              .rbc-toolbar .rbc-toolbar-label { font-size: 1.1rem; padding-bottom: 8px; }
              .rbc-event, .rbc-day-slot .rbc-background-event { font-size: 0.65rem; }
              .rbc-header { padding: 4px 1px; font-size: 0.75rem; }
            }
          `}</style>
        </div>
      ) : (
        <CitasLista
          citas={citasData}
          onReagendar={handleOpenReagendarModal}
          onToggleAceptada={handleToggleAceptada}
          onGenerarLinkWhatsApp={generarLinkWhatsApp}
          isUpdating={isUpdatingCita}
          isLoading={isLoading}
          filtroDia={filtroDia}
          setFiltroDia={setFiltroDia}
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
        />
      )}

      <CRModal
        isOpen={isDetallesModalOpen}
        setIsOpen={handleCloseDetallesModal}
        title="Detalles de la Cita"
        width={window.innerWidth < 768 ? 90 : 50}
      >
        {citaSeleccionada && (
          <div className="p-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <DynamicIcon name="User" className="w-5 h-5 text-primary" />
              <p>
                <strong>Cliente:</strong> {citaSeleccionada.nombre_cliente}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DynamicIcon name="Phone" className="w-5 h-5 text-primary" />
              <p>
                <strong>Teléfono:</strong> {citaSeleccionada.telefono_cliente}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DynamicIcon name="Calendar" className="w-5 h-5 text-primary" />
              <p>
                <strong>Fecha:</strong> {format(parseISO(citaSeleccionada.fecha_cita), "EEEE, dd 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DynamicIcon name="Clock" className="w-5 h-5 text-primary" />
              <p>
                <strong>Hora:</strong> {formatTimeToAMPM(citaSeleccionada.hora_cita)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DynamicIcon name="Wrench" className="w-5 h-5 text-primary" />
              <p>
                <strong>Servicio:</strong>
                {` ${citaSeleccionada.nombre_categoria_padre || ""}: ${citaSeleccionada.nombre_subcategoria || "No especificado"}`}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <DynamicIcon name="FileText" className="w-5 h-5 text-primary mt-1" />
              <div>
                <strong>Notas:</strong>
                <p className="pl-1 italic text-gray-600 dark:text-gray-400">{citaSeleccionada.notas || "Sin notas adicionales."}</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 font-semibold ${
                citaSeleccionada.aceptada ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              <DynamicIcon name={citaSeleccionada.aceptada ? "CheckCircle" : "Clock"} className="w-5 h-5" />
              <p>
                <strong>Estado:</strong> {citaSeleccionada.estado}
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <CRButton
                title="Reagendar Cita"
                onClick={handleReagendarDesdeDetalles}
                className="w-full !bg-orange-500 hover:!bg-orange-600 text-white"
                externalIcon={<DynamicIcon name="CalendarClock" className="w-4 h-4" />}
              />
              <CRButton title="Cerrar" onClick={handleCloseDetallesModal} className="w-full !bg-gray-400 dark:!bg-slate-600" />
            </div>
          </div>
        )}
      </CRModal>
      <CRModal
        isOpen={isReagendarModalOpen}
        setIsOpen={setIsReagendarModalOpen}
        title={`Reagendar Cita de ${citaParaReagendar?.nombre_cliente || ""}`}
        width={window.innerWidth < 768 ? 90 : 40}
      >
        {citaParaReagendar && (
          <div className="space-y-4 p-2">
            <div>
              <label htmlFor="nuevaFechaReagenda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva Fecha para la Cita:
              </label>
              <input
                type="date"
                id="nuevaFechaReagenda"
                value={nuevaFechaReagenda}
                onChange={(e) => setNuevaFechaReagenda(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-textPrimary dark:text-white"
              />
            </div>
            <CRSelect
              title="Nueva Hora para la Cita"
              data={horaOptions}
              value={horaOptions.find((h) => h.value === nuevaHoraReagenda)}
              setValue={(val) => setNuevaHoraReagenda(val?.value || "")}
              placeholder="Selecciona nueva hora"
              clearable={false}
            />
            <CRButton
              title="Notificar Reagenda por WhatsApp"
              onClick={() => generarLinkWhatsApp(citaParaReagendar, "reagenda")}
              className="w-full !bg-green-500 hover:!bg-green-600 mt-2"
              externalIcon={<DynamicIcon name="MessageCircle" className="w-4 h-4" />}
              disabled={!nuevaFechaReagenda || !nuevaHoraReagenda || isUpdatingCita}
            />
            <div className="flex">
              <CRButton title="Confirmar Reagenda" onClick={handleReagendarCita} className="bg-primary" loading={isUpdatingCita} />
            </div>
          </div>
        )}
      </CRModal>
      <CRModal isOpen={isAddModalOpen} setIsOpen={closeAddModal} title="Añadir Nueva Cita" width={window.innerWidth < 768 ? 90 : 50}>
        <form onSubmit={handleAddCitaSubmit} className="space-y-4 p-4">
          <CRInput title="Nombre del Cliente" value={addForm.nombre_cliente} setValue={(val) => handleAddFormChange("nombre_cliente", val)} require />
          <CRInput
            title="Teléfono del Cliente"
            type="number"
            value={addForm.telefono_cliente}
            setValue={(val) => handleAddFormChange("telefono_cliente", val)}
            require
          />
          <CRInput
            title="Fecha de la Cita"
            type="date"
            value={addForm.fecha_cita}
            setValue={(val) => handleAddFormChange("fecha_cita", val)}
            min={new Date().toISOString().split("T")[0]}
            require
          />
          <CRSelect
            title="Hora de la Cita"
            data={horaOptions}
            value={horaOptions.find((h) => h.value === addForm.hora_cita)}
            setValue={(val) => handleAddFormChange("hora_cita", val?.value || "")}
            placeholder="Selecciona una hora"
            require
          />
          <CRSelect
            title="Servicio Solicitado"
            data={serviciosOptions}
            value={serviciosOptions.find((s) => s.value === addForm.id_subcategoria_servicio)}
            setValue={(val) => handleAddFormChange("id_subcategoria_servicio", val?.value || null)}
            placeholder="Selecciona un servicio"
            loading={isLoadingCategorias}
            reset={resetServicioSelect}
            require
          />
          <CRInput title="Notas (Opcional)" type="textarea" value={addForm.notas} setValue={(val) => handleAddFormChange("notas", val)} />
          <div className="flex justify-end gap-3 pt-4">
            <CRButton title="Cancelar" type="button" onClick={closeAddModal} className="!bg-gray-400 dark:!bg-slate-600" />
            <CRButton title="Guardar Cita" type="submit" className="!bg-primary" loading={isCreatingCita} />
          </div>
        </form>
      </CRModal>
    </div>
  );
};

export default AdminCitasPage;
