import { useState, useEffect } from "react";
import useApiRequest from "../../hooks/useApiRequest";
import useScrollToTop from "../../hooks/useScrollToTop";
import CRInput from "../../components/UI/CRInput";
import CRButton from "../../components/UI/CRButton";
import CRLoader from "../../components/UI/CRLoader";
import CRModal from "../../components/UI/CRModal";
import { DynamicIcon } from "../../utils/DynamicIcon";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CRAlert from "../../components/UI/CRAlert";
import apiClient from "../../api/axios";
import HolographicLoyaltyCard from "../../components/UI/HolographicLoyaltyCard";
import IMAGELOCAL from "/nayeNails.webp";

const EditVisitasModal = ({ isOpen, onClose, tarjeta, onSave, isLoading }) => {
  const [visitas, setVisitas] = useState(0);

  useEffect(() => {
    if (tarjeta) {
      setVisitas(tarjeta.visitas_acumuladas);
    }
  }, [tarjeta]);

  if (!tarjeta) return null;

  const handleSlotClick = (index) => {
    if (tarjeta.canje_disponible) {
      CRAlert.alert({ title: "Acción no permitida", message: "Debes canjear el premio antes de modificar las visitas.", type: "warning" });
      return;
    }
    if (index + 1 === visitas) {
      setVisitas(visitas - 1);
    } else {
      setVisitas(index + 1);
    }
  };

  const handleSave = () => {
    onSave(tarjeta.id, visitas);
  };

  return (
    <CRModal isOpen={isOpen} setIsOpen={onClose} title={`Editar Visitas de ${tarjeta.nombre_cliente}`} width={window.innerWidth < 768 ? 90 : 45}>
      <div className="p-4 flex flex-col items-center">
        <HolographicLoyaltyCard
          nombreCliente={tarjeta.nombre_cliente}
          visitas={visitas}
          canjeDisponible={tarjeta.canje_disponible === 1}
          ciclosCompletados={tarjeta.ciclos_completados}
          logoUrl={IMAGELOCAL}
          isInteractive={false}
          onSlotClick={handleSlotClick}
          showCycles={true}
        />
        <div className="mt-6 flex justify-end w-full gap-2">
          <CRButton title="Cancelar" onClick={onClose} className="!bg-gray-500 text-white" disabled={isLoading} />
          <CRButton
            title="Guardar"
            onClick={handleSave}
            className="!bg-green-600 text-white shadow-lg"
            loading={isLoading}
            disabled={tarjeta.canje_disponible === 1}
          />
        </div>
      </div>
    </CRModal>
  );
};

const HistorialVisitasModal = ({ isOpen, onClose, historial, isLoading }) => {
  return (
    <CRModal isOpen={isOpen} setIsOpen={onClose} title="Historial de Visitas">
      <div className="p-4 min-h-[200px]">
        {isLoading ? (
          <CRLoader text="Cargando historial..." />
        ) : historial && historial.length > 0 ? (
          <ul className="space-y-2">
            {historial.map((visita) => (
              <li key={visita.id} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm">
                Visita #{visita.numero_visita} - {format(new Date(visita.fecha_visita), "dd/MM/yyyy HH:mm:ss", { locale: es })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay historial de visitas para esta tarjeta.</p>
        )}
      </div>
    </CRModal>
  );
};

const EstadoBadge = ({ canjeDisponible, visitas }) => {
  if (canjeDisponible) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
        Canje Disponible
      </span>
    );
  }
  if (visitas === 0) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100">
        Nueva
      </span>
    );
  }
  return (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
      En Progreso
    </span>
  );
};

const AdminFidelidadPage = () => {
  useScrollToTop();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [tarjetaParaEditar, setTarjetaParaEditar] = useState(null);
  const [historialVisitas, setHistorialVisitas] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ nombre_cliente: "", telefono_cliente: "" });

  const {
    data: tarjetas,
    isLoading,
    refetch,
  } = useApiRequest({
    queryKey: ["tarjetasFidelidad", searchTerm],
    url: "/fidelidad",
    method: "GET",
    config: { params: { search: searchTerm } },
  });

  const { mutate: addCardMutate, isLoading: isAdding } = useApiRequest({
    url: "/fidelidad",
    method: "POST",
    options: {
      onSuccess: () => {
        refetch();
        setIsAddModalOpen(false);
        setNewCardForm({ nombre_cliente: "", telefono_cliente: "" });
      },
    },
  });

  const { mutate: editVisitasMutate, isLoading: isEditing } = useApiRequest({
    method: "PUT",
    options: {
      onSuccess: () => {
        refetch();
        setIsEditModalOpen(false);
      },
    },
  });

  const { mutate: canjearMutate, isLoading: isCanjeando } = useApiRequest({
    method: "POST",
    options: { onSuccess: () => refetch() },
    successMessage: "Premio canjeado y tarjeta reiniciada.",
  });

  const handleAddCard = (e) => {
    e.preventDefault();
    addCardMutate(newCardForm);
  };

  const handleEditVisitas = (tarjetaId, visitas) => {
    editVisitasMutate({ url: `/fidelidad/${tarjetaId}/visitas`, data: { visitas } });
  };

  const handleCanjear = (tarjetaId) => {
    canjearMutate({ url: `/fidelidad/${tarjetaId}/canjear` });
  };

  const handleVerHistorial = async (tarjetaId) => {
    setIsHistoryLoading(true);
    setTarjetaParaEditar({ id: tarjetaId }); // Asigna el ID para identificar el loader
    setIsHistoryModalOpen(true);
    try {
      const response = await apiClient.get(`/fidelidad/${tarjetaId}/historial`);
      setHistorialVisitas(response.data);
    } catch (error) {
      console.log("Error al cargar historial:", error);
      CRAlert.alert({ title: "Error", message: "No se pudo cargar el historial.", type: "error" });
      setIsHistoryModalOpen(false);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openEditModal = (tarjeta) => {
    setTarjetaParaEditar(tarjeta);
    setIsEditModalOpen(true);
  };

  const openWhatsApp = (tarjeta) => {
    const { telefono_cliente, nombre_cliente, visitas_acumuladas, codigo, canje_disponible } = tarjeta;
    const numero = telefono_cliente.replace(/\D/g, "");
    const baseUrl = window.location.origin;
    const cardUrl = `${baseUrl}/fidelidad/${codigo}`;
    let mensaje = "";

    // CAMBIO: Mensajes de WhatsApp actualizados para la nueva promoción
    if (canje_disponible) {
      mensaje = `¡Felicidades ${nombre_cliente}! 🥳 Has completado tu tarjeta de fidelidad en Naye Nails. ¡Obtén un 50% de DESCUENTO en tu próxima cita! Agenda para reclamarlo. 💅\n\nPuedes ver tu tarjeta aquí: ${cardUrl}`;
    } else {
      const faltan = 4 - visitas_acumuladas; // CAMBIO: de 5 a 4
      mensaje = `¡Hola ${nombre_cliente}! 💖 Tienes ${visitas_acumuladas} visita(s) en tu tarjeta de fidelidad Naye Nails. ¡Te falta${
        faltan === 1 ? "" : "n"
      } solo ${faltan} para tu premio! 💅\n\nPuedes ver tu tarjeta aquí: ${cardUrl}`;
    }

    const url = `https://wa.me/502${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const isMutationLoading = isAdding || isEditing || isCanjeando;

  return (
    <div className="sm:px-4">
      {isMutationLoading && <CRLoader fullScreen background="bg-black/30 dark:bg-black/50" style="dots" />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-white">Tarjetas de Fidelidad</h1>
        <CRButton
          title="Registrar Cliente"
          externalIcon={<DynamicIcon name="PlusCircle" className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="!bg-primary text-white"
        />
      </div>

      <CRInput type="text" placeholder="Buscar por nombre o teléfono..." value={searchTerm} setValue={setSearchTerm} className="mb-6" />

      {isLoading ? (
        <CRLoader text="Cargando tarjetas..." />
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visitas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciclos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {tarjetas?.map((tarjeta) => (
                <tr key={tarjeta.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tarjeta.nombre_cliente}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{tarjeta.telefono_cliente}</div>
                    <div className="text-xs font-mono text-primary/70 dark:text-primary-light/70">{tarjeta.codigo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <EstadoBadge canjeDisponible={tarjeta.canje_disponible === 1} visitas={tarjeta.visitas_acumuladas} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                    {/* CAMBIO: El total de visitas ahora es 4 */}
                    {tarjeta.visitas_acumuladas} / 4
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                    {tarjeta.ciclos_completados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {tarjeta.canje_disponible === 1 && (
                      <CRButton
                        title="Canjear"
                        onlyIcon
                        externalIcon={<DynamicIcon name="Gift" className="w-4 h-4" />}
                        onClick={() => handleCanjear(tarjeta.id)}
                        className="!bg-green-500 text-white !p-1.5"
                      />
                    )}
                    <CRButton
                      title="Editar Visitas"
                      onlyIcon
                      externalIcon={<DynamicIcon name="Edit" className="w-4 h-4" />}
                      onClick={() => openEditModal(tarjeta)}
                      className="!bg-orange-500 text-white !p-1.5"
                    />
                    <CRButton
                      title="Historial"
                      onlyIcon
                      externalIcon={<DynamicIcon name="History" className="w-4 h-4" />}
                      onClick={() => handleVerHistorial(tarjeta.id)}
                      className="!bg-blue-500 text-white !p-1.5"
                      loading={isHistoryLoading && tarjetaParaEditar?.id === tarjeta.id}
                    />
                    <CRButton
                      title="WhatsApp"
                      onlyIcon
                      externalIcon={<DynamicIcon name="MessageCircle" className="w-4 h-4" />}
                      onClick={() => openWhatsApp(tarjeta)}
                      className="!bg-teal-500 text-white !p-1.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CRModal isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} title="Registrar Nuevo Cliente">
        <form onSubmit={handleAddCard} className="p-4 space-y-4">
          <CRInput
            title="Nombre del Cliente"
            value={newCardForm.nombre_cliente}
            setValue={(val) => setNewCardForm((p) => ({ ...p, nombre_cliente: val }))}
            required
          />
          <CRInput
            title="Teléfono del Cliente"
            type="number"
            value={newCardForm.telefono_cliente}
            setValue={(val) => setNewCardForm((p) => ({ ...p, telefono_cliente: val }))}
            required
          />
          <div className="flex justify-end gap-2">
            <CRButton type="button" title="Cancelar" onClick={() => setIsAddModalOpen(false)} className="!bg-gray-400" />
            <CRButton type="submit" title="Registrar" className="!bg-primary" loading={isAdding} />
          </div>
        </form>
      </CRModal>

      {tarjetaParaEditar && (
        <EditVisitasModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tarjeta={tarjetaParaEditar}
          onSave={handleEditVisitas}
          isLoading={isEditing}
        />
      )}

      <HistorialVisitasModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historial={historialVisitas}
        isLoading={isHistoryLoading}
      />
    </div>
  );
};

export default AdminFidelidadPage;
