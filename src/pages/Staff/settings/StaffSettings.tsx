import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
    changePassword, 
    getNotificationSettings, 
    updateNotificationSettings 
} from "../../../backend/servers/users/settings.service";
import {
    Lock, Bell, Eye, EyeOff, Save, Check, X,
    Calendar, Wallet, MessageCircle, Phone, User, 
    Shield, ChevronDown, AlertCircle
} from "lucide-react";

type TabType = "account" | "notifications" | "support";

export default function StaffSettings() {
    const { uidAuth, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("account");
    const [mobileTabOpen, setMobileTabOpen] = useState(false);
    
    // Password state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Notification state
    const [emailSchedule, setEmailSchedule] = useState(true);
    const [emailSalary, setEmailSalary] = useState(true);
    const [initialEmailSchedule, setInitialEmailSchedule] = useState(true);
    const [initialEmailSalary, setInitialEmailSalary] = useState(true);
    const [notifLoading, setNotifLoading] = useState(false);

    // Track unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return emailSchedule !== initialEmailSchedule || emailSalary !== initialEmailSalary;
    }, [emailSchedule, emailSalary, initialEmailSchedule, initialEmailSalary]);

    useEffect(() => {
        if (uidAuth) loadSettings();
    }, [uidAuth]);

    const loadSettings = async () => {
        if (!uidAuth) return;
        try {
            const settings = await getNotificationSettings(uidAuth);
            setEmailSchedule(settings.emailSchedule);
            setEmailSalary(settings.emailSalary);
            setInitialEmailSchedule(settings.emailSchedule);
            setInitialEmailSalary(settings.emailSalary);
        } catch (err) {
            console.error("Load settings error:", err);
        }
    };

    // Password strength calculator
    const passwordStrength = useMemo(() => {
        if (!newPassword) return { level: 0, text: "", color: "" };
        let score = 0;
        if (newPassword.length >= 6) score++;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        
        if (score <= 2) return { level: 1, text: "Yếu", color: "bg-red-500" };
        if (score <= 3) return { level: 2, text: "Trung bình", color: "bg-yellow-500" };
        return { level: 3, text: "Mạnh", color: "bg-green-500" };
    }, [newPassword]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin" });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
            return;
        }

        setPasswordLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setPasswordMessage({ type: "error", text: "Mật khẩu cũ không đúng" });
            } else {
                setPasswordMessage({ type: "error", text: "Đổi mật khẩu thất bại" });
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!uidAuth) return;
        setNotifLoading(true);
        try {
            await updateNotificationSettings(uidAuth, { emailSchedule, emailSalary });
            setInitialEmailSchedule(emailSchedule);
            setInitialEmailSalary(emailSalary);
        } catch (err) {
            console.error("Save notifications error:", err);
        } finally {
            setNotifLoading(false);
        }
    };

    const handleCancelChanges = () => {
        setEmailSchedule(initialEmailSchedule);
        setEmailSalary(initialEmailSalary);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#009099] border-t-transparent"></div>
            </div>
        );
    }

    const tabs = [
        { id: "account" as TabType, label: "Tài khoản" },
        { id: "notifications" as TabType, label: "Thông báo" },
        { id: "support" as TabType, label: "Hỗ trợ" },
    ];

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800">Cài đặt</h1>
                <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản, thông báo và hỗ trợ</p>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Mobile Tab Dropdown */}
            <div className="md:hidden mb-4 relative">
                <button
                    onClick={() => setMobileTabOpen(!mobileTabOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl"
                >
                    <span className="font-medium text-slate-800">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${mobileTabOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileTabOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMobileTabOpen(false); }}
                                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-[#009099]/10 text-[#009099]"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Grid - Full width */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Account Tab Content */}
                    {activeTab === "account" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="p-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#009099]/10 rounded-xl flex items-center justify-center">
                                        <Lock size={20} className="text-[#009099]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Đổi mật khẩu</h2>
                                        <p className="text-sm text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Old Password */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                                        <div className="relative">
                                            <input
                                                type={showOldPassword ? "text" : "password"}
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="w-full h-11 px-4 pr-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] text-sm"
                                                placeholder="Nhập mật khẩu hiện tại"
                                            />
                                            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full h-11 px-4 pr-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] text-sm"
                                                placeholder="Ít nhất 6 ký tự"
                                            />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {/* Password Strength */}
                                        {newPassword && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                                                    <div className={`h-full w-1/3 rounded-full transition-colors ${passwordStrength.level >= 1 ? passwordStrength.color : "bg-slate-200"}`}></div>
                                                    <div className={`h-full w-1/3 rounded-full transition-colors ${passwordStrength.level >= 2 ? passwordStrength.color : "bg-slate-200"}`}></div>
                                                    <div className={`h-full w-1/3 rounded-full transition-colors ${passwordStrength.level >= 3 ? passwordStrength.color : "bg-slate-200"}`}></div>
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength.level === 1 ? "text-red-500" : 
                                                    passwordStrength.level === 2 ? "text-yellow-600" : "text-green-500"
                                                }`}>{passwordStrength.text}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full h-11 px-4 pr-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] text-sm"
                                                placeholder="Nhập lại mật khẩu mới"
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                {passwordMessage && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${
                                        passwordMessage.type === "success" 
                                            ? "bg-green-50 text-green-700 border border-green-200" 
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}>
                                        {passwordMessage.type === "success" ? <Check size={16} /> : <X size={16} />}
                                        {passwordMessage.text}
                                    </div>
                                )}

                                {/* Submit Button - Right aligned */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="h-10 px-5 flex items-center gap-2 bg-[#009099] text-white rounded-xl text-sm font-medium hover:bg-[#007a7a] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {passwordLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                <Shield size={16} />
                                                Cập nhật mật khẩu
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Notifications Tab Content */}
                    {activeTab === "notifications" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="p-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Bell size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Thông báo email</h2>
                                        <p className="text-sm text-slate-500">Chọn loại thông báo bạn muốn nhận</p>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {/* Schedule Notification */}
                                <div className="flex items-center justify-between p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Calendar size={18} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Lịch làm việc mới</p>
                                            <p className="text-xs text-slate-500">Nhận email khi quản lý tạo lịch làm việc mới cho bạn</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={emailSchedule} onChange={(e) => setEmailSchedule(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#009099] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm"></div>
                                    </label>
                                </div>

                                {/* Salary Notification */}
                                <div className="flex items-center justify-between p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Wallet size={18} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Cập nhật lương</p>
                                            <p className="text-xs text-slate-500">Nhận email khi có thay đổi về lương hoặc phụ cấp</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={emailSalary} onChange={(e) => setEmailSalary(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#009099] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support Tab Content - Mobile only shows here */}
                    {activeTab === "support" && (
                        <div className="lg:hidden">
                            <SupportCard />
                            <div className="mt-4">
                                <AppInfoCard />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - 1/3 width (Desktop only, sticky) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <SupportCard />
                        <AppInfoCard />
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            {hasUnsavedChanges && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
                    <div className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">Bạn có thay đổi chưa lưu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancelChanges}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveNotifications}
                                disabled={notifLoading}
                                className="px-4 py-2 text-sm font-medium bg-[#009099] text-white rounded-lg hover:bg-[#007a7a] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {notifLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Save size={16} />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Support Card Component
function SupportCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Hỗ trợ</h3>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#009099] to-[#00b4b4] rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-800">Nguyễn Hữu Thanh</p>
                        <p className="text-xs text-slate-500">Hỗ trợ kỹ thuật</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <a 
                        href="https://zalo.me/0368600557" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <MessageCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">Zalo</p>
                            <p className="text-xs text-slate-500">0368 600 557</p>
                        </div>
                        <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Nhắn tin →</span>
                    </a>

                    <a 
                        href="tel:0368600557"
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <Phone size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">Điện thoại</p>
                            <p className="text-xs text-slate-500">0368 600 557</p>
                        </div>
                        <span className="text-xs text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">Gọi ngay →</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

// App Info Card Component
function AppInfoCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Thông tin ứng dụng</h3>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Phiên bản</span>
                    <span className="text-sm font-medium text-[#009099]">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Cửa hàng</span>
                    <span className="text-sm font-medium text-slate-800">Sunday Basic</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Chi nhánh</span>
                    <span className="text-sm font-medium text-slate-800">Nguyễn Thượng Hiền</span>
                </div>
            </div>
        </div>
    );
}
