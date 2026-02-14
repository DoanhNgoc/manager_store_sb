import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getFullProfile, updateBasicInfo, uploadAvatar, getPersonalStats } from "../../../backend/servers/users/profile.service";
import {
    User, Mail, Phone, Calendar, Briefcase, Clock, Award,
    Camera, Edit3, Save, X, Wallet, TrendingUp, AlertCircle
} from "lucide-react";

interface ProfileData {
    uid: string;
    id_member: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar: string;
    dob: Date | null;
    experience: Date | null;
    salary: number;
    role_name: string;
    create_at: Date | null;
}

interface StatsData {
    totalDaysThisMonth: number;
    lateDaysThisMonth: number;
    totalHoursThisMonth: number;
    avgRating: number;
    totalReviews: number;
}

export default function StaffProfile() {
    const { uidAuth, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState("");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Chờ auth loading xong và có uidAuth
        if (!authLoading && uidAuth) {
            loadData();
        } else if (!authLoading && !uidAuth) {
            setLoading(false);
        }
    }, [uidAuth, authLoading]);

    const loadData = async () => {
        if (!uidAuth) return;
        setLoading(true);
        try {
            console.log("Loading profile for uid:", uidAuth);
            const [profileData, statsData] = await Promise.all([
                getFullProfile(uidAuth),
                getPersonalStats(uidAuth)
            ]);
            console.log("Profile data:", profileData);
            console.log("Stats data:", statsData);
            
            if (profileData) {
                setProfile(profileData);
                setEditPhone(profileData.phone);
            }
            if (statsData) {
                setStats(statsData);
            }
        } catch (err) {
            console.error("Load profile error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uidAuth) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("File ảnh không được vượt quá 5MB");
            return;
        }

        setUploading(true);
        try {
            const newAvatarUrl = await uploadAvatar(uidAuth, file);
            setProfile(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
        } catch (err) {
            console.error("Upload avatar error:", err);
            alert("Lỗi upload ảnh. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    const handleSavePhone = async () => {
        if (!uidAuth) return;
        setSaving(true);
        try {
            await updateBasicInfo(uidAuth, { phone: editPhone });
            setProfile(prev => prev ? { ...prev, phone: editPhone } : null);
            setIsEditing(false);
        } catch (err) {
            console.error("Save phone error:", err);
            alert("Lỗi cập nhật. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("vi-VN");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    };

    const calculateExperience = (startDate: Date | null) => {
        if (!startDate) return "—";
        const start = new Date(startDate);
        const now = new Date();
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (years > 0) {
            return `${years} năm ${remainingMonths} tháng`;
        }
        return `${remainingMonths} tháng`;
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#009099] border-t-transparent"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-slate-600">Không thể tải thông tin cá nhân</p>
                <p className="text-slate-400 text-sm mt-2">UID: {uidAuth || "không có"}</p>
                <button 
                    onClick={loadData}
                    className="mt-4 px-4 py-2 bg-[#009099] text-white rounded-lg hover:bg-[#007a7a]"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Card - Avatar & Basic Info */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#009099] to-[#00b4b4] h-24 sm:h-32"></div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-16">
                        {/* Avatar */}
                        <div className="relative">
                            <div 
                                onClick={handleAvatarClick}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl border-4 border-white bg-slate-200 overflow-hidden cursor-pointer group shadow-lg"
                            >
                                {profile.avatar ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-300">
                                        <User size={36} className="text-slate-500 sm:w-12 sm:h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Camera size={20} className="text-white sm:w-6 sm:h-6" />
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 pt-2 sm:pt-4 sm:pt-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                                {profile.first_name} {profile.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#009099]/10 text-[#009099] rounded-full text-xs sm:text-sm font-medium">
                                    {profile.role_name}
                                </span>
                                <span className="text-slate-500 text-xs sm:text-sm">
                                    Mã NV: {profile.id_member}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Thông tin liên hệ</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-[#009099] hover:bg-[#009099]/10 rounded-lg transition-colors"
                                >
                                    <Edit3 size={14} className="sm:w-4 sm:h-4" />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditPhone(profile.phone);
                                        }}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={14} className="sm:w-4 sm:h-4" />
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSavePhone}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-[#009099] text-white rounded-lg hover:bg-[#007a7a] transition-colors disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <Save size={14} className="sm:w-4 sm:h-4" />
                                        )}
                                        Lưu
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                    <Mail size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Email</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                                    <Phone size={16} className="text-green-600 sm:w-5 sm:h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs text-slate-500">Số điện thoại</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 sm:py-1 focus:outline-none focus:border-[#009099]"
                                        />
                                    ) : (
                                        <p className="text-xs sm:text-sm font-medium text-slate-800">{profile.phone || "—"}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                                    <Calendar size={16} className="text-purple-600 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Ngày sinh</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-800">{formatDate(profile.dob)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
                                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                                    <Briefcase size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Ngày vào làm</p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-800">{formatDate(profile.experience)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Info */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Thông tin công việc</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl border border-emerald-100">
                                <div className="p-2 sm:p-3 bg-emerald-500 rounded-lg sm:rounded-xl">
                                    <Wallet size={20} className="text-white sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Lương cơ bản</p>
                                    <p className="text-base sm:text-lg font-bold text-emerald-600">{formatCurrency(profile.salary)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-100">
                                <div className="p-2 sm:p-3 bg-blue-500 rounded-lg sm:rounded-xl">
                                    <Clock size={20} className="text-white sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500">Thâm niên</p>
                                    <p className="text-base sm:text-lg font-bold text-blue-600">{calculateExperience(profile.experience)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Monthly Stats */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Thống kê tháng này</h2>
                        
                        {stats ? (
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-[#009099]/10 rounded-lg">
                                            <Calendar size={14} className="text-[#009099] sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                        <span className="text-xs sm:text-sm text-slate-600">Ngày công</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-slate-800">{stats.totalDaysThisMonth}</span>
                                </div>

                                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                            <Clock size={14} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                        <span className="text-xs sm:text-sm text-slate-600">Tổng giờ làm</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-slate-800">{stats.totalHoursThisMonth}h</span>
                                </div>

                                <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                                            <AlertCircle size={14} className="text-red-500 sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                        <span className="text-xs sm:text-sm text-slate-600">Số lần đi muộn</span>
                                    </div>
                                    <span className={`text-base sm:text-lg font-bold ${stats.lateDaysThisMonth > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {stats.lateDaysThisMonth}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg sm:rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 bg-amber-400 rounded-lg">
                                            <Award size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                        <span className="text-xs sm:text-sm text-slate-600">Điểm đánh giá TB</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-base sm:text-lg font-bold text-amber-600">{stats.avgRating}/5</span>
                                        <p className="text-[10px] sm:text-xs text-slate-500">({stats.totalReviews} đánh giá)</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4 text-sm">Không có dữ liệu</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Truy cập nhanh</h2>
                        <div className="space-y-1 sm:space-y-2">
                            <a href="/dashboard/staff/attendance" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-colors">
                                <Clock size={16} className="text-[#009099] sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm text-slate-700">Xem chấm công</span>
                            </a>
                            <a href="/dashboard/staff/salary" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-colors">
                                <Wallet size={16} className="text-[#009099] sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm text-slate-700">Xem bảng lương</span>
                            </a>
                            <a href="/dashboard/staff/review" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-colors">
                                <TrendingUp size={16} className="text-[#009099] sm:w-[18px] sm:h-[18px]" />
                                <span className="text-xs sm:text-sm text-slate-700">Xem đánh giá</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
