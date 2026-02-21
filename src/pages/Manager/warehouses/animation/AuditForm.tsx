import { Check, ClipboardCheck, FileText, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react"
import { useProducts } from "../../../../hooks/userProducts";
import { useWarehouseTransactions } from "../../../../hooks/useWarehouseTransactions";
import LoadingState from "../../../../components/ErrorAndLoading/LoadingState";
import ErrorState from "../../../../components/ErrorAndLoading/ErrorState";
export type Adjust = {
    id: string,
    id_product: string,
    name: string,
    added: number,
    variant: string
}
interface AuditFormProps {

    setView: React.Dispatch<React.SetStateAction<string>>,
    uidAuth: string | null


}
const AuditForm = ({ setView, uidAuth }: AuditFormProps) => {
    const [auditList, setAuditList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    //title 
    const [title, setTitle] = useState("");
    //note
    const [note, setNote] = useState("");
    //search

    const [showResults, setShowResults] = useState(false);

    const { products, loading, error } = useProducts();
    const { createWarehouseTransaction, loadingCreate, errorCreate } = useWarehouseTransactions()
    const dropdownRef = useRef(null);

    const searchResults: any = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return products.filter((p: any) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id_product.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [searchTerm, products]);



    if (error) {
        return <ErrorState message={error} />
    }

    if (loading) {
        return <LoadingState />
    }

    // export type Adjust = {
    //     id: string,
    //     id_product: string,
    //     name: string,
    //     added: number,
    //     variant: string
    // }
    const handleAddItem = (prod: any) => {
        if (auditList.find((a: any) => a?.id === prod?.id)) {
            setSearchTerm("");
            setShowResults(false);
            return;
        }
        setAuditList([...auditList, {
            id: prod?.id,
            id_product: prod?.id_product,
            name: prod?.name,
            old: prod?.quantity,
            actual: prod.quantity,
            variant: prod?.variant,
            quantity_change: 0
        }]);
        setSearchTerm("");
        setShowResults(false);
    };

    const updateActual = (id: string, val: string) => {
        const actual = parseInt(val) || 0;

        setAuditList(auditList.map((item: any) => {
            if (item.id !== id) return item;

            const quantity_change = actual - item.old;

            return {
                ...item,
                actual,
                quantity_change
            };
        }));
    };
    const submit = async (type: "IMPORT" | "EXPORT" | "ADJUST" = "ADJUST") => {
        if (!uidAuth) return;

        const data = {
            title: title,
            type: type,
            note: note,
            created_by: uidAuth,
            items: auditList.map((item: any) => ({
                product_id: item.id,
                quantity_change: item.quantity_change
            }))
        };

        await createWarehouseTransaction(data);
        setView("home")
    };
    const removeItem = (id: string) => setAuditList(auditList.filter((item: any) => item?.id !== id));

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-left">Biên Bản Kiểm Kho</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 text-left">Đối soát số lượng tồn thực tế tại cửa hàng</p>
                </div>
                <button onClick={() => { setView("home") }} className="p-3 bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            {/* Title & Note Inputs */}
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-50">
                <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Tiêu đề biên bản</label>
                    <div className="relative">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Kiểm kho định kỳ cuối tuần..."
                            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-slate-100"
                        />
                    </div>
                </div>
                <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Ghi chú kiểm kho</label>
                    <div className="relative">
                        <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Lý do chênh lệch, người kiểm..."
                            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-slate-100"
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-10 py-8 bg-slate-50/50 relative z-50">
                <div className="max-w-xl mx-auto relative" ref={dropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest text-left">Thêm vật liệu cần kiểm</label>
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Gõ tên vật liệu để bắt đầu kiểm..."
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-[#7ED9D9]/20 shadow-sm"
                        />
                    </div>

                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {searchResults.map((p: any) => (
                                <button
                                    key={p?.id}
                                    onClick={() => handleAddItem(p)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group"
                                >
                                    <div className="text-left">
                                        <p className="font-black text-slate-700 group-hover:text-[#7ED9D9]">{p?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase">{p?.id_product} • Hệ thống: {p.quantity} {p?.variant}</p>
                                    </div>
                                    <Plus size={16} className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Table */}
            <div className="p-10 min-h-[400px]">
                {auditList.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <ClipboardCheck size={64} className="mb-4" />
                        <p className="font-black text-lg">Chưa có vật liệu nào được chọn để kiểm</p>
                        <p className="text-sm font-bold">Hãy tìm kiếm và thêm vật liệu bên trên</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Vật liệu</th>
                                    <th className="px-8 py-5 text-center">Hệ thống</th>
                                    <th className="px-8 py-5 text-center">Thực tế</th>
                                    <th className="px-8 py-5 text-center">Chênh lệch</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {auditList.map((item: any) => {
                                    const diff = item?.actual - item?.old;
                                    return (
                                        <tr key={item?.id} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-700">
                                                {item?.name}
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.product_id}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center text-slate-400 font-bold">
                                                {item?.old} {item.variant}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={item.actual}
                                                        onChange={(e) => updateActual(item?.id, e.target.value)}
                                                        className="w-20 bg-slate-100 border-none rounded-xl px-3 py-2 font-black text-center outline-none focus:ring-2 ring-[#7ED9D9]"
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase">{item?.var}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-xs font-black px-3 py-1 rounded-lg ${diff === 0 ? 'bg-slate-100 text-slate-400' : diff > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => removeItem(item?.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <pre>
                    {JSON.stringify(auditList, null, 2)}
                </pre>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="text-sm font-bold text-slate-400 italic">Tổng số mặt hàng kiểm tra: {auditList.length}</div>
                <button
                    disabled={auditList.length === 0}
                    onClick={() => submit()}
                    className="px-12 py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                >
                    <Check size={20} /> Xác nhận & Cập nhật kho
                </button>
            </div>
        </div>
    );
}
export default AuditForm