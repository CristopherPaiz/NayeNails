import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import useApiRequest from "../../hooks/useApiRequest";
import CRLoader from "../../components/UI/CRLoader";
import CRButton from "../../components/UI/CRButton";
import CRSwitch from "../../components/UI/CRSwitch";
import CRModal from "../../components/UI/CRModal";
import CRSelect from "../../components/UI/CRSelect";
import { DynamicIcon } from "../../utils/DynamicIcon";
import CRAlert from "../../components/UI/CRAlert";
import useStoreNails from "../../store/store";

const AdminCitasPage = () => {
  const { textosColoresConfig } = useStoreNails();

  const [filtroMesAnio, setFiltroMesAnio] = useState(format(new Date(), "yyyy-MM"));
  const [filtroDiaEspecifico, setFiltroDiaEspecifico] = useState("");

  const [citas, setCitas] = useState([]);
  const [expandedCitaId, setExpandedCitaId] = useState(null);

  const [isReagendarModalOpen, setIsReagendarModalOpen] = useState(false);
  const [citaParaReagendar, setCitaParaReagendar] = useState(null);
  const [nuevaFechaReagenda, setNuevaFechaReagenda] = useState("");
  const [nuevaHoraReagenda, setNuevaHoraReagenda] = useState("");

  const defaultTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  const horaOptions = defaultTimes.map((time) => ({ label: formatTimeToAMPM(time), value: time }));

  const queryParams = useMemo(() => {
    if (filtroDiaEspecifico) {
      return { fecha: filtroDiaEspecifico };
    }
    if (filtroMesAnio) {
      const [year, month] = filtroMesAnio.split("-");
      return { anio: year, mes: month };
    }
    // Por defecto, mes actual si no hay filtros (esto ya lo maneja el backend si no se envían params)
    return { anio: format(new Date(), "yyyy"), mes: format(new Date(), "MM") };
  }, [filtroMesAnio, filtroDiaEspecifico]);

  const {
    data: citasData,
    isLoading,
    error,
    refetch,
  } = useApiRequest({
    queryKey: ["adminCitas", queryParams],
    url: "/citas/admin",
    method: "GET",
    config: { params: queryParams },
    notificationEnabled: false,
  });

  const { mutate: actualizarCitaMutate, isLoading: isUpdatingCita } = useApiRequest({
    method: "PATCH",
    options: {
      onSuccess: (data) => {
        CRAlert.alert({ title: "Éxito", message: data.message || "Cita actualizada.", type: "success" });
        refetch();
        setIsReagendarModalOpen(false);
        setCitaParaReagendar(null);
      },
      onError: (error) => {
        CRAlert.alert({ title: "Error", message: error.response?.data?.message || "No se pudo actualizar la cita.", type: "error" });
      },
    },
    notificationEnabled: false,
  });

  useEffect(() => {
    if (citasData) {
      setCitas(citasData);
    }
  }, [citasData]);

  function formatTimeToAMPM(time24) {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${minutes} ${suffix}`;
  }

  const handleToggleAceptada = (cita) => {
    actualizarCitaMutate({
      url: `/citas/admin/${cita.id}/estado`,
      data: {
        aceptada: !cita.aceptada,
        // Si se está aceptando, el estado es 'confirmada', si se des-acepta, vuelve a 'pendiente'
        estado: !cita.aceptada ? "confirmada" : "pendiente",
      },
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
      data: {
        fecha_cita: nuevaFechaReagenda,
        hora_cita: nuevaHoraReagenda,
        estado: "pendiente", // Al reagendar, vuelve a pendiente
        aceptada: 0,
      },
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
    const nombreNegocio = textosColoresConfig?.nombre_negocio || "Naye Nails";

    let mensaje;

    if (tipoMensaje === "reagenda" && citaParaReagendar) {
      const nuevaFechaFormateada = format(parseISO(nuevaFechaReagenda), "EEEE dd 'de' MMMM 'de' yyyy", { locale: es });
      const nuevaHoraFormateada = formatTimeToAMPM(nuevaHoraReagenda);

      mensaje =
        `💬 ¡Hola ${nombreCliente}! 💖\n` +
        `Tu cita en *${nombreNegocio}* ha sido reagendada ✨\n` +
        `Para ${servicio} 💅\n` +
        `📅 *${nuevaFechaFormateada}* a las *${nuevaHoraFormateada}* 🕒\n` +
        `Si tienes alguna duda, no dudes en responder este mensaje 💕`;
    } else {
      mensaje =
        `💬 ¡Hola ${nombreCliente}! 💖\n` +
        `Te confirmamos tu cita en *${nombreNegocio}* ✨\n` +
        `*Solicitaste:*\n` +
        `${servicio} 💅${notas}\n` +
        `📅 *${fechaFormateada}* a las *${horaFormateada}* 🕒\n\n` +
        `¡Te esperamos! 🌸💅💕`;
    }

    const url = `https://api.whatsapp.com/send?phone=${telefonoCliente}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const handleMonthChange = (e) => {
    setFiltroMesAnio(e.target.value);
    setFiltroDiaEspecifico(""); // Limpiar filtro de día específico
  };

  const handleSpecificDateChange = (e) => {
    setFiltroDiaEspecifico(e.target.value);
    if (e.target.value) {
      // Si se selecciona un día, limpiar el filtro de mes/año para dar prioridad al día
      const dateObj = parseISO(e.target.value);
      setFiltroMesAnio(format(dateObj, "yyyy-MM"));
    } else {
      // Si se limpia el día, volver al mes/año actual o el que estaba seleccionado
      setFiltroMesAnio(format(new Date(), "yyyy-MM"));
    }
  };

  const renderCitas = () => {
    if (isLoading) return <CRLoader text="Cargando citas..." style="dots" />;
    if (error) return <p className="text-red-500">Error al cargar citas: {error.message}</p>;
    if (citas.length === 0) return <p className="text-gray-500 dark:text-gray-400">No hay citas para la fecha o mes seleccionado.</p>;

    return (
      <div className="space-y-4">
        {citas.map((cita) => (
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
                  <DynamicIcon name="Calendar" className="inline w-4 h-4 mr-1" /> {format(parseISO(cita.fecha_cita), "dd/MM/yyyy", { locale: es })}
                  <DynamicIcon name="Clock" className="inline w-4 h-4 ml-2 mr-1" /> {formatTimeToAMPM(cita.hora_cita)}
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
                  onChange={() => handleToggleAceptada(cita)}
                  colorOn="bg-green-500"
                  colorOff="bg-yellow-500"
                  disabled={isUpdatingCita}
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
                <div className="mt-3 flex w-full gap-0">
                  <CRButton
                    title="Reagendar"
                    onClick={() => handleOpenReagendarModal(cita)}
                    className=" !bg-orange-500 hover:!bg-orange-600 text-white"
                    externalIcon={<DynamicIcon name="CalendarClock" className="w-3 h-3" />}
                    disabled={isUpdatingCita}
                  />
                  <CRButton
                    title="WhatsApp"
                    onClick={() => generarLinkWhatsApp(cita)}
                    className=" !bg-green-500 hover:!bg-green-600 text-white"
                    externalIcon={<DynamicIcon name="MessageCircle" className="w-3 h-3" />}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {(isLoading || isUpdatingCita) && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="nailPaint" />}
      <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white mb-6">Gestión de Citas</h1>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="filtroMesAnio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrar por Mes y Año:
          </label>
          <input
            type="month"
            id="filtroMesAnio"
            value={filtroMesAnio}
            onChange={handleMonthChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-textPrimary dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="filtroDiaEspecifico" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            O filtrar por Día Específico:
          </label>
          <input
            type="date"
            id="filtroDiaEspecifico"
            value={filtroDiaEspecifico}
            onChange={handleSpecificDateChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-textPrimary dark:text-white"
          />
        </div>
      </div>

      {renderCitas()}

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
              value={nuevaHoraReagenda ? horaOptions.find((h) => h.value === nuevaHoraReagenda) : null} // CRSelect espera el objeto o null
              setValue={(val) => setNuevaHoraReagenda(val?.value || "")} // CRSelect devuelve el objeto o null
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
              {/* <CRButton title="Cancelar" onClick={() => setIsReagendarModalOpen(false)} className="bg-gray-300 text-[13px] dark:bg-slate-600" /> */}
              <CRButton title="Confirmar Reagenda" onClick={handleReagendarCita} className="bg-primary" loading={isUpdatingCita} />
            </div>
          </div>
        )}
      </CRModal>
    </div>
  );
};

export default AdminCitasPage;
