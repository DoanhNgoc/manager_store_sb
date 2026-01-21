import { AlertCircle } from "lucide-react";
import { useState } from "react";
interface PropConfirmDeleteModalPersonal {
    staff: any,
    onClose: () => void,
    onConfirm: (deleteId: string) => void
}
// --- Component Modal Xác nhận Xóa ---
const ConfirmDeleteModalPersonal = ({ staff, onClose, onConfirm }: PropConfirmDeleteModalPersonal) => {
    const [deleleId, setDeleteId] = useState<string | null>(null)
    return (

        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 border border-white animate-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
                    <p className="text-slate-500 font-medium mb-8">Dữ liệu của <span className="font-bold text-red-500">{staff?.first_name} {staff?.last_name}</span> sẽ bị xóa vĩnh viễn.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-4 bg-slate-100 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Hủy</button>
                        <button onClick={() => {
                            setDeleteId(staff?.uid)
                            if (deleleId) {
                                onConfirm(deleleId)
                            }
                        }} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-shadow shadow-lg shadow-red-200">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ConfirmDeleteModalPersonal