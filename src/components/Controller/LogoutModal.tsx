import { LogOutIcon } from "lucide-react";

interface LogoutModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ show, onClose, onConfirm }) => {

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 border border-white animate-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <LogOutIcon size={32} />
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-800 mb-2">Xác nhận đăng xuất</h3>
                    <p className="text-slate-500 font-medium mb-8">
                        Bạn có chắc chắn muốn thoát khỏi hệ thống và đăng xuất tài khoản này không?
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95"
                        >
                            Thoát
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LogoutModal