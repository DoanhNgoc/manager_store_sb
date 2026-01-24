import { ArrowLeft, Briefcase, Calendar, ChevronRight, Clock, DollarSign, Mail, Phone, Save, User, UserPlus } from "lucide-react"
const InputField = ({ label, icon: Icon, error, ...props }: any) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00928f] transition-colors" />}
            <input
                {...props}
                className={`w-full px-4 py-3.5 ${Icon ? 'pl-11' : ''} bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#00928f] focus:bg-white focus:ring-4 focus:ring-[#00928f]/10 outline-none transition-all placeholder:text-slate-300 text-sm font-medium text-slate-700`}
            />
        </div>
    </div>
);

interface AddMemberProps {
    onclickReturn: (activePage: string) => void
}
const AddMember = ({ onclickReturn }: AddMemberProps) => {

    return (
        <div className="max-w-4xl mx-auto">
            <button
                className="mb-8 flex items-center gap-3 text-slate-400 hover:text-[#00928f] font-bold text-xs uppercase tracking-[0.2em] transition-all group"
                onClick={() => { onclickReturn("HumanResources") }}>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-[#00928f] transition-all">
                    <ArrowLeft size={18} />
                </div>
                Quay lại danh sách
            </button>

            <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
                <div className="bg-[#00928f] p-10 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/30 shadow-inner">
                            <UserPlus size={40} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Thêm Nhân sự Mới</h2>
                            <p className="text-teal-50/80 text-sm font-medium mt-2">Thiết lập hồ sơ và phân quyền hệ thống.</p>
                        </div>
                    </div>
                    <UserPlus size={180} className="absolute -right-12 -bottom-12 text-white/10 rotate-12 pointer-events-none" />
                </div>

                <form className="p-12 space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#00928f] rounded-full"></div>
                            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em]">Thông tin định danh</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Họ & Tên đệm" icon={User} placeholder="VD: Trương Ngọc" required />
                            <InputField label="Tên" placeholder="VD: Doanh" required />
                            <InputField
                                label="Ngày sinh" icon={Calendar} type="date" required />

                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Chức vụ (Role)</label>
                                <div className="relative">
                                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <select
                                        className="w-full px-4 py-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#00928f] outline-none appearance-none font-medium text-sm"
                                    >
                                        <option value="STAFF">Nhân viên (Staff)</option>
                                        <option value="MANAGER">Quản lý (Manager)</option>
                                    </select>
                                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                                </div>
                            </div>

                            <InputField label="Email công việc" icon={Mail} type="email" placeholder="email@company.com" required />
                            <InputField label="Số điện thoại" icon={Phone} placeholder="09xx xxx xxx" required />
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#00928f] rounded-full"></div>
                            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em]">Tài chính & Kinh nghiệm</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative">
                                <InputField label="Lương cơ bản (VNĐ)" icon={DollarSign} type="number" placeholder="VD: 15000000" required />
                                <button
                                    type="button"
                                    className="absolute right-3 top-9 p-2 bg-[#e0f2f1] text-[#00928f] rounded-xl hover:bg-[#b2dfdb] transition-all"
                                >
                                </button>
                            </div>
                            <InputField label="Ngày bắt đầu" icon={Clock} type="date" required />
                        </div>


                    </section>

                    <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                        <button type="button" className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Hủy bỏ</button>
                        <button type="submit" className="px-12 py-4 rounded-2xl bg-[#00928f] text-white font-bold shadow-2xl shadow-[#00928f]/30 flex items-center gap-3 hover:bg-[#007a78] transition-all active:scale-95 text-xs uppercase tracking-widest">
                            <Save size={18} />
                            Lưu Nhân Viên
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default AddMember
