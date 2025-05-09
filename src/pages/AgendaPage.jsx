// src/pages/AgendaPage.jsx
import { useState, useEffect, useRef } from "react"; // <--- Importa useRef
import { User, Phone, CalendarDays, Clock, Send } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import { format, getDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import useScrollToTop from "../hooks/useScrollToTop";

const AgendaPage = () => {
  useScrollToTop();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isWeekend, setIsWeekend] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", type: "success" });

  const dateInputRef = useRef(null);

  const defaultTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

  const today = new Date().toISOString().split("T")[0];

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
    if (!selectedDate || !selectedTime || isWeekend) {
      setModalContent({
        title: "¡Atención!",
        message: "Por favor, selecciona una fecha y hora válidas (no fin de semana).",
        type: "error",
      });
      setIsModalOpen(true);
      return;
    }

    const dateForDisplay = format(parseISO(selectedDate + "T00:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
    const timeForDisplay = formatTimeToAMPM(selectedTime);

    setModalContent({
      title: "¡Cita Agendada!",
      message: (
        <>
          <p className="mb-2">
            ¡Gracias <strong className="text-primary">{name || "Cliente"}</strong>!
          </p>
          <p>
            Tu cita fue agendada para el día <strong className="text-primary">{dateForDisplay}</strong> a las{" "}
            <strong className="text-primary">{timeForDisplay}</strong>.
          </p>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Te confirmaremos por WhatsApp que hemos recibido tu cita.</p>
        </>
      ),
      type: "success",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (modalContent.type === "success") {
      resetForm();
    }
  };

  // <--- 2. Función para abrir el date picker
  const handleDateContainerClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (error) {
        // Fallback para navegadores muy antiguos que no soporten showPicker()
        // o si hay algún problema inesperado.
        console.error("Error al intentar mostrar el selector de fecha:", error);
        // Como fallback, podríamos intentar enfocar el input,
        // aunque esto no garantiza que el picker se abra.
        dateInputRef.current.focus();
      }
    }
  };

  const inputTwClasses =
    "block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const iconTwClasses = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500";

  return (
    <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary">Agenda tu Cita</h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">Elige el día y la hora perfectos para tus uñas.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-background p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
        {/* ... otros inputs ... */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre Completo
          </label>
          <div className="relative mt-1">
            <div className={iconTwClasses}>
              <User size={20} />
            </div>
            <input
              type="text"
              name="name"
              id="name"
              required
              className={inputTwClasses}
              placeholder="Ej: Ana Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono
          </label>
          <div className="relative mt-1">
            <div className={iconTwClasses}>
              <Phone size={20} />
            </div>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              className={inputTwClasses}
              placeholder="Ej: 34561234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha
          </label>
          {/* --- 3. Añade onClick y cursor-pointer al div contenedor --- */}
          <div
            className="relative mt-1 cursor-pointer" // <--- Añadido cursor-pointer
            onClick={handleDateContainerClick} // <--- Añadido onClick
          >
            <div className={iconTwClasses}>
              <CalendarDays size={20} />
            </div>
            <input
              ref={dateInputRef} // <--- 4. Asigna la ref al input
              type="date"
              name="date"
              id="date"
              required
              // Nota: `pointer-events-none` aquí haría que el input no reciba foco al ser clickeado
              // directamente, lo cual podría ser deseable si SOLO queremos que el div lo abra.
              // Pero para la interacción normal (escribir fecha si se permite, etc.), no lo ponemos.
              className={`${inputTwClasses} appearance-none`}
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              // Opcional: si quieres que el click en el input también abra el picker
              // (aunque el div ya lo hace, esto puede ser redundante o causar un doble intento
              // que los navegadores suelen manejar bien).
              // onClick={(e) => e.target.showPicker?.()}
            />
          </div>
          {isWeekend && selectedDate && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">No agendamos citas los fines de semana. Por favor, elige otro día.</p>
          )}
        </div>

        {/* ... resto del formulario ... */}
        {selectedDate && !isWeekend && availableTimes.length > 0 && (
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora Disponible
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
              >
                <option value="" disabled>
                  Selecciona una hora
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeToAMPM(time)} {/* Mostrar hora en AM/PM */}
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

        <button
          type="submit"
          disabled={!selectedDate || !selectedTime || isWeekend}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-secondary dark:hover:bg-primary dark:focus:ring-offset-slate-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
          Agendar Cita
        </button>
      </form>

      <ConfirmationModal isOpen={isModalOpen} onClose={handleModalClose} title={modalContent.title} type={modalContent.type}>
        {modalContent.message}
      </ConfirmationModal>
    </div>
  );
};

export default AgendaPage;
