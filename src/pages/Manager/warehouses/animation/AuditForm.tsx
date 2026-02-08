interface AuditFormProps {
    products: any,
    setView: React.Dispatch<React.SetStateAction<string>>

}
const AuditForm = ({ products, setView }: AuditFormProps) => {
    return <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Đối soát kho thực tế</h3>
                <p className="text-slate-400 text-sm font-medium">Cập nhật số lượng khớp với thực tế kiểm đếm</p>
            </div>
            <div className="flex gap-4">
                <button onClick={() => setView('home')} className="px-8 py-3.5 font-black text-slate-400 hover:text-slate-600">Hủy</button>
            </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
                <thead className="bg-white sticky top-0 border-b border-slate-50">
                    <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <th className="px-10 py-6">Vật liệu</th>
                        <th className="px-10 py-6 text-center">Tồn hệ thống</th>
                        <th className="px-10 py-6 text-center">Thực tế đếm</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {products.map((p: any) => (
                        <tr key={p?.id} className="hover:bg-slate-50/30">
                            <td className="px-10 py-5 font-bold text-slate-700">{p?.name}</td>
                            <td className="px-10 py-5 text-center text-slate-400 font-bold">{p?.quantity} {p?.variant}</td>
                            <td className="px-10 py-5 text-center">
                                <input
                                    type="number"
                                    className="w-24 bg-slate-100 border-none rounded-xl px-4 py-2 font-black text-center"
                                    placeholder={p?.quantity}
                                //   onBlur={(e) => {
                                //     const val = parseInt(e.target.value);
                                //     if (!isNaN(val)) {
                                //       const updated = products.map(item => item.product_id === p.product_id ? {...item, quantity: val} : item);
                                //       setProducts(updated);
                                //     }
                                //   }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end">
            <button
                //   onClick={() => { showNotify("Đã cập nhật kiểm kho"); setView('dashboard'); }} 
                className="px-12 py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl">Xác nhận hoàn tất</button>
        </div>
    </div>
}
export default AuditForm