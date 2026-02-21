import { Ghost, PackageOpen } from "lucide-react"

const NoItem = () => {
    return <>
        <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-40 h-40 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
                <PackageOpen size={80} className="text-slate-200" />
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                    <Ghost size={24} className="text-[#7ED9D9]" />
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                Kho hàng đang trống rỗng
            </h3>

            <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-10">
                Bạn chưa có sản phẩm nào trong danh sách. Hãy bắt đầu bằng cách thêm sản phẩm mới hoặc nhập hàng vào kho.
            </p>


        </div>
    </>
}
export default NoItem