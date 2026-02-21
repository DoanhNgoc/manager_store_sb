import { Edit3, Package, Trash2 } from "lucide-react"

import NoProduct from "./NoProduct"
import { useState } from "react"

interface ProductBylistProductsProps {
    nameCategory: string | null,
    listProducts: any[],

}

const ProductBylistProducts = ({ nameCategory, listProducts }: ProductBylistProductsProps) => {
    const [editingProduct, setEditingProduct] = useState<any | null>(null)
    return <>
        <div className="p-6 flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                {nameCategory === null ? 'Tất cả sản phẩm' : nameCategory}
            </h3>
            <div className="text-[10px] font-bold text-slate-400">
                {listProducts?.length} kết quả
            </div>
        </div>

        {/* products */}
        <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {listProducts?.length === 0 ? <NoProduct /> : (listProducts?.map(p => (
                <div key={p?.id} className="p-5 border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${p?.quantity <= p?.alert_threshold ? 'bg-red-50' : 'bg-slate-50'}`}>
                            <Package size={20} className={p?.quantity <= p?.alert_threshold ? 'text-red-500' : 'text-slate-400'} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                // onClick={() => { setEditingProduct(p); setShowProductModal(true); }} 
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit3 size={16} /></button>
                            <button
                                // onClick={() => requestDeleteProduct(p)} 
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={16} /></button>
                        </div>
                    </div>
                    <div>
                        <p className="font-black text-slate-800 leading-tight mb-1">{p?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p?.id_product}</p>
                    </div>
                    <div className="mt-6 flex items-end justify-between border-t border-slate-50 pt-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Tồn kho</p>
                            <p className={`text-2xl font-black ${p?.quantity <= p?.alert_threshold ? 'text-red-500' : 'text-slate-800'}`}>{p?.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Định mức</p>
                            <p className="font-bold text-slate-500 text-sm">Dưới {p?.alert_threshold}</p>
                        </div>
                    </div>
                </div>
            )))}
        </div>
    </>
}
export default ProductBylistProducts

