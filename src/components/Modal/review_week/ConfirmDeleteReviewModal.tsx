import { AlertCircle } from "lucide-react";
interface ConfirmDeleteReviewModalProps {
    deleteReviewWeek: (id: string) => Promise<void>,
    setDeleteConfirm: React.Dispatch<any>,
    deleteConfirm: any
}
const ConfirmDeleteReviewModal = ({ deleteReviewWeek, setDeleteConfirm, deleteConfirm }: ConfirmDeleteReviewModalProps) => {
    const submitRemoveReview = (review_id: string) => {
        deleteReviewWeek(review_id)
        setDeleteConfirm(null)
    }
    return <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">Bạn có chắc chắn muốn xóa bản đánh giá này không? Hành động này không thể hoàn tác.</p>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setDeleteConfirm(null)}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    onClick={() => { submitRemoveReview(deleteConfirm?.id) }}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                >
                    Đồng ý xóa
                </button>
            </div>
        </div>
    </div>
}
export default ConfirmDeleteReviewModal