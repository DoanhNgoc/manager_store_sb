import { Filter, ListFilter, UserCircle } from "lucide-react"

const FilterReview = () => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400">
                <Filter size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Bộ lọc:</span>
            </div>

            <div className="flex-1 min-w-[200px]">
                <div className="relative">
                    <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-600 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#00928f]/30"
                    // value={filterEmpId}
                    // onChange={(e) => setFilterEmpId(e.target.value)}
                    >
                        <option value="all">Tất cả nhân viên</option>
                        {/* {employees.map((e: any) => (
                                        <option key={e.id} value={e.id}>{e.lastName} {e.firstName}</option>
                                    ))} */}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-w-[200px]">
                <div className="relative">
                    <ListFilter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-600 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#00928f]/30"
                    // value={filterWeek}
                    // onChange={(e) => setFilterWeek(e.target.value)}
                    >
                        <option value="all">Tất cả các tuần</option>
                        {/* {availableWeeks.map((w: any) => (
                                        <option key={w} value={w}>Tuần {w}</option>
                                    ))} */}
                    </select>
                </div>
            </div>

            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-auto">
                Hiển thị
                {/* {filteredReviews.length}  */}
                kết quả
            </div>
        </div>
    )
}
export default FilterReview