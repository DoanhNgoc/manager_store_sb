import { HelpCircle } from "lucide-react"
import { useUsers } from "../../hooks/useUsers"
interface ConfirmAddMemberModalProps {
    setConfirmAdd: React.Dispatch<React.SetStateAction<boolean>>,
    data: any,
    onclickReturn: (activePage: string | "") => void

}
const ConfirmAddMemberModal = ({ setConfirmAdd, data, onclickReturn }: ConfirmAddMemberModalProps) => {
    const { createUser } = useUsers()
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="w-20 h-20 bg-teal-50 text-[#00928f] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <HelpCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Xác nhận lưu?</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                    Bạn có chắc chắn muốn thêm nhân sự <span className="text-[#00928f] font-bold">{data.first_name} {data.last_name}</span> vào hệ thống?
                </p>
                <div className="grid grid-cols-2 gap-4 mt-10">
                    <button onClick={() => {
                        setConfirmAdd(false)
                        onclickReturn("AddMember")
                    }} className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm tracking-wide hover:bg-slate-100 transition-colors">Hủy</button>
                    <button
                        onClick={() => {
                            createUser(data)
                            onclickReturn("HumanResources")
                        }}
                        className="py-4 rounded-2xl bg-[#00928f] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#00928f]/20 active:scale-95 transition-all hover:bg-[#007a78]"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    )
}
export default ConfirmAddMemberModal