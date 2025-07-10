import { useState, useEffect, useRef } from "react";
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
import Paginador from "../../components/UI/Paginador";
import ConfirmationModal from "../../components/ConfirmationModal";

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

const EditCardModal = ({ isOpen, onClose, tarjeta, onSave, isLoading }) => {
  const [form, setForm] = useState({ nombre_cliente: "", telefono_cliente: "" });

  useEffect(() => {
    if (tarjeta) {
      setForm({
        nombre_cliente: tarjeta.nombre_cliente || "",
        telefono_cliente: tarjeta.telefono_cliente || "",
      });
    }
  }, [tarjeta]);

  if (!tarjeta) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(tarjeta.id, form);
  };

  return (
    <CRModal isOpen={isOpen} setIsOpen={onClose} title={`Editar Datos de ${tarjeta.nombre_cliente}`}>
      <form onSubmit={handleSave} className="p-4 space-y-4">
        <CRInput title="Nombre del Cliente" value={form.nombre_cliente} setValue={(val) => handleChange("nombre_cliente", val)} required />
        <CRInput
          title="Teléfono del Cliente"
          type="number"
          value={form.telefono_cliente}
          setValue={(val) => handleChange("telefono_cliente", val)}
          required
        />
        <div className="flex justify-end gap-2 pt-2">
          <CRButton type="button" title="Cancelar" onClick={onClose} className="!bg-gray-400" disabled={isLoading} />
          <CRButton type="submit" title="Guardar Cambios" className="!bg-primary" loading={isLoading} />
        </div>
      </form>
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
      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
        Canje Disponible
      </span>
    );
  }
  if (visitas === 0) {
    return (
      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100">
        Nueva
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
      En Progreso
    </span>
  );
};

const CopyableCode = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    CRAlert.alert({ title: "Copiado", message: `Código ${code} copiado al portapapeles.`, type: "success", duration: 2000 });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="px-2 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-mono rounded">{code}</span>
      <button onClick={handleCopy} title="Copiar código" className="text-gray-400 hover:text-primary dark:hover:text-primary-light">
        <DynamicIcon name={isCopied ? "Check" : "Copy"} className="w-4 h-4" />
      </button>
    </div>
  );
};

const ActionsDropdown = ({ tarjeta, onEditVisits, onEditCard, onHistory, onWhatsApp, onDelete, onCanjear, isHistoryLoading, currentCardLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionClass, setPositionClass] = useState("origin-top-right right-0 mt-2");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setPositionClass("origin-bottom-right right-0 bottom-full mb-2");
      } else {
        setPositionClass("origin-top-right right-0 mt-2");
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleActionClick = (action) => {
    action(tarjeta);
    setIsOpen(false);
  };

  const actionItems = [
    tarjeta.canje_disponible === 1 && {
      label: "Canjear Premio",
      icon: "Gift",
      action: () => handleActionClick(onCanjear),
      className: "text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50",
    },
    {
      label: "Editar Visitas",
      icon: "Heart",
      action: () => handleActionClick(onEditVisits),
      className: "text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/50",
    },
    {
      label: "Editar Datos",
      icon: "User",
      action: () => handleActionClick(onEditCard),
      className: "text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/50",
    },
    {
      label: "Historial",
      icon: "History",
      action: () => handleActionClick(onHistory),
      className: "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50",
    },
    {
      label: "WhatsApp",
      icon: "MessageCircle",
      action: () => handleActionClick(onWhatsApp),
      className: "text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/50",
    },
    {
      label: "Eliminar",
      icon: "Trash2",
      action: () => handleActionClick(onDelete),
      className: "text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50",
    },
  ].filter(Boolean);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-2 py-1.5 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary"
      >
        <DynamicIcon name="MoreVertical" className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className={`absolute w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 ${positionClass}`}
        >
          <div className="py-1">
            {actionItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full text-left flex items-center px-4 py-2 text-sm ${item.className}`}
                disabled={isHistoryLoading && item.label === "Historial"}
              >
                {isHistoryLoading && item.label === "Historial" && currentCardLoading === tarjeta.id ? (
                  <CRLoader style="circle" size="sm" onlyIcon />
                ) : (
                  <DynamicIcon name={item.icon} className="mr-3 h-5 w-5" />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ITEMS_PER_PAGE = 10;

const AdminFidelidadPage = () => {
  useScrollToTop();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimeoutRef = useRef(null);
  const [isFakeLoadingSearch, setIsFakeLoadingSearch] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditVisitsModalOpen, setIsEditVisitsModalOpen] = useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [tarjetaParaAccion, setTarjetaParaAccion] = useState(null);
  const [historialVisitas, setHistorialVisitas] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ nombre_cliente: "", telefono_cliente: "" });

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useApiRequest({
    queryKey: ["tarjetasFidelidad", currentPage, debouncedSearchTerm],
    url: "/fidelidad",
    method: "GET",
    config: { params: { search: debouncedSearchTerm, page: currentPage, limit: ITEMS_PER_PAGE } },
    options: { keepPreviousData: true },
  });

  const tarjetas = apiData?.tarjetas ?? [];
  const totalPages = apiData?.totalPages ?? 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    setIsFakeLoadingSearch(true);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setIsFakeLoadingSearch(false);
    }, 500);
  };

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

  const { mutate: editVisitasMutate, isLoading: isEditingVisits } = useApiRequest({
    method: "PUT",
    options: {
      onSuccess: () => {
        refetch();
        setIsEditVisitsModalOpen(false);
      },
    },
  });

  const { mutate: updateCardMutate, isLoading: isUpdatingCard } = useApiRequest({
    method: "PUT",
    options: {
      onSuccess: () => {
        refetch();
        setIsEditCardModalOpen(false);
      },
    },
  });

  const { mutate: deleteCardMutate, isLoading: isDeleting } = useApiRequest({
    method: "DELETE",
    options: {
      onSuccess: () => {
        refetch();
        setIsDeleteConfirmOpen(false);
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

  const handleUpdateCard = (tarjetaId, formData) => {
    updateCardMutate({ url: `/fidelidad/${tarjetaId}`, data: formData });
  };

  const handleDeleteCard = () => {
    if (tarjetaParaAccion) {
      deleteCardMutate({ url: `/fidelidad/${tarjetaParaAccion.id}` });
    }
  };

  const handleCanjear = (tarjeta) => {
    canjearMutate({ url: `/fidelidad/${tarjeta.id}/canjear` });
  };

  const handleVerHistorial = async (tarjeta) => {
    setIsHistoryLoading(true);
    setTarjetaParaAccion(tarjeta);
    setIsHistoryModalOpen(true);
    try {
      const response = await apiClient.get(`/fidelidad/${tarjeta.id}/historial`);
      setHistorialVisitas(response.data);
    } catch (error) {
      console.log("Error al cargar historial de visitas:", error);
      CRAlert.alert({ title: "Error", message: "No se pudo cargar el historial.", type: "error" });
      setIsHistoryModalOpen(false);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openEditVisitsModal = (tarjeta) => {
    setTarjetaParaAccion(tarjeta);
    setIsEditVisitsModalOpen(true);
  };

  const openEditCardModal = (tarjeta) => {
    setTarjetaParaAccion(tarjeta);
    setIsEditCardModalOpen(true);
  };

  const openDeleteConfirmModal = (tarjeta) => {
    setTarjetaParaAccion(tarjeta);
    setIsDeleteConfirmOpen(true);
  };

  const openWhatsApp = (tarjeta) => {
    const { telefono_cliente, nombre_cliente, visitas_acumuladas, codigo, canje_disponible } = tarjeta;
    const numero = telefono_cliente.replace(/\D/g, "");
    const baseUrl = window.location.origin;
    const cardUrl = `${baseUrl}/fidelidad/${codigo}`;
    let mensaje = "";

    if (canje_disponible) {
      mensaje = `¡Felicidades ${nombre_cliente}! 🥳 Has completado tu tarjeta de fidelidad en Naye Nails. ¡Obtén un 50% de DESCUENTO en tu próxima cita! Agenda para reclamarlo. 💅\n\nPuedes ver tu tarjeta aquí: ${cardUrl}`;
    } else {
      const faltan = 4 - visitas_acumuladas;
      mensaje = `¡Hola ${nombre_cliente}! 💖 Tienes ${visitas_acumuladas} visita(s) en tu tarjeta de fidelidad Naye Nails. ¡Te falta${
        faltan === 1 ? "" : "n"
      } solo ${faltan} para tu premio! 💅\n\nPuedes ver tu tarjeta aquí: ${cardUrl}`;
    }

    const url = `https://wa.me/502${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const isMutationLoading = isAdding || isEditingVisits || isUpdatingCard || isDeleting || isCanjeando;

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

      <div className="mb-6 relative">
        <CRInput type="text" placeholder="Buscar por nombre o teléfono..." value={searchTerm} setValue={handleSearchInputChange} />
        {isFakeLoadingSearch && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <DynamicIcon name="Loader2" className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {isLoading && !apiData ? (
        <CRLoader text="Cargando tarjetas..." />
      ) : tarjetas.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No se encontraron tarjetas.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progreso</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ciclos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {tarjetas.map((tarjeta) => (
                  <tr key={tarjeta.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center rounded-full">
                          <DynamicIcon name="User" className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{tarjeta.nombre_cliente}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tarjeta.telefono_cliente}</div>
                          <CopyableCode code={tarjeta.codigo} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <EstadoBadge canjeDisponible={tarjeta.canje_disponible === 1} visitas={tarjeta.visitas_acumuladas} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                      {tarjeta.visitas_acumuladas} / 4
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white">
                      {tarjeta.ciclos_completados}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionsDropdown
                        tarjeta={tarjeta}
                        onEditVisits={openEditVisitsModal}
                        onEditCard={openEditCardModal}
                        onHistory={handleVerHistorial}
                        onWhatsApp={openWhatsApp}
                        onDelete={openDeleteConfirmModal}
                        onCanjear={handleCanjear}
                        isHistoryLoading={isHistoryLoading}
                        currentCardLoading={tarjetaParaAccion?.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Paginador currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages} ({apiData?.totalTarjetas || 0} resultados)
            </p>
          </div>
        </>
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

      {tarjetaParaAccion && (
        <>
          <EditVisitasModal
            isOpen={isEditVisitsModalOpen}
            onClose={() => setIsEditVisitsModalOpen(false)}
            tarjeta={tarjetaParaAccion}
            onSave={handleEditVisitas}
            isLoading={isEditingVisits}
          />
          <EditCardModal
            isOpen={isEditCardModalOpen}
            onClose={() => setIsEditCardModalOpen(false)}
            tarjeta={tarjetaParaAccion}
            onSave={handleUpdateCard}
            isLoading={isUpdatingCard}
          />
        </>
      )}

      <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirmar Eliminación" type="warning">
        <p>
          ¿Estás seguro de que deseas eliminar la tarjeta de <strong>{tarjetaParaAccion?.nombre_cliente}</strong>?
        </p>
        <p className="text-xs text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
        <div className="mt-6 flex justify-end space-x-3">
          <CRButton
            title="Cancelar"
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-slate-600"
            disabled={isDeleting}
          />
          <CRButton title="Sí, Eliminar" onClick={handleDeleteCard} className="bg-red-600 hover:bg-red-700 text-white" loading={isDeleting} />
        </div>
      </ConfirmationModal>

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
