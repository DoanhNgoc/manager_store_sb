import { Clock, Quote, Star, Trash2 } from "lucide-react"
import DateOnly from "../../../../components/Fomat/Time_and_Duration/DateOnly";
import { getISOWeekInfo } from "../../../../Utils/getWeekInfo";

interface ListReviewsProps {
    itemReview: any,
    setDeleteConfirm: React.Dispatch<React.SetStateAction<string | null>>,
    userMap: Record<string, any>,
}
function getUidFromRef(ref: any): string | null {
    return ref?._path?.segments?.[1] ?? null;
}

const ItemReview = ({ itemReview, setDeleteConfirm, userMap }: ListReviewsProps) => {
    const creatorUid = getUidFromRef(itemReview.user_create);
    const reviewerUid = getUidFromRef(itemReview.user_review);
    const creator = creatorUid ? userMap[creatorUid] : null;
    const reviewer = reviewerUid ? userMap[reviewerUid] : null;
    const creatorName = creator
        ? `${creator.first_name} ${creator.last_name}`
        : "—";
    const reviewerName = reviewer
        ? `${reviewer.first_name} ${reviewer.last_name}`
        : "—";

    const weekInfo = itemReview?.start_week
        ? getISOWeekInfo(itemReview.start_week)
        : null;
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            {/* Delete Action Button */}
            <button
                onClick={() => setDeleteConfirm(itemReview)}
                className="absolute top-6 right-6 p-3 bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Xóa đánh giá"
            >
                <Trash2 size={18} />
            </button>


            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-teal-50 text-[#00928f] rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-[#00928f] group-hover:text-white transition-colors">
                            {reviewerName.trim().split(" ").pop()?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#00928f] transition-colors">
                                {reviewerName}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {reviewer
                                    ? `${reviewer.id_member}`
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-black text-slate-400">
                                TUẦN {weekInfo?.weekNumber}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">
                                <DateOnly value={itemReview?.start_week} /> → <DateOnly value={itemReview?.end_week} />
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                            <Clock size={12} />
                            Ngày chốt: <DateOnly value={itemReview.created_at} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 pr-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} className={i < itemReview.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người đánh giá:</span>
                            <span className="text-xs font-black text-slate-700">
                                {creatorName}
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <Quote size={40} className="absolute -top-4 -left-2 text-[#00928f] opacity-5" />
                        <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                            "{itemReview.content}"
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )

}
export default ItemReview