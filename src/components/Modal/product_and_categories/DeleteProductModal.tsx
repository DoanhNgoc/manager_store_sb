import { AlertOctagon } from "lucide-react"
interface DeleteProductModalProps {
    product: any,
    setShowDelPro: React.Dispatch<React.SetStateAction<boolean>>,
    setProductEditAndDel: React.Dispatch<any>,

    fetchProducts: () => Promise<void>,
    deleteProduct: (id: string) => Promise<void>

}
const DeleteProductModal = ({ product, setShowDelPro, setProductEditAndDel, fetchProducts, deleteProduct }: DeleteProductModalProps) => {
    const confirmDeleteProduct = () => {
        deleteProduct(product?.id)
        fetchProducts()
        setShowDelPro(false)
        setProductEditAndDel(null)
    }
    return <>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-3xlbg-red-50 text-red-500`}>
                        <AlertOctagon size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa sản phẩm</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Bạn có chắc chắn muốn xóa <span className="font-black text-slate-800 ">{product?.name}</span>? Hành động này không thể hoàn tác.</p>

                    <div className="grid grid-cols-2 gap-3 w-full mt-6">
                        <button
                            onClick={() => {
                                setShowDelPro(false)
                                setProductEditAndDel(null)
                            }}

                            className="p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={confirmDeleteProduct}
                            className={`p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 bg-red-500 shadow-red-200 hover:bg-red-600`}
                        >
                            Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default DeleteProductModal