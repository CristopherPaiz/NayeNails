import { useState, useEffect, useRef, useMemo } from "react";
import { User, Phone, CalendarDays, Clock, Send, MessageSquareText, Loader2 } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import { format, getDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import useScrollToTop from "../hooks/useScrollToTop";
import CRInput from "../components/UI/CRInput";
import CRSelect from "../components/UI/CRSelect";
import useApiRequest from "../hooks/useApiRequest";
import CRAlert from "../components/UI/CRAlert";

const AgendaPage = () => {
  useScrollToTop();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [notes, setNotes] = useState("");

  const [availableTimes, setAvailableTimes] = useState([]);
  const [isWeekend, setIsWeekend] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", type: "success" });

  const dateInputRef = useRef(null);
  const [resetServicioSelect, setResetServicioSelect] = useState(false);

  const defaultTimes = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];
  const today = new Date().toISOString().split("T")[0];

  const { data: categoriasData, isLoading: isLoadingCategorias } = useApiRequest({
    queryKey: ["categoriasPublic"],
    url: "/categorias",
    method: "GET",
    notificationEnabled: false,
  });

  const { mutate: crearCitaMutation, isLoading: isCreatingCita } = useApiRequest({
    url: "/citas",
    method: "POST",
    options: {
      onSuccess: () => {
        const dateForDisplay = format(parseISO(selectedDate + "T00:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
        const timeForDisplay = formatTimeToAMPM(selectedTime);
        const serviciosNombres = selectedServicios.map((s) => s.label.split(" - ")[1]).join(", ");
        setModalContent({
          title: "¡Cita Agendada!",
          message: (
            <>
              <p className="mb-2">
                ¡Gracias <strong className="text-primary">{name || "Cliente"}</strong>!
              </p>
              <p>
                Tu cita para <strong className="text-primary">{serviciosNombres}</strong> fue agendada para el día{" "}
                <strong className="text-primary">{dateForDisplay}</strong> a las <strong className="text-primary">{timeForDisplay}</strong>.
              </p>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Te confirmaremos por WhatsApp que hemos recibido tu cita.</p>
            </>
          ),
          type: "success",
        });
        setIsModalOpen(true);
      },
      onError: (error) => {
        CRAlert.alert({ title: "Error al Agendar", message: error.response?.data?.message || "No se pudo crear la cita.", type: "error" });
      },
    },
    notificationEnabled: false,
  });

  const serviciosOptions = useMemo(() => {
    if (!categoriasData) return [];
    const options = [];
    categoriasData.forEach((catPadre) => {
      if (catPadre.activo && catPadre.subcategorias && catPadre.subcategorias.length > 0) {
        catPadre.subcategorias.forEach((sub) => {
          if (sub.activo) {
            options.push({ value: sub.id, label: `${catPadre.nombre} - ${sub.nombre}` });
          }
        });
      }
    });
    return options;
  }, [categoriasData]);

  const formatTimeToAMPM = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${minutes} ${suffix}`;
  };

  useEffect(() => {
    if (selectedDate) {
      const dateObj = parseISO(selectedDate + "T00:00:00");
      const dayOfWeek = getDay(dateObj);

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setIsWeekend(true);
        setAvailableTimes([]);
        setSelectedTime("");
      } else {
        setIsWeekend(false);
        setAvailableTimes(defaultTimes);
        if (!defaultTimes.includes(selectedTime)) {
          setSelectedTime("");
        }
      }
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
      setIsWeekend(false);
    }
  }, [selectedDate, selectedTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCreatingCita) return;

    if (!selectedDate || !selectedTime || isWeekend || selectedServicios.length === 0 || !name.trim() || !phone.trim()) {
      setModalContent({
        title: "¡Atención!",
        message: "Por favor, completa todos los campos obligatorios (*), y selecciona una fecha y hora válidas (no fin de semana).",
        type: "error",
      });
      setIsModalOpen(true);
      return;
    }

    crearCitaMutation({
      nombre_cliente: name,
      telefono_cliente: phone,
      fecha_cita: selectedDate,
      hora_cita: selectedTime,
      servicios_ids: selectedServicios.map((s) => s.value),
      notas: notes,
    });
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedServicios([]);
    setNotes("");
    setResetServicioSelect((prev) => !prev);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (modalContent.type === "success") {
      resetForm();
    }
  };

  const handleDateContainerClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (error) {
        console.error("Error al intentar mostrar el selector de fecha:", error);
        dateInputRef.current.focus();
      }
    }
  };

  const inputTwClasses =
    "block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const iconTwClasses = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500";

  const isSubmitButtonDisabled =
    isCreatingCita ||
    isLoadingCategorias ||
    !name.trim() ||
    !phone.trim() ||
    !selectedDate ||
    !selectedTime ||
    isWeekend ||
    selectedServicios.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary">Agenda tu Cita</h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">Elige el día y la hora perfectos para tus uñas.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-background p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
        <CRInput
          title="Nombre Completo *"
          type="text"
          placeholder="Ej: Ana Pérez"
          value={name}
          setValue={setName}
          disabled={isCreatingCita}
          classNameWrapper="!py-0"
          id="name-agenda"
          autoComplete="name"
          icon={<User size={20} className="text-gray-400 dark:text-gray-500" />}
          required
        />

        <CRInput
          title="Teléfono *"
          type="number"
          placeholder="Ej: 34561234"
          value={phone}
          setValue={setPhone}
          disabled={isCreatingCita}
          classNameWrapper="!py-0"
          id="phone-agenda"
          autoComplete="tel"
          icon={<Phone size={20} className="text-gray-400 dark:text-gray-500" />}
          required
        />

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha *
          </label>
          <div className="relative mt-1 cursor-pointer" onClick={handleDateContainerClick}>
            <div className={iconTwClasses}>
              <CalendarDays size={20} />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              name="date"
              id="date"
              required
              className={`${inputTwClasses} appearance-none`}
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isCreatingCita}
            />
          </div>
          {isWeekend && selectedDate && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">No agendamos citas los fines de semana. Por favor, elige otro día.</p>
          )}
        </div>

        {selectedDate && !isWeekend && availableTimes.length > 0 && (
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora Disponible *
            </label>
            <div className="relative mt-1">
              <div className={iconTwClasses}>
                <Clock size={20} />
              </div>
              <select
                name="time"
                id="time"
                required
                className={`${inputTwClasses} appearance-none`}
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={isCreatingCita}
              >
                <option value="" disabled>
                  Selecciona una hora
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeToAMPM(time)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
        {selectedDate && !isWeekend && availableTimes.length === 0 && (
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">No hay horarios disponibles para este día. Prueba otra fecha.</p>
        )}

        <CRSelect
          title="Servicio(s) a Solicitar *"
          data={serviciosOptions}
          setValue={setSelectedServicios}
          value={selectedServicios}
          placeholder="Selecciona uno o más servicios..."
          labelField="label"
          valueField="value"
          disabled={isLoadingCategorias || isCreatingCita}
          loading={isLoadingCategorias}
          loadingText="Cargando servicios..."
          clearable={true}
          searchable={true}
          reset={resetServicioSelect}
          require
          multi={true}
          onlySelectValues={false}
        />

        <CRInput
          title="Notas Adicionales (opcional)"
          type="textarea"
          placeholder="Ej: Diseño específico, alergias, etc."
          value={notes}
          setValue={setNotes}
          disabled={isCreatingCita}
          classNameWrapper="!py-0"
          id="notes-agenda"
          icon={<MessageSquareText size={20} className="text-gray-400 dark:text-gray-500" />}
        />

        <button
          type="submit"
          disabled={isSubmitButtonDisabled}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:hover:bg-primary dark:focus:ring-offset-slate-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
        >
          {isCreatingCita ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Agendando...
            </>
          ) : (
            <>
              <Send size={18} />
              Agendar Cita
            </>
          )}
        </button>
      </form>

      <ConfirmationModal isOpen={isModalOpen} onClose={handleModalClose} title={modalContent.title} type={modalContent.type}>
        {modalContent.message}
      </ConfirmationModal>
    </div>
  );
};

export default AgendaPage;
