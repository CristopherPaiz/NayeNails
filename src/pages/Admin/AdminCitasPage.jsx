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
import ConfirmationModal from "../../components/ConfirmationModal";

function formatTimeToAMPM(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${minutes} ${suffix}`;
}

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
  onEditar,
  onEliminar,
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
                  <div className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <DynamicIcon name="Wrench" className="inline w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{cita.servicios?.map((s) => s.nombre).join(", ") || "Servicio no especificado"}</span>
                  </div>
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
                      title="Editar"
                      onClick={() => onEditar(cita)}
                      className="!bg-orange-500 hover:!bg-orange-600 text-white"
                      externalIcon={<DynamicIcon name="Edit" className="w-4 h-4" />}
                      disabled={isUpdating}
                    />
                    <CRButton
                      title="Eliminar"
                      onClick={() => onEliminar(cita)}
                      className="!bg-red-600 hover:!bg-red-700 text-white"
                      externalIcon={<DynamicIcon name="Trash2" className="w-4 h-4" />}
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [citaParaEditar, setCitaParaEditar] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre_cliente: "",
    telefono_cliente: "",
    fecha_cita: "",
    hora_cita: "",
    servicios_ids: [],
    notas: "",
    aceptada: false,
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [citaParaEliminar, setCitaParaEliminar] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [isDetallesModalOpen, setIsDetallesModalOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [addForm, setAddForm] = useState({
    nombre_cliente: "",
    telefono_cliente: "",
    fecha_cita: "",
    hora_cita: "",
    servicios_ids: [],
    notas: "",
  });
  const [resetServicioSelect, setResetServicioSelect] = useState(false);

  const [filtroDia, setFiltroDia] = useState("");
  const [filtroMes, setFiltroMes] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultTimes = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ];
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

  const { mutate: updateCitaMutate, isLoading: isUpdatingCita } = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: () => {
        refetch();
        setIsEditModalOpen(false);
        setCitaParaEditar(null);
      },
    },
    successMessage: "Cita actualizada correctamente.",
  });

  const { mutate: deleteCitaMutate, isLoading: isDeletingCita } = useApiRequest({
    method: "DELETE",
    options: {
      onSuccess: () => {
        refetch();
        setIsDeleteConfirmOpen(false);
        setCitaParaEliminar(null);
      },
    },
    successMessage: "Cita eliminada correctamente.",
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
    updateCitaMutate({
      url: `/citas/admin/${cita.id}`,
      data: { aceptada: !cita.aceptada },
    });
  };

  const handleOpenEditModal = (cita) => {
    setCitaParaEditar(cita);
    setEditForm({
      nombre_cliente: cita.nombre_cliente || "",
      telefono_cliente: cita.telefono_cliente || "",
      fecha_cita: cita.fecha_cita ? format(parseISO(cita.fecha_cita), "yyyy-MM-dd") : "",
      hora_cita: cita.hora_cita || "",
      servicios_ids: cita.servicios?.map((s) => s.id) || [],
      notas: cita.notas || "",
      aceptada: !!cita.aceptada,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateCita = () => {
    if (!citaParaEditar) return;
    if (
      !editForm.fecha_cita ||
      !editForm.hora_cita ||
      !editForm.nombre_cliente ||
      !editForm.telefono_cliente ||
      editForm.servicios_ids.length === 0
    ) {
      CRAlert.alert({ title: "Atención", message: "Todos los campos (excepto notas) son obligatorios.", type: "warning" });
      return;
    }
    updateCitaMutate({
      url: `/citas/admin/${citaParaEditar.id}`,
      data: { ...editForm },
    });
  };

  const handleOpenDeleteModal = (cita) => {
    setCitaParaEliminar(cita);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!citaParaEliminar) return;
    deleteCitaMutate({ url: `/citas/admin/${citaParaEliminar.id}` });
  };

  const generarLinkWhatsApp = (cita) => {
    const nombreCliente = cita.nombre_cliente;
    const telefonoCliente = cita.telefono_cliente.replace(/\D/g, "");
    const fechaFormateada = format(parseISO(cita.fecha_cita), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
    const horaFormateada = formatTimeToAMPM(cita.hora_cita);
    const servicios = cita.servicios?.map((s) => s.nombre).join(", ") || "el servicio solicitado";
    const notas = cita.notas ? `\n📝 Nota: '${cita.notas}'.` : "";
    const nombreNegocio = useStoreNails.getState().textosColoresConfig?.nombre_negocio || "Naye Nails";
    const mensaje = `💬 ¡Hola ${nombreCliente}! 💖\nTe confirmamos tu cita en *${nombreNegocio}* ✨\n*Solicitaste:*\n${servicios} 💅${notas}\n📅 *${fechaFormateada}* a las *${horaFormateada}* 🕒\n\n¡Te esperamos! 🌸💅💕`;
    const url = `https://api.whatsapp.com/send?phone=${telefonoCliente}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const generarLinkRecordatorio = (cita) => {
    const nombreCliente = cita.nombre_cliente;
    const telefonoCliente = cita.telefono_cliente.replace(/\D/g, "");
    const fechaFormateada = format(parseISO(cita.fecha_cita), "EEEE dd 'de' MMMM", { locale: es });
    const horaFormateada = formatTimeToAMPM(cita.hora_cita);
    const servicios = cita.servicios?.map((s) => s.nombre).join(", ") || "manicura";
    const nombreNegocio = useStoreNails.getState().textosColoresConfig?.nombre_negocio || "Naye Nails";
    const mensaje = `Hola ${nombreCliente}🌸\n📌 Te recordamos tu cita para *${servicios}* el *${fechaFormateada}* a las *${horaFormateada}* en ${nombreNegocio}.\nSi necesitas reprogramar, por favor avísanos con al menos 24 horas de anticipación. 🗓️\n\n¡Gracias por confiar en nosotros! 💕`;
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
      servicios_ids: [],
      notas: "",
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddForm({ nombre_cliente: "", telefono_cliente: "", fecha_cita: "", hora_cita: "", servicios_ids: [], notas: "" });
    setResetServicioSelect((prev) => !prev);
  };

  const handleAddFormChange = (field, value) => setAddForm((prev) => ({ ...prev, [field]: value }));
  const handleAddCitaSubmit = (e) => {
    e.preventDefault();
    const { nombre_cliente, telefono_cliente, fecha_cita, hora_cita, servicios_ids } = addForm;
    if (!nombre_cliente || !telefono_cliente || !fecha_cita || !hora_cita || servicios_ids.length === 0) {
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

  const handleEditarDesdeDetalles = () => {
    handleCloseDetallesModal();
    handleOpenEditModal(citaSeleccionada);
  };

  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIsScrolling(false);
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const deltaY = Math.abs(touchY - touchStartY);
    if (deltaY > 10) {
      setIsScrolling(true);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsScrolling(false), 100);
  };

  const isAnyLoading = isLoading || isUpdatingCita || isCreatingCita || isDeletingCita;

  return (
    <div>
      {isAnyLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="nailPaint" />}
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
            onSelecting={() => !isScrolling}
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
            .rbc-date-cell { cursor: pointer; }
            .rbc-date-cell:hover { background-color: rgba(var(--color-primary-rgb), 0.1) !important; }
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
          onEditar={handleOpenEditModal}
          onEliminar={handleOpenDeleteModal}
          onToggleAceptada={handleToggleAceptada}
          onGenerarLinkWhatsApp={generarLinkWhatsApp}
          isUpdating={isUpdatingCita || isDeletingCita}
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
            <div className="flex items-start gap-2">
              <DynamicIcon name="Wrench" className="w-5 h-5 text-primary mt-1" />
              <div>
                <strong>Servicios:</strong>
                <p className="pl-1 italic text-gray-600 dark:text-gray-400">
                  {citaSeleccionada.servicios?.map((s) => s.nombre).join(", ") || "No especificado"}
                </p>
              </div>
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
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CRButton
                title="Editar"
                onClick={handleEditarDesdeDetalles}
                className="w-full !bg-orange-500 hover:!bg-orange-600 text-white"
                externalIcon={<DynamicIcon name="Edit" className="w-4 h-4" />}
              />
              <CRButton
                title="Eliminar"
                onClick={() => {
                  handleCloseDetallesModal();
                  handleOpenDeleteModal(citaSeleccionada);
                }}
                className="w-full !bg-red-600 hover:!bg-red-700 text-white"
                externalIcon={<DynamicIcon name="Trash2" className="w-4 h-4" />}
              />
              <CRButton
                title="Recordatorio"
                onClick={() => generarLinkRecordatorio(citaSeleccionada)}
                className="w-full !bg-blue-500 hover:!bg-blue-600 text-white"
                externalIcon={<DynamicIcon name="BellRing" className="w-4 h-4" />}
              />
              <CRButton title="Cerrar" onClick={handleCloseDetallesModal} className="w-full !bg-gray-400 dark:!bg-slate-600" />
            </div>
          </div>
        )}
      </CRModal>

      <CRModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title={`Editar Cita de ${citaParaEditar?.nombre_cliente || ""}`}
        width={window.innerWidth < 768 ? 90 : 50}
      >
        {citaParaEditar && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCita();
            }}
            className="space-y-4 p-4"
          >
            <CRInput title="Nombre Cliente" value={editForm.nombre_cliente} setValue={(val) => handleEditFormChange("nombre_cliente", val)} require />
            <CRInput
              title="Teléfono Cliente"
              type="number"
              value={editForm.telefono_cliente}
              setValue={(val) => handleEditFormChange("telefono_cliente", val)}
              require
            />
            <CRInput
              title="Nueva Fecha"
              type="date"
              value={editForm.fecha_cita}
              setValue={(val) => handleEditFormChange("fecha_cita", val)}
              min={new Date().toISOString().split("T")[0]}
              require
            />
            <CRSelect
              title="Nueva Hora"
              data={horaOptions}
              value={horaOptions.find((h) => h.value === editForm.hora_cita)}
              setValue={(val) => handleEditFormChange("hora_cita", val?.value || "")}
              require
            />
            <CRSelect
              title="Servicio(s)"
              data={serviciosOptions}
              value={serviciosOptions.filter((s) => editForm.servicios_ids.includes(s.value))}
              setValue={(val) =>
                handleEditFormChange(
                  "servicios_ids",
                  val.map((v) => v.value)
                )
              }
              loading={isLoadingCategorias}
              require
              multi={true}
            />
            <CRInput title="Notas" type="textarea" value={editForm.notas} setValue={(val) => handleEditFormChange("notas", val)} />
            <div>
              <label className="flex items-center cursor-pointer select-none">
                <span className="mr-2 text-sm text-textPrimary dark:text-slate-300">Cita Confirmada</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={editForm.aceptada}
                    onChange={(e) => handleEditFormChange("aceptada", e.target.checked)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      editForm.aceptada ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                      editForm.aceptada ? "transform translate-x-full" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <CRButton type="button" title="Cancelar" onClick={() => setIsEditModalOpen(false)} className="!bg-gray-400 dark:!bg-slate-600" />
              <CRButton type="submit" title="Guardar Cambios" className="!bg-primary" loading={isUpdatingCita} />
            </div>
          </form>
        )}
      </CRModal>

      <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirmar Eliminación" type="warning">
        <p>
          ¿Estás seguro de que deseas eliminar la cita de <strong>{citaParaEliminar?.nombre_cliente}</strong>?
        </p>
        <p className="text-xs text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-textPrimary dark:text-white"
            disabled={isDeletingCita}
          />
          <CRButton title="Sí, Eliminar" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white" loading={isDeletingCita} />
        </div>
      </ConfirmationModal>

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
            title="Servicio(s) Solicitado(s)"
            data={serviciosOptions}
            value={serviciosOptions.filter((s) => addForm.servicios_ids.includes(s.value))}
            setValue={(val) =>
              handleAddFormChange(
                "servicios_ids",
                val.map((v) => v.value)
              )
            }
            placeholder="Selecciona uno o más servicios"
            loading={isLoadingCategorias}
            reset={resetServicioSelect}
            require
            multi={true}
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
