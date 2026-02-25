import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreateProductPayload } from "../../../hooks/userProducts";

interface AddProductModalProps {
    categories: any,
    product: any,
    setProductEditAndDel: React.Dispatch<any>,
    setShowProductModal: React.Dispatch<React.SetStateAction<boolean>>,
    fetchProducts: () => Promise<void>,
    updateProduct: (id: string, payload: Partial<CreateProductPayload>) => Promise<void>
}
interface dataform {
    name: string,
    quantity: number;
    variant: string;
    alert_threshold: number;
    category_id: string;
    status_id: string;
}
const EditProductModal = ({ categories, product, setProductEditAndDel, setShowProductModal, fetchProducts, updateProduct }: AddProductModalProps) => {
    const [dataEdit, setDataEdit] = useState<dataform>(
        {
            name: '', quantity: 0, variant: '', alert_threshold: 0, category_id: '', status_id: 'out'
        }
    )
    useEffect(() => {
        if (product) {
            setDataEdit({
                name: product.name,
                quantity: product.quantity,
                variant: product.variant,
                alert_threshold: product.alert_threshold,
                category_id: product.category?.id || '',
                status_id: product.status?.id || 'out'
            })
        }
    }, [product])
    useEffect(() => {
        let newStatus = 'out'

        if (dataEdit.quantity <= 0) {
            newStatus = 'out'
        } else if (dataEdit.quantity > dataEdit.alert_threshold) {
            newStatus = 'fine'
        } else {
            newStatus = 'low'
        }

        setDataEdit(prev => ({
            ...prev,
            status_id: newStatus
        }))
    }, [dataEdit.quantity, dataEdit.alert_threshold])

    const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // const formData = new FormData(e.currentTarget);
        updateProduct(product?.id, dataEdit
        )
        fetchProducts()
        console.log(dataEdit)
        setShowProductModal(false);
    };
    console.log(dataEdit)
    return <>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-md:max-h-[90vh] max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Chỉnh sửa sản phẩm</h3>
                    <button
                        onClick={() => {
                            setShowProductModal(false);
                            setProductEditAndDel(null)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Danh mục</label>
                        <select required
                            name="categoryId"
                            value={dataEdit.category_id}
                            onChange={(e) => {

                                setDataEdit({ ...dataEdit, category_id: e.target.value })
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
                                defaultValue={product?.name}
                                onChange={(e) => { setDataEdit({ ...dataEdit, name: e.target.value }) }}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="VD: Trà Lài Túi 500g" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1" >Định lượng</label>
                            <input required name="variant"
                                defaultValue={product?.variant}
                                onChange={(e) => { setDataEdit({ ...dataEdit, variant: e.target.value }) }}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="VD: Túi, hộp,.." />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tồn hiện tại</label>
                            <input required type="number" name="quantity"
                                defaultValue={product?.quantity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDataEdit({ ...dataEdit, quantity: Number(value), }

                                    )
                                }

                                }

                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Mức báo động</label>
                            <input required type="number"
                                defaultValue={product?.alert_threshold}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDataEdit({ ...dataEdit, alert_threshold: Number(value), })

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
export default EditProductModal