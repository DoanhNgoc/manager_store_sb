import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success": return <CheckCircle size={20} className="text-green-500" />;
            case "error": return <AlertTriangle size={20} className="text-red-500" />;
            case "warning": return <AlertTriangle size={20} className="text-yellow-500" />;
            case "info": return <Info size={20} className="text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case "success": return "bg-green-50 border-green-200 text-green-700";
            case "error": return "bg-red-50 border-red-200 text-red-700";
            case "warning": return "bg-yellow-50 border-yellow-200 text-yellow-700";
            case "info": return "bg-blue-50 border-blue-200 text-blue-700";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right duration-300 ${getStyles(toast.type)}`}
                    >
                        {getIcon(toast.type)}
                        <span className="flex-1 text-sm font-medium">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
