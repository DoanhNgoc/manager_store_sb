import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModalPersonal from "../../../components/Modal/ConfirmDeleteModalPersonal";
import StaffDetailModal from "../../../components/Modal/StaffDetailModal";
import { useUsers } from "../../../hooks/useUsers";
import ErrorState from "../../../components/ErrorAndLoading/ErrorState";
import LoadingState from "../../../components/ErrorAndLoading/LoadingState";

interface HumanResourcesProps {
    onclickAddmember: (activePage: string) => void
}

export default function HumanResources({ onclickAddmember }: HumanResourcesProps) {
    //hooks 
    const { users, loading, error, deleteUser } = useUsers();

    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    //infomation delete user
    const [deleted, setDeleted] = useState<any>(null);
    //modal confrim
    //function confirm delete user in id users
    const confirmDelete = (deleteId: string) => {
        if (deleted) {
            deleteUser(deleteId)
            setDeleted(null);
            setSelectedStaff(null);
        }
    };
    //function open modal delete user
    const openDeleteConfirm = (staff: any) => {
        setDeleted(staff);
    };
    //error
    if (error) {
        return <ErrorState message={error} />
    }
    //loading
    if (loading) {
        return <LoadingState />
    }
    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý Nhân sự</h1>
                    {/* quantity user */}
                    <p className="text-sm text-slate-500 mt-1">Quản lý đội ngũ ({users.length} thành viên)</p>
                </div>
                {/* button open add member */}
                <button
                    className="bg-[#009099] text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#007a82] transition-all shadow-lg shadow-[#009099]/20"
                    onClick={() => { onclickAddmember("AddMember") }}>
                    <Plus size={18} /> <span className="hidden sm:inline">Thêm nhân sự</span>
                </button>
            </div>
            {/* table list user */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Mã NV</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nhân viên</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Vị trí</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right hidden md:table-cell">Thao tác</th>
                            <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right md:hidden">Xem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((s: any, key: number) => (
                            <tr key={key} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedStaff(s)}>
                                <td className="px-6 py-5 text-sm font-bold text-slate-400 hidden sm:table-cell">{s?.id_member}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {/* avatar */}
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#009099] text-xs">
                                            {s?.last_name.trim().split(" ").pop()?.charAt(0).toUpperCase()}
                                        </div>
                                        {/* mail and role */}
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-[#00928f]">{s?.first_name} {s?.last_name}</p>
                                            {/* display role mobie */}
                                            <p className="text-xs text-slate-400 md:hidden">{s?.roleKey}</p>
                                            {/* display email laptop */}
                                            <p className="text-[10px] text-slate-300 hidden md:block">{s?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                {/* Vị trí - Ẩn trên mobile bằng class hidden md:table-cell */}
                                <td className="px-6 py-5 hidden md:table-cell">
                                    <span className="text-xs font-bold text-[#009099] bg-[#009099]/5 px-3 py-1.5 rounded-xl uppercase">{s?.roleKey}</span>
                                </td>
                                {/* Thao tác Laptop - Hiện trên MD trở lên */}
                                <td className="px-6 py-5 text-right hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openDeleteConfirm(s)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                                {/* Icon xem thêm cho Mobile */}
                                <td className="px-6 py-5 text-right md:hidden">
                                    <ChevronRight size={18} className="text-slate-300 ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render Modals */}
            {selectedStaff && (
                <StaffDetailModal
                    staff={selectedStaff}
                    onClose={() => setSelectedStaff(null)}
                    onDeleteInit={openDeleteConfirm}
                />
            )}

            {deleted && (
                <ConfirmDeleteModalPersonal
                    staff={deleted}
                    onClose={() => setDeleted(null)}
                    onConfirm={confirmDelete}
                />
            )}
            {/* <pre className="text-start">
                {JSON.stringify(users, null, 2)}
            </pre> */}
        </div>)

}