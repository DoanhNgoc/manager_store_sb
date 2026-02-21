import { Package } from "lucide-react"

const NoProduct = () => {
    return <>
        <div className="col-span-full py-20 text-center space-y-4">
            <div className="inline-block p-6 bg-slate-50 rounded-full text-slate-300"><Package size={48} /></div>
            <p className="text-slate-400 font-bold">Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </div>
    </>
}
export default NoProduct