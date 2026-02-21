import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreateProductPayload } from "../../../hooks/userProducts";

interface AddProductModalProps {
    categories: any,
    setShowProductModal: React.Dispatch<React.SetStateAction<boolean>>,
    fetchProducts: () => Promise<void>,
    createProduct: (payload: CreateProductPayload) => Promise<void>
}
interface dataform {
    name: string,
    quantity: number;
    variant: string;
    alert_threshold: number;
    category_id: string;
    status_id: string;
}
const AddProductModal = ({ categories, setShowProductModal, fetchProducts, createProduct }: AddProductModalProps) => {
    const [dataAdd, setDataAdd] = useState<dataform>(
        {
            name: '', quantity: 0, variant: '', alert_threshold: 0, category_id: '', status_id: 'out'
        }
    )
    useEffect(() => {
        let newStatus = 'out'

        if (dataAdd.quantity <= 0) {
            newStatus = 'out'
        } else if (dataAdd.quantity > dataAdd.alert_threshold) {
            newStatus = 'fine'
        } else {
            newStatus = 'low'
        }

        setDataAdd(prev => ({
            ...prev,
            status_id: newStatus
        }))
    }, [dataAdd.quantity, dataAdd.alert_threshold])

    const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // const formData = new FormData(e.currentTarget);
        createProduct(
            dataAdd
        )
        fetchProducts()
        console.log(dataAdd)
        setShowProductModal(false);
    };
    return <>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-md:max-h-[90vh] max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Thêm sản phẩm</h3>
                    <button onClick={() => { setShowProductModal(false); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Danh mục</label>
                        <select required
                            name="categoryId"
                            onChange={(e) => {

                                setDataAdd({ ...dataAdd, category_id: e.target.value })
                            }}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none">
                            <option value="">Chọn Danh Mục</option>
                            {categories.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1" >Tên đầy đủ</label>
                            <input required name="name"
                                onChange={(e) => { setDataAdd({ ...dataAdd, name: e.target.value }) }}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="VD: Trà Lài Túi 500g" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1" >Định lượng</label>
                            <input required name="variant"
                                onChange={(e) => { setDataAdd({ ...dataAdd, variant: e.target.value }) }}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="VD: Túi, hộp,.." />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tồn hiện tại</label>
                            <input required type="number" name="quantity"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDataAdd({ ...dataAdd, quantity: Number(value), }

                                    )
                                }

                                }

                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Mức báo động</label>
                            <input required type="number"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDataAdd({ ...dataAdd, alert_threshold: Number(value), })

                                }}
                                name="alertLevel" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black tracking-widest mt-4 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98]">
                        LƯU THÔNG TIN
                    </button>
                </form>
            </div>
        </div>
    </>
}
export default AddProductModal