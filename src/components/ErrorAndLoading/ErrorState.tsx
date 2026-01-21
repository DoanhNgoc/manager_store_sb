import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({ message, onRetry }: { message: string, onRetry?: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-red-100">
            <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Đã có lỗi xảy ra</h2>
        <p className="text-slate-500 text-center max-w-md mb-8 font-medium">
            {message || "Không thể tải dữ liệu nhân sự lúc này. Vui lòng kiểm tra kết nối mạng của bạn."}
        </p>
        <button
            onClick={() => onRetry ? onRetry() : window.location.reload()}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
            <RefreshCw size={20} /> Thử lại ngay
        </button>
    </div>
);
export default ErrorState