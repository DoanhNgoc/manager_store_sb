import { useState, useEffect } from "react";
import { Star, Calendar, User, MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface Review {
    id: string;
    content: string;
    rating: number;
    start_week: any;
    end_week: any;
    created_at: any;
    user_create: any;
}

export default function StaffReview() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    useEffect(() => {
        fetchReviews();
    }, [userId]);

    const fetchReviews = async () => {
        if (!userId) {
            console.log("No userId available");
            setLoading(false);
            return;
        }
        console.log("Fetching reviews for userId:", userId);
        setLoading(true);
        try {
            // Gọi API lấy review theo userId
            const res = await fetch(`http://localhost:3001/api/review-weeks/user/${userId}`);
            const json = await res.json();
            console.log("API response:", json);
            if (json.success && Array.isArray(json.data)) {
                setReviews(json.data);
                if (json.data.length > 0) {
                    setSelectedReview(json.data[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            if (timestamp._seconds) {
                return new Date(timestamp._seconds * 1000).toLocaleDateString('vi-VN');
            }
            if (timestamp.seconds) {
                return new Date(timestamp.seconds * 1000).toLocaleDateString('vi-VN');
            }
            return new Date(timestamp).toLocaleDateString('vi-VN');
        } catch {
            return "N/A";
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "text-green-500";
        if (rating >= 3) return "text-yellow-500";
        return "text-red-500";
    };

    const getRatingBg = (rating: number) => {
        if (rating >= 4) return "bg-green-50";
        if (rating >= 3) return "bg-yellow-50";
        return "bg-red-50";
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return "Xuất sắc";
        if (rating >= 4) return "Tốt";
        if (rating >= 3) return "Khá";
        if (rating >= 2) return "Trung bình";
        return "Cần cải thiện";
    };

    const getTrend = (currentRating: number, index: number) => {
        if (index >= reviews.length - 1) return null;
        const prevRating = reviews[index + 1]?.rating || 0;
        if (currentRating > prevRating) return "up";
        if (currentRating < prevRating) return "down";
        return "same";
    };

    // Stats
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0";
    const excellentCount = reviews.filter(r => r.rating >= 4).length;
    const needImprovementCount = reviews.filter(r => r.rating < 3).length;

    const renderStars = (rating: number, size: number = 16) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={size}
                        className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Đánh giá tuần</h1>
                <p className="text-slate-500 mt-1">Xem đánh giá từ quản lý</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009099]"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Chưa có đánh giá nào</p>
                    <p className="text-sm text-slate-400 mt-1">Đánh giá sẽ được cập nhật hàng tuần bởi quản lý</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-[#009099] to-[#007a82] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-xs sm:text-sm">Điểm trung bình</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl sm:text-3xl font-bold">{avgRating}</p>
                                        <Star size={20} className="text-yellow-300 fill-yellow-300 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
                                    <Star size={20} className="text-yellow-300 fill-yellow-300 sm:w-7 sm:h-7" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-50 flex items-center justify-center">
                                    <TrendingUp size={20} className="text-green-500 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500">Đánh giá tốt</p>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-800">{excellentCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-50 flex items-center justify-center">
                                    <MessageSquare size={20} className="text-orange-500 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500">Tổng đánh giá</p>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-800">{reviews.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Review Detail */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800">Chi tiết đánh giá</h3>
                            </div>

                            {selectedReview ? (
                                <div className="p-6">
                                    {/* Rating Header */}
                                    <div className={`${getRatingBg(selectedReview.rating)} rounded-xl p-6 mb-6`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Điểm đánh giá</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-4xl font-bold ${getRatingColor(selectedReview.rating)}`}>
                                                        {selectedReview.rating}
                                                    </span>
                                                    {renderStars(selectedReview.rating, 24)}
                                                </div>
                                                <p className={`mt-2 font-medium ${getRatingColor(selectedReview.rating)}`}>
                                                    {getRatingLabel(selectedReview.rating)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Week Info */}
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                        <Calendar size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-slate-500">Tuần đánh giá</p>
                                            <p className="font-semibold text-slate-800">
                                                {formatDate(selectedReview.start_week)} - {formatDate(selectedReview.end_week)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-2">Nhận xét từ quản lý</p>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <p className="text-slate-700 leading-relaxed">
                                                {selectedReview.content || "Không có nhận xét"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Manager Info */}
                                    {selectedReview.user_create && (
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#009099]/10 flex items-center justify-center">
                                                <User size={18} className="text-[#009099]" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500">Người đánh giá</p>
                                                <p className="font-medium text-slate-800">
                                                    {selectedReview.user_create?.first_name || ""} {selectedReview.user_create?.last_name || "Quản lý"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                    Chọn một đánh giá để xem chi tiết
                                </div>
                            )}
                        </div>

                        {/* Review History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800">Lịch sử đánh giá</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                {reviews.map((review, index) => {
                                    const trend = getTrend(review.rating, index);
                                    return (
                                        <button
                                            key={review.id}
                                            onClick={() => setSelectedReview(review)}
                                            className={`w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors ${
                                                selectedReview?.id === review.id ? 'bg-[#009099]/5 border-l-4 border-[#009099]' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.rating, 14)}
                                                    <span className={`font-bold ${getRatingColor(review.rating)}`}>
                                                        {review.rating}
                                                    </span>
                                                </div>
                                                {trend && (
                                                    <div className={`p-1 rounded ${
                                                        trend === 'up' ? 'bg-green-50' : 
                                                        trend === 'down' ? 'bg-red-50' : 'bg-slate-50'
                                                    }`}>
                                                        {trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                                        {trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                                                        {trend === 'same' && <Minus size={14} className="text-slate-400" />}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {formatDate(review.start_week)} - {formatDate(review.end_week)}
                                            </p>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                {review.content || "Không có nhận xét"}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
