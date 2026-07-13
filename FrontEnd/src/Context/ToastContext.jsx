import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = "bg-white border-gray-200 text-gray-800";
          let Icon = InformationCircleIcon;
          let iconColor = "text-blue-500";

          if (toast.type === "success") {
            bgClass = "bg-green-50 border-green-200 text-green-800";
            Icon = CheckCircleIcon;
            iconColor = "text-green-600";
          } else if (toast.type === "error") {
            bgClass = "bg-red-50 border-red-200 text-red-800";
            Icon = XCircleIcon;
            iconColor = "text-red-600";
          } else if (toast.type === "info") {
            bgClass = "bg-blue-50 border-blue-200 text-blue-800";
            Icon = InformationCircleIcon;
            iconColor = "text-blue-600";
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg pointer-events-auto transition-all duration-300 transform translate-x-0 animate-slide-in ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed text-left">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 shrink-0 outline-none"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
