import { useState } from "react";
import FilterReview from "../../../../components/Filter/FilterReview";

import ErrorState from "../../../../components/ErrorAndLoading/ErrorState"
import LoadingState from "../../../../components/ErrorAndLoading/LoadingState"
import { useReviewWeek } from "../../../../hooks/useReviewWeek"
import ConfirmDeleteReviewModal from "../../../../components/Modal/review_week/ConfirmDeleteReviewModal";
import FormAddReview from "../animation/FormAddReview";
import { Plus, Quote } from "lucide-react";
import { useUsersMap } from "../../../../hooks/useUsersMap";
import ItemReview from "./ItemReview";




const PersonnelEvaluation = () => {
    const [view, setView] = useState<boolean>(false)
    const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);

    const userMap = useUsersMap()
    const { reviews, loading, error, deleteReviewWeek, createReviewWeek, reload } = useReviewWeek()
    if (loading) {
        return <LoadingState />
    }
    if (!Object.keys(userMap).length) {
        return <LoadingState />

    }
    if (error) {
        return <ErrorState message={error} />
    }




    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Đánh giá Nhân sự</h1>
                    <p className="text-slate-500 font-medium mt-1">Quản lý hiệu suất hàng tuần của đội ngũ.</p>
                </div>
                {!view && (
                    <button
                        onClick={() => setView(!view)}
                        className="bg-[#00928f] hover:bg-[#007a78] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#00928f]/20 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Viết đánh giá mới
                    </button>
                )}
            </div>

            {!view ? (
                <div className="space-y-8">
                    {/* Filter Bar */}
                    <FilterReview />

                    {/* Reviews List */}
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.length === 0
                            ?
                            (
                                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
                                    <Quote size={48} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-slate-400 font-medium italic">Không tìm thấy đánh giá nào phù hợp với bộ lọc.</p>
                                    <button
                                        //  onClick={() => { setFilterEmpId('all'); setFilterWeek('all'); }}
                                        className="mt-4 text-[#00928f] text-xs font-bold uppercase tracking-widest hover:underline"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            )
                            :
                            (
                                reviews.map((item: any) =>

                                (
                                    <ItemReview itemReview={item} setDeleteConfirm={setDeleteConfirm} userMap={userMap} key={item.id} />
                                ))
                            )}

                    </div>
                </div>
            ) : (
                // Form: Add Review 
                <FormAddReview setView={setView} createReviewWeek={createReviewWeek} onSuccess={reload} />
            )
            }

            {/* //     Delete Confirmation Modal */}
            {deleteConfirm && (
                <ConfirmDeleteReviewModal setDeleteConfirm={setDeleteConfirm} deleteReviewWeek={deleteReviewWeek} deleteConfirm={deleteConfirm} />
            )}
        </div >

    )
}
export default PersonnelEvaluation
