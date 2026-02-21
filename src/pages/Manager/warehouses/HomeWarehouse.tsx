import { useEffect, useState } from "react"
import ErrorState from "../../../components/ErrorAndLoading/ErrorState"
import LoadingState from "../../../components/ErrorAndLoading/LoadingState"
import { useProducts } from "../../../hooks/userProducts"
import { AlertCircle, AlertTriangle, CheckCircle2, ClipboardCheck, Ghost, Loader2, Package, PackageOpen, Plus, PlusCircle } from "lucide-react"
import StatusCard from "../../../components/tools/StatusCard"
import FilterCategory from "../../../components/Filter/FilterCategory"
import RestockForm from "./animation/RestockForm"
import AuditForm from "./animation/AuditForm"
import { useAuth } from "../../../context/AuthContext"
import ReadTime from "../../../components/Fomat/Time_and_Duration/ReadTime"
import NoItem from "../../../components/List/NoItem"

function HomeWarehouse() {
    const [view, setView] = useState<string>("home")
    const [idCategory, setIdCategory] = useState<string>("")
    const { uidAuth, lastName } = useAuth()
    const {
        products, loading, error,
        loadingProducts,
        productsByCategory, fetchProducts
    } = useProducts();

    useEffect(() => {
        if (!idCategory) {
            fetchProducts(); // nếu chọn "Tất cả" hoặc bỏ filter thì load lại all products
            return;
        }

        productsByCategory(idCategory);
    }, [idCategory, view]);

    if (error) {
        return <ErrorState message={error} />
    }

    if (loading) {
        return <LoadingState />
    }

    return <>
        {view === 'home' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tổng quan kho</h2>
                        <p className="text-slate-400 font-medium mt-1 text-base"><ReadTime />, {lastName}!</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setView('restock')} className="px-6 py-3.5 rounded-2xl bg-[#7ED9D9] text-white font-black text-sm shadow-xl shadow-[#7ed9d933] flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 transition-all"><Plus size={18} /> Nhập hàng</button>
                        <button onClick={() => setView('audit')} className="px-6 py-3.5 rounded-2xl bg-slate-800 text-white font-black text-sm shadow-xl shadow-slate-200 flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 transition-all"><ClipboardCheck size={18} /> Kiểm kho</button>
                    </div>
                </div>

                {/* Status Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <StatusCard icon={<AlertCircle className="text-red-500" />} label="Hết hàng" count={products.filter(p => p?.quantity <= 0).length} color="bg-red-50/50" />
                    <StatusCard icon={<AlertTriangle className="text-yellow-500" />} label="Sắp hết hàng" count={products.filter(p => p?.quantity > 0 && p.quantity <= p?.alert_threshold).length} color="bg-yellow-50/50" />
                    <StatusCard icon={<CheckCircle2 className="text-emerald-500" />} label="Đang ổn định" count={products.filter(p => p?.quantity > p?.alert_threshold).length} color="bg-emerald-50/50" />
                </div>

                {/* Filter Tabs */}
                <FilterCategory setIdCategory={setIdCategory} />

                {/* Products Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
                    {loadingProducts && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-[1px] z-10 rounded-xl">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500/20 rounded-full"></div>
                            </div>
                            <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang lọc kết quả...</p>
                        </div>
                    )}
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Danh mục</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mức báo động</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tồn thực tế</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-24 px-10">
                                        <NoItem />
                                    </td>
                                </tr>
                            ) :
                                (products.map((p: any) => (
                                    <tr key={p?.id_product} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#7ED9D9] group-hover:bg-[#7ED9D9]/5 transition-all">
                                                    <Package size={22} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-700">{p?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{p?.id_product}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-[10px] font-black px-3.5 py-2 rounded-xl bg-slate-100 text-slate-500 uppercase tracking-tight">
                                                {p?.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-amber-500 bg-amber-50/20">{p?.alert_threshold} {p?.variant}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-lg font-black ${p?.quantity < 10 ? 'text-red-500' : 'text-slate-700'}`}>{p?.quantity}</span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">
                                                    {p?.variant}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

        )}
        {view === "restock" && (
            <RestockForm setView={setView} uidAuth={uidAuth} />
        )}
        {view === "audit" && (
            <AuditForm uidAuth={uidAuth} setView={setView} />
        )}
    </>



}
export default HomeWarehouse