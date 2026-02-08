import { Check, FileText, Package, Plus, Save, Search, ShoppingCart, Tag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProducts } from "../../../../hooks/userProducts";
import ErrorState from "../../../../components/ErrorAndLoading/ErrorState";
import LoadingState from "../../../../components/ErrorAndLoading/LoadingState";

interface RestockFormProps {
    setView: React.Dispatch<React.SetStateAction<string>>;
    uidAuth: string
}

const RestockForm = ({ setView, uidAuth }: RestockFormProps) => {
    const [entryList, setEntryList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [inputQty, setInputQty] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const [note, setNote] = useState<string>("")
    const [title, setTitle] = useState<string>("")

    const { products, loading, error } = useProducts();

    const dropdownRef = useRef<any>(null);
    const searchResults: any = useMemo(() => {
        if (!searchTerm.trim()) return [];

        return products
            .filter((p: any) => {
                const keyword = searchTerm.toLowerCase();
                return (
                    p?.name?.toLowerCase().includes(keyword) ||
                    p?.id_product?.toLowerCase().includes(keyword)
                );
            })
            .slice(0, 5);
    }, [searchTerm, products]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (error) return <ErrorState message={error} />;
    if (loading) return <LoadingState />;

    const handleSelect = (prod: any) => {
        setSelectedProduct(prod);
        setSearchTerm(prod?.name || "");
        setShowResults(false);
    };

    const handleAddLine = () => {
        if (!selectedProduct) return;
        if (!inputQty || parseInt(inputQty) <= 0) return;

        const exists = entryList.find((e: any) => e.id === selectedProduct.id);

        if (exists) {
            setEntryList(
                entryList.map((e: any) =>
                    e.id === selectedProduct.id
                        ? { ...e, added: e.added + parseInt(inputQty) }
                        : e
                )
            );
        } else {
            setEntryList([
                ...entryList,
                {
                    id: selectedProduct?.id,
                    product_id: selectedProduct?.id_product,
                    name: selectedProduct?.name,
                    added: parseInt(inputQty),
                    unit: selectedProduct?.variant,
                },
            ]);
        }

        setSelectedProduct(null);
        setInputQty("");
        setSearchTerm("");
    };

    const removeLine = (product_id: string) =>
        setEntryList(entryList.filter((e: any) => e.product_id !== product_id));

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden animate-in zoom-in-95">
            <div className="p-10 bg-slate-800 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Phiếu Nhập Hàng</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                        Hệ thống nhập kho vật tư
                    </p>
                </div>
                <button
                    onClick={() => setView("home")}
                    className="p-3 bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-50">
                <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Tiêu đề phiếu nhập</label>
                    <div className="relative">
                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VD: Nhập trà Lộc Phát đầu tháng..."
                            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-slate-100"
                        />
                    </div>
                </div>
                <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Ghi chú (Note)</label>
                    <div className="relative">
                        <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Tình trạng hàng, nhà cung cấp..."
                            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-slate-100"
                        />
                    </div>
                </div>
            </div>
            {/* SEARCH Area */}
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex gap-4 items-end">
                <div className="flex-[2] text-left relative" ref={dropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">
                        Tìm tên / mã vật liệu
                    </label>

                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchTerm(value);
                                setShowResults(true);

                                if (selectedProduct && value !== selectedProduct?.name) {
                                    setSelectedProduct(null);
                                }
                            }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Gõ để tìm hàng trăm vật liệu..."
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 font-bold outline-none focus:ring-4 ring-[#7ED9D9]/20 shadow-sm"
                        />

                        {selectedProduct && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                <Check size={16} />
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchResults.map((p: any) => (
                                <button
                                    key={p?.id}
                                    onClick={() => handleSelect(p)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group"
                                >
                                    <div className="text-left">
                                        <p className="font-black text-slate-700 group-hover:text-[#7ED9D9]">{p?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {p?.id_product}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-400">
                                            Tồn: {p?.quantity} {p?.variant}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-40">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">
                        Số lượng
                    </label>
                    <input
                        type="number"
                        value={inputQty}
                        onChange={(e) => setInputQty(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-center outline-none focus:ring-4 ring-[#7ED9D9]/10"
                    />
                </div>

                <button
                    onClick={handleAddLine}
                    className="h-[60px] px-8 bg-[#7ED9D9] text-white font-black rounded-2xl shadow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Thêm vào phiếu
                </button>
            </div>

            {/* List Area */}
            <div className="min-h-[300px] p-10">
                {entryList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg">Chưa có vật liệu nào được thêm</p>
                        <p className="text-sm">Hãy chọn sản phẩm phía trên để bắt đầu tạo phiếu nhập</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entryList.map((item: any) => (
                            <div
                                key={item.product_id}
                                className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:text-[#7ED9D9] transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-700">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.product_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xl font-black text-emerald-500">+{item.added}</p>
                                        <p className="text-[10px] font-black text-slate-300 uppercase">{item?.unit}</p>
                                    </div>
                                    <button
                                        onClick={() => removeLine(item.product_id)}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-10 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="text-sm font-bold text-slate-400 italic">Tổng số dòng hàng: {entryList.length}</div>
                <button
                    disabled={entryList.length === 0}
                    className="px-12 py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-3"
                >
                    <Save size={20} /> Hoàn tất & Lưu kho
                </button>
            </div>
        </div>
    );
};

export default RestockForm;
