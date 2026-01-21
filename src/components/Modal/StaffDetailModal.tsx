import { Briefcase, Calendar, Mail, Phone, Trash2 } from "lucide-react";
import ErrorState from "../ErrorAndLoading/ErrorState";
import Age from "../Fomat/Time_and_Duration/Age";
import ExperienceDuration from "../Fomat/Time_and_Duration/ExperienceDuration";
interface PropStaffDetailModal {
    staff: any,
    onClose: () => void,
    onDeleteInit: (id: string) => void
}
const StaffDetailModal = ({ staff, onClose, onDeleteInit }: PropStaffDetailModal) => {
    if (!staff) return <ErrorState message="không tồn tại" />;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="h-24 bg-[#009099]"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-4 flex justify-center">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                            <div className="w-full h-full rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-3xl font-black text-[#009099]">
                                {staff?.last_name.trim().split(" ").pop()?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-black text-slate-800">{staff?.first_name} {staff?.last_name}</h3>
                        <p className="text-[#009099] font-bold text-sm uppercase tracking-widest">{staff?.roleKey}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Calendar size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Tuổi</p><p className="text-sm font-bold text-slate-700"><Age dob={staff?.dob} /> tuổi</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="text-sm font-bold text-slate-700">{staff?.email}</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Số điện thoại</p><p className="text-sm font-bold text-slate-700">{staff?.phone}</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><Briefcase size={18} /></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Kinh nghiệm</p><p className="text-sm font-bold text-slate-700"><ExperienceDuration value={staff?.experience} /></p></div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Đóng</button>
                        <button
                            onClick={() => onDeleteInit(staff)}
                            className="flex-1 py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Xóa nhân sự
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StaffDetailModal