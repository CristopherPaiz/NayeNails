import { X, CheckCircle2, AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, title, children, type = "success" }) => {
  if (!isOpen) return null;

  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
  const iconColor = type === "success" ? "text-green-500 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400";
  const titleColor = type === "success" ? "text-primary dark:text-primary" : "text-yellow-600 dark:text-yellow-500";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[5000] flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-modalEnter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
              type === "success" ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900"
            } mb-4 sm:mb-5`}
          >
            <Icon size={40} className={iconColor} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-semibold ${titleColor} mb-3`}>{title}</h2>
        </div>

        <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center mb-6">{children}</div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
