import { AlertCircle, ArrowLeft, Calendar, Clock, DollarSign, Mail, Phone, Save, User, UserPlus } from "lucide-react"
import { useEffect, useState } from "react";
import ConfirmAddMemberModal from "../../../../components/Modal/confirmAddMemberModal";
import CheckRoleMember from "../../../../components/Fomat/role/CheckRoleMember";
const InputField = ({ label, icon: Icon, error, ...props }: any) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#00928f]'}`} />}
            <input
                {...props}
                className={`w-full px-4 py-3.5 ${Icon ? 'pl-11' : ''} bg-slate-50 border rounded-2xl outline-none transition-all placeholder:text-slate-300 text-sm font-medium ${error
                    ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 text-red-900 bg-red-50/30'
                    : 'border-slate-200 focus:border-[#00928f] focus:bg-white focus:ring-4 focus:ring-[#00928f]/10 text-slate-700'
                    }`}
            />
        </div>
        {error && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">
                <AlertCircle size={12} />
                {error}
            </p>
        )}
    </div>
);

interface AddMemberProps {
    onclickReturn: (activePage: string) => void
}

type dataAddMember = {
    email: string,
    first_name: string,
    last_name: string,
    phone: string,
    dob: string,
    experience: string,
    salary: number,
    role_id: string
}
interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    startDate?: string;
    salary?: string;
}
const AddMember = ({ onclickReturn }: AddMemberProps) => {
    const [confirmAdd, setConfirmAdd] = useState(false); // Modal xác nhận thêm mới
    //data
    const [data, setData] = useState<Partial<dataAddMember>>(
        {
            email: '', first_name: '', last_name: '', phone: '', dob: '', experience: '', salary: 0, role_id: ''
        }
    )

    //errors
    const [errors, setErrors] = useState<FormErrors>({});
    useEffect(() => {
        console.log(data)
    }, [data])

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!data.last_name?.trim()) newErrors.lastName = "Vui lòng nhập họ & tên đệm";
        if (!data.first_name?.trim()) newErrors.firstName = "Vui lòng nhập tên";

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!emailRegex.test(data.email)) {
            newErrors.email = "Định dạng email không hợp lệ";
        }

        // Validate Phone (Vietnam format 10 digits)
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!data.phone) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!phoneRegex.test(data.phone)) {
            newErrors.phone = "Số điện thoại phải có 10 số (VD: 0912345678)";
        }

        const today = new Date();

        // ===== DOB (18 - 35 tuổi) =====
        if (!data.dob) {
            newErrors.birthDate = "Vui lòng chọn ngày sinh";
        } else {
            const dob = new Date(data.dob);
            const age = today.getFullYear() - dob.getFullYear();

            if (age < 18 || age > 35) {
                newErrors.birthDate = "Tuổi phải trong khoảng 18 - 35";
            }
        }
        // ===== EXPERIENCE =====
        if (!data.experience) {
            newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        } else if (data.dob) {
            const dob = new Date(data.dob);
            const expDate = new Date(data.experience);

            // Ngày đủ 18 tuổi
            const validStartDate = new Date(dob);
            validStartDate.setFullYear(dob.getFullYear() + 18);

            if (expDate < validStartDate) {
                newErrors.startDate = "Ngày bắt đầu phải từ khi đủ 18 tuổi";
            } else if (expDate > today) {
                newErrors.startDate = "Ngày bắt đầu không được lớn hơn hiện tại";
            }
        }

        if (!data.salary) {
            newErrors.salary = "Vui lòng nhập mức lương";
        } else if (Number(data.salary) <= 1000) {
            newErrors.salary = "Mức lương không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePreSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setConfirmAdd(true);
        }
    };

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

                <form className="p-12 space-y-12" onSubmit={handlePreSave}>
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#00928f] rounded-full"></div>
                            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em]">Thông tin định danh</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* first name */}
                            <InputField
                                label="Họ & Tên đệm" icon={User} placeholder="VD: Nguyễn..." required
                                value={data.first_name}
                                onChange={(e: any) => { setData({ ...data, first_name: e.target.value }); if (errors.firstName) setErrors({ ...errors, firstName: undefined }); }}

                                error={errors.firstName}
                            />
                            {/* last name */}
                            <InputField
                                label="Tên" placeholder="VD: Văn A" required
                                value={data.last_name}
                                onChange={(e: any) => { setData({ ...data, last_name: e.target.value }); if (errors.lastName) setErrors({ ...errors, lastName: undefined }); }}
                                error={errors.lastName} />
                            {/* dob */}
                            <InputField
                                label="Ngày sinh" icon={Calendar} type="date" required
                                value={data.dob}
                                onChange={(e: any) => { setData({ ...data, dob: e.target.value }); if (errors.birthDate) setErrors({ ...errors, birthDate: undefined }); }}
                                error={errors.birthDate} />
                            {/* mail */}
                            <InputField
                                label="Email công việc" icon={Mail} type="email" placeholder="email@company.com" required
                                value={data.email}
                                onChange={(e: any) => { setData({ ...data, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}

                                error={errors.email} />
                            {/* phone */}
                            <InputField
                                label="Số điện thoại" icon={Phone} placeholder="09xx xxx xxx" required
                                value={data.phone}
                                onChange={(e: any) => { setData({ ...data, phone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: undefined }); }}

                                error={errors.phone} />
                            {/* experience */}
                            <InputField
                                label="Ngày bắt đầu" icon={Clock} type="date" required
                                value={data.experience}
                                onChange={(e: any) => { setData({ ...data, experience: e.target.value }); if (errors.startDate) setErrors({ ...errors, startDate: undefined }); }}

                                error={errors.startDate} />
                        </div>
                        {/* role */}
                        <CheckRoleMember value={data.role_id} onChange={(role_id) => setData({ ...data, role_id: `roles/${role_id}` })} />
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#00928f] rounded-full"></div>
                            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em]">Tài chính & Kinh nghiệm</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative">
                                <InputField
                                    label="Lương cơ bản (VNĐ)" icon={DollarSign} type="number" placeholder="VD: 15000000" required
                                    value={data.salary}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = e.target.value;
                                        setData({
                                            ...data,
                                            salary: value === "" ? undefined : Number(value),
                                        });

                                        if (errors.salary) {
                                            setErrors({ ...errors, salary: undefined });
                                        }
                                    }}
                                    error={errors.salary} />

                            </div>

                        </div>


                    </section>

                    <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                        <button onClick={() => { onclickReturn("HumanResources") }} type="button" className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Hủy bỏ</button>
                        <button type="submit" className="px-12 py-4 rounded-2xl bg-[#00928f] text-white font-bold shadow-2xl shadow-[#00928f]/30 flex items-center gap-3 hover:bg-[#007a78] transition-all active:scale-95 text-xs uppercase tracking-widest">
                            <Save size={18} />
                            Lưu Nhân Viên
                        </button>
                    </div>
                </form>
            </div>
            {
                confirmAdd && <ConfirmAddMemberModal setConfirmAdd={setConfirmAdd} data={data} onclickReturn={onclickReturn} />
            }
        </div>
    )
}
export default AddMember
