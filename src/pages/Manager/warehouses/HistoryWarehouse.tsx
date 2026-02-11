import { ArrowRightLeft, Calendar, ChevronDown, ClipboardCheck, Info, PackageOpen, Plus, User } from "lucide-react"
import { useWarehouseTransactions } from "../../../hooks/useWarehouseTransactions"
import LoadingState from "../../../components/ErrorAndLoading/LoadingState"
import ErrorState from "../../../components/ErrorAndLoading/ErrorState"
import { useState } from "react"
import DateTime from "../../../components/Fomat/Time_and_Duration/DateTime"

function HistoryWarehouse() {
  const [historyFilter, setHistoryFilter] = useState<string>("All")
  const { transactions, loading, error } = useWarehouseTransactions()
  if (loading) {
    return <LoadingState />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  return <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 text-left pb-20">
    {/* <h2 className="text-3xl font-black text-slate-800 mb-2">Nhật ký hoạt động</h2>
    <p className="text-slate-400 font-medium mb-10">Dòng thời gian biến động kho bãi</p> */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <h2 className="text-2xl md:text-3xl font-black text-slate-800">Hoạt động</h2>
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
        <button
          onClick={() => setHistoryFilter('All')}
          className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'All' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setHistoryFilter('Nhập hàng')}
          className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Nhập hàng' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Nhập
        </button>
        <button
          onClick={() => setHistoryFilter('Kiểm kho')}
          className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Kiểm kho' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Kiểm
        </button>
      </div>
    </div>

    {transactions.map((h: any) => (
      <div key={h.id} className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
          <div className="flex gap-4 md:gap-5">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm bg-white ${h?.type === 'IMPORT' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
              {h?.type === 'IMPORT' ? <Plus size={24} /> : <ClipboardCheck size={24} />}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight leading-tight">{h?.title}</h3>
              <p className="text-[9px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"><DateTime value={h?.created_at} /> • {h?.created_by?.last_name}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest shrink-0 ${h.type === 'Nhập hàng' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {h?.type === "IMPORT" ? 'Nhập hàng' : 'Kiểm kho'}
          </span>
        </div>

        <div className="px-5 md:px-8 py-4 md:py-6 overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                <th className="pb-4 font-black">Vật liệu</th>
                <th className="pb-4 text-center font-black">Trước</th>
                <th className="pb-4 text-center font-black">Lệch</th>
                <th className="pb-4 text-right font-black">Sau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {h.items.map((it: any) => (
                <tr key={it?.id}>
                  <td className="py-4 text-xs md:text-sm font-bold text-slate-600">{it?.product?.name}</td>
                  <td className="py-4 text-center text-xs md:text-sm font-bold text-slate-400">
                    {it?.before_quantity} <span className="text-[9px] uppercase">{it?.product?.variant || ''}</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] md:text-xs font-black px-2 py-1 rounded-lg ${it?.quantity_change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {it.quantity_change > 0 ? `+${it.quantity_change}` : it.quantity_change}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xs md:text-sm font-black text-slate-800">
                      {it?.after_quantity} <span className="text-[9px] uppercase">{it?.product?.variant || ''}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {h.note && (
          <div className="mx-5 md:mx-8 mb-5 md:mb-8 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-3 items-start">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm font-medium text-amber-800 italic leading-relaxed">"{h?.note}"</p>
          </div>
        )}
      </div>
    ))}
    {transactions.length === 0 && (
      <div className="py-20 flex flex-col items-center justify-center opacity-20">
        <PackageOpen size={60} />
        <p className="mt-4 font-black">Chưa có lịch sử giao dịch</p>
      </div>
    )}
  </div>
}
export default HistoryWarehouse