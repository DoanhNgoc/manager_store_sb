import { useState, useEffect, useCallback } from "react";
import {
    Calendar, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, 
    Users, Check, X, Plus, Clock, Send, Bell, Eye, UserCheck
} from "lucide-react";
import { useUsers } from "../../../hooks/useUsers";

interface ScheduleRequest {
    id: string;
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: "pending" | "approved" | "rejected";
}

interface ScheduleEntry {
    id: string;
    user_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
}

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_FULL = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, "0")}:00`;
});

const formatTime = (time: string) => `${parseInt(time.split(":")[0])}h`;
const calcHours = (start: string, end: string) => parseInt(end.split(":")[0]) - parseInt(start.split(":")[0]);

const getSlotColor = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700" };
    if (hour < 18) return { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700" };
    return { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-700" };
};

export default function HomeSchedule() {
    const { users } = useUsers();
    const staffUsers = users.filter((u: any) => u.roleKey === "staff");

    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState<ScheduleRequest[]>([]);
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [processing, setProcessing] = useState<Set<string>>(new Set());
    
    // Modal states
    const [assignModal, setAssignModal] = useState<{ date: string; userId: string } | null>(null);
    const [newSlot, setNewSlot] = useState({ start_time: "07:00", end_time: "13:00" });
    const [sendingNotification, setSendingNotification] = useState(false);
    const [showConfirmSend, setShowConfirmSend] = useState(false);

    // Kiểm tra ngày trong tuần (chỉ để tham khảo, không ảnh hưởng hiển thị nút)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = CN, 5 = T6, 6 = T7

    const getWeekDays = useCallback(() => {
        const days: Date[] = [];
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    const weekDays = getWeekDays();
    const startDate = weekDays[0].toISOString().split("T")[0];
    const endDate = weekDays[6].toISOString().split("T")[0];
    const weekLabel = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1} - ${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [reqRes, schedRes] = await Promise.all([
                fetch(`http://localhost:3001/api/admin/schedule-requests?startDate=${startDate}&endDate=${endDate}`),
                fetch(`http://localhost:3001/api/admin/schedules?startDate=${startDate}&endDate=${endDate}`),
            ]);
            const reqJson = await reqRes.json();
            const schedJson = await schedRes.json();
            if (reqJson.success) setRequests(reqJson.data || []);
            if (schedJson.success) setSchedules(schedJson.data || []);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const navigateWeek = (dir: number) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

    const getUserName = (userId: string) => {
        const user = staffUsers.find((u: any) => u.uid === userId);
        return user ? `${user.first_name} ${user.last_name}` : userId.slice(0, 8);
    };

    const getUserInitial = (userId: string) => {
        const user = staffUsers.find((u: any) => u.uid === userId);
        if (user) return user.last_name?.trim().split(" ").pop()?.charAt(0).toUpperCase() || "?";
        return "?";
    };

    const showNotif = (type: string, message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // Actions
    const approveRequest = async (id: string) => {
        setProcessing(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedule-requests/${id}/approve`, { method: "POST" });
            const json = await res.json();
            if (json.success) { showNotif("success", "Đã duyệt ca làm"); fetchData(); }
            else showNotif("error", json.message);
        } catch { showNotif("error", "Lỗi kết nối"); }
        finally { setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; }); }
    };

    const rejectRequest = async (id: string) => {
        setProcessing(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedule-requests/${id}/reject`, { method: "POST" });
            const json = await res.json();
            if (json.success) { showNotif("success", "Đã từ chối ca làm"); fetchData(); }
            else showNotif("error", json.message);
        } catch { showNotif("error", "Lỗi kết nối"); }
        finally { setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; }); }
    };

    const approveAll = async () => {
        const pendingIds = requests.filter(r => r.status === "pending").map(r => r.id);
        if (pendingIds.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/admin/schedule-requests/approve-bulk", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestIds: pendingIds }),
            });
            const json = await res.json();
            if (json.success) { showNotif("success", `Đã duyệt ${pendingIds.length} ca làm`); fetchData(); }
        } catch { showNotif("error", "Lỗi kết nối"); }
        finally { setLoading(false); }
    };

    const assignShift = async () => {
        if (!assignModal) return;
        try {
            const res = await fetch("http://localhost:3001/api/admin/schedules/assign", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_id: assignModal.userId, 
                    date: assignModal.date, 
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time
                }),
            });
            const json = await res.json();
            if (json.success) { 
                showNotif("success", "Đã xếp ca thành công"); 
                setAssignModal(null); 
                setNewSlot({ start_time: "07:00", end_time: "13:00" });
                fetchData(); 
            }
            else showNotif("error", json.message);
        } catch { showNotif("error", "Lỗi kết nối"); }
    };

    const removeScheduleEntry = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedules/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) { showNotif("success", "Đã xóa ca làm"); fetchData(); }
        } catch { showNotif("error", "Lỗi kết nối"); }
    };

    // Gửi thông báo lịch làm cho tất cả nhân viên (in-app)
    const sendScheduleNotification = async () => {
        setSendingNotification(true);
        try {
            const res = await fetch("http://localhost:3001/api/admin/notifications/schedule-published", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weekStart: startDate, weekEnd: endDate, createdBy: "manager" }),
            });
            const json = await res.json();
            if (json.success) { 
                showNotif("success", "Đã gửi thông báo lịch làm cho tất cả nhân viên"); 
                setShowConfirmSend(false);
            }
            else showNotif("error", json.message);
        } catch { showNotif("error", "Lỗi kết nối"); }
        finally { setSendingNotification(false); }
    };

    // Gửi nhắc nhở đăng ký ca (in-app)
    const sendRegistrationReminder = async () => {
        setSendingNotification(true);
        try {
            const res = await fetch("http://localhost:3001/api/admin/notifications/schedule-reminder", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weekStart: startDate, weekEnd: endDate, createdBy: "manager" }),
            });
            const json = await res.json();
            if (json.success) { 
                showNotif("success", "Đã gửi nhắc nhở đăng ký ca cho tất cả nhân viên"); 
            }
            else showNotif("error", json.message);
        } catch { showNotif("error", "Lỗi kết nối"); }
        finally { setSendingNotification(false); }
    };

    const pendingRequests = requests.filter(r => r.status === "pending");
    const totalScheduledHours = schedules.reduce((sum, s) => sum + calcHours(s.start_time, s.end_time), 0);

    // Group data
    const getSchedulesForDate = (dateStr: string) => schedules.filter(s => s.date === dateStr);
    const getRequestsForDate = (dateStr: string) => requests.filter(r => r.date === dateStr);
    const getPendingForDate = (dateStr: string) => requests.filter(r => r.date === dateStr && r.status === "pending");

    return (
        <div className="space-y-5">
            {/* Notification */}
            {notification && (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                    {notification.type === "success" ? <CheckCircle size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-red-500" />}
                    <span className={notification.type === "error" ? "text-red-700" : "text-green-700"}>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📅 Quản lý lịch làm việc</h1>
                    <p className="text-slate-500 mt-1">Xem đăng ký, xếp ca và gửi thông báo cho nhân viên</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {pendingRequests.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <Clock size={16} className="text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-700">{pendingRequests.length} chờ duyệt</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#009099]/10 rounded-xl">
                        <Users size={16} className="text-[#009099]" />
                        <span className="text-sm font-medium text-[#009099]">{schedules.length} ca • {totalScheduledHours}h</span>
                    </div>
                </div>
            </div>

            {/* Week Navigation + Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Week Nav */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigateWeek(-1)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-4 py-2 bg-slate-50 rounded-lg min-w-[180px] text-center">
                            <span className="font-semibold text-slate-800">{weekLabel}</span>
                        </div>
                        <button onClick={() => navigateWeek(1)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-xs text-[#009099] bg-[#009099]/10 rounded-lg hover:bg-[#009099]/20 font-medium">
                            Hôm nay
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {pendingRequests.length > 0 && (
                            <button onClick={approveAll} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600">
                                <Check size={16} /> Duyệt tất cả ({pendingRequests.length})
                            </button>
                        )}
                        <button 
                            onClick={sendRegistrationReminder} 
                            disabled={sendingNotification}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                        >
                            <Bell size={16} /> Nhắc đăng ký ca
                        </button>
                        {schedules.length > 0 && (
                            <button 
                                onClick={() => setShowConfirmSend(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#009099] text-white rounded-xl text-sm font-medium hover:bg-[#007a82]"
                            >
                                <Send size={16} /> Gửi lịch làm
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#009099]"></div>
                </div>
            ) : (
                <>
                    {/* ===== MAIN SCHEDULE GRID ===== */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-[#009099]/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#009099]/10 rounded-xl flex items-center justify-center">
                                        <Calendar size={20} className="text-[#009099]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Lịch làm việc tuần này</h2>
                                        <p className="text-sm text-slate-500">{staffUsers.length} nhân viên • {weekLabel}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Đã xếp</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400"></span> Chờ duyệt</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-44 sticky left-0 bg-slate-50 z-10">Nhân viên</th>
                                        {weekDays.map((day, idx) => {
                                            const dateStr = day.toISOString().split("T")[0];
                                            const dayScheds = getSchedulesForDate(dateStr);
                                            const dayPending = getPendingForDate(dateStr);
                                            const today = isToday(day);
                                            return (
                                                <th key={idx} className={`px-2 py-3 text-center min-w-[120px] ${today ? "bg-[#009099]/10" : ""}`}>
                                                    <p className={`text-xs font-medium ${today ? "text-[#009099]" : "text-slate-500"}`}>{DAY_FULL[idx]}</p>
                                                    <p className={`text-lg font-bold ${today ? "text-[#009099]" : "text-slate-800"}`}>{day.getDate()}</p>
                                                    <div className="flex justify-center gap-1 mt-1">
                                                        {dayScheds.length > 0 && (
                                                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">{dayScheds.length}</span>
                                                        )}
                                                        {dayPending.length > 0 && (
                                                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">+{dayPending.length}</span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffUsers.map((user: any) => (
                                        <tr key={user.uid} className="border-t border-slate-100 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 sticky left-0 bg-white z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#009099]/10 flex items-center justify-center font-bold text-[#009099] text-sm">
                                                        {getUserInitial(user.uid)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm">{user.first_name} {user.last_name}</p>
                                                        <p className="text-xs text-slate-400">{user.phone || "Nhân viên"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {weekDays.map((day, idx) => {
                                                const dateStr = day.toISOString().split("T")[0];
                                                const userScheds = schedules.filter(s => s.user_id === user.uid && s.date === dateStr);
                                                const userReqs = requests.filter(r => r.user_id === user.uid && r.date === dateStr);
                                                const today = isToday(day);
                                                
                                                return (
                                                    <td key={idx} className={`px-2 py-2 ${today ? "bg-[#009099]/5" : ""}`}>
                                                        <div className="space-y-1">
                                                            {/* Scheduled shifts */}
                                                            {userScheds.map(s => {
                                                                const color = getSlotColor(s.start_time);
                                                                return (
                                                                    <div key={s.id} className={`${color.bg} ${color.border} border rounded-lg px-2 py-1.5 relative group`}>
                                                                        <p className={`text-xs font-bold ${color.text} text-center`}>
                                                                            {formatTime(s.start_time)}-{formatTime(s.end_time)}
                                                                        </p>
                                                                        <button 
                                                                            onClick={() => removeScheduleEntry(s.id)}
                                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex text-[10px]"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                            
                                                            {/* Pending requests */}
                                                            {userReqs.filter(r => r.status === "pending").map(r => {
                                                                const color = getSlotColor(r.start_time);
                                                                const isProc = processing.has(r.id);
                                                                return (
                                                                    <div key={r.id} className={`${color.bg} border-2 border-dashed ${color.border} rounded-lg px-2 py-1`}>
                                                                        <p className={`text-[10px] font-semibold ${color.text} text-center`}>
                                                                            {formatTime(r.start_time)}-{formatTime(r.end_time)}
                                                                        </p>
                                                                        {isProc ? (
                                                                            <div className="flex justify-center py-1">
                                                                                <div className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent"></div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex gap-1 mt-1">
                                                                                <button onClick={() => approveRequest(r.id)} className="flex-1 py-0.5 bg-green-500 text-white rounded text-[9px] font-medium hover:bg-green-600">✓</button>
                                                                                <button onClick={() => rejectRequest(r.id)} className="flex-1 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-medium hover:bg-red-200">✕</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Add button */}
                                                            <button 
                                                                onClick={() => setAssignModal({ date: dateStr, userId: user.uid })}
                                                                className="w-full py-1 rounded-lg border-2 border-dashed border-slate-200 text-slate-300 hover:text-[#009099] hover:border-[#009099] transition-colors"
                                                            >
                                                                <Plus size={14} className="mx-auto" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {staffUsers.length === 0 && (
                            <div className="p-16 text-center">
                                <Users size={56} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 text-lg">Chưa có nhân viên nào</p>
                            </div>
                        )}
                    </div>

                    {/* ===== PENDING REQUESTS SUMMARY ===== */}
                    {pendingRequests.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 bg-yellow-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                        <Clock size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Đăng ký chờ duyệt</h2>
                                        <p className="text-sm text-slate-500">{pendingRequests.length} ca đang chờ xác nhận</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {pendingRequests.map(req => {
                                        const color = getSlotColor(req.start_time);
                                        const isProc = processing.has(req.id);
                                        const dayIdx = weekDays.findIndex(d => d.toISOString().split("T")[0] === req.date);
                                        return (
                                            <div key={req.id} className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold text-[#009099] text-sm">
                                                        {getUserInitial(req.user_id)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-800 text-sm truncate">{getUserName(req.user_id)}</p>
                                                        <p className="text-xs text-slate-500">{dayIdx >= 0 ? DAY_FULL[dayIdx] : ""}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-bold ${color.text}`}>
                                                        {formatTime(req.start_time)} - {formatTime(req.end_time)}
                                                    </span>
                                                    {isProc ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => approveRequest(req.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={() => rejectRequest(req.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== SCHEDULE SUMMARY BY DAY ===== */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                    <UserCheck size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-800">Tổng hợp lịch đã xếp</h2>
                                    <p className="text-sm text-slate-500">Chi tiết nhân viên làm việc theo ngày</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                                {weekDays.map((day, idx) => {
                                    const dateStr = day.toISOString().split("T")[0];
                                    const dayScheds = getSchedulesForDate(dateStr);
                                    const today = isToday(day);
                                    const totalHours = dayScheds.reduce((sum, s) => sum + calcHours(s.start_time, s.end_time), 0);

                                    return (
                                        <div key={idx} className={`rounded-xl border-2 p-3 ${today ? "border-[#009099] bg-[#009099]/5" : "border-slate-200"}`}>
                                            <div className="text-center mb-3">
                                                <p className={`text-xs font-medium ${today ? "text-[#009099]" : "text-slate-500"}`}>{DAY_NAMES[idx]}</p>
                                                <p className={`text-xl font-bold ${today ? "text-[#009099]" : "text-slate-800"}`}>{day.getDate()}</p>
                                                {dayScheds.length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1">{dayScheds.length} ca • {totalHours}h</p>
                                                )}
                                            </div>
                                            {dayScheds.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {dayScheds.map(s => {
                                                        const color = getSlotColor(s.start_time);
                                                        return (
                                                            <div key={s.id} className={`${color.bg} rounded-lg p-2 border ${color.border}`}>
                                                                <p className="text-xs font-medium text-slate-800 truncate">{getUserName(s.user_id)}</p>
                                                                <p className={`text-[10px] font-bold ${color.text}`}>
                                                                    {formatTime(s.start_time)}-{formatTime(s.end_time)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-center text-slate-300 text-xs py-4">Chưa có ca</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== ASSIGN MODAL ===== */}
            {assignModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 text-lg">Xếp ca làm</h3>
                            <p className="text-sm text-slate-500">
                                {getUserName(assignModal.userId)} - {new Date(assignModal.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                            </p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Giờ bắt đầu</label>
                                    <select
                                        value={newSlot.start_time}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099]"
                                    >
                                        {TIME_OPTIONS.slice(0, -4).map(t => (
                                            <option key={t} value={t}>{formatTime(t)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Giờ kết thúc</label>
                                    <select
                                        value={newSlot.end_time}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099]"
                                    >
                                        {TIME_OPTIONS.filter(t => t > newSlot.start_time).map(t => (
                                            <option key={t} value={t}>{formatTime(t)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-sm text-slate-600">
                                    Ca làm: <span className="font-semibold text-slate-800">{formatTime(newSlot.start_time)} - {formatTime(newSlot.end_time)}</span>
                                    <span className="ml-2 text-[#009099] font-semibold">({calcHours(newSlot.start_time, newSlot.end_time)}h)</span>
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button onClick={() => { setAssignModal(null); setNewSlot({ start_time: "07:00", end_time: "13:00" }); }} 
                                className="flex-1 px-5 py-2.5 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200">
                                Hủy
                            </button>
                            <button onClick={assignShift}
                                className="flex-1 px-5 py-2.5 bg-[#009099] text-white rounded-xl font-medium hover:bg-[#007a82] flex items-center justify-center gap-2">
                                <CheckCircle size={18} /> Xếp ca
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CONFIRM SEND MODAL ===== */}
            {showConfirmSend && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 text-lg">Gửi lịch làm việc</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#009099]/10 rounded-xl flex items-center justify-center">
                                    <Send size={24} className="text-[#009099]" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Xác nhận gửi thông báo?</p>
                                    <p className="text-sm text-slate-500">Lịch làm tuần {weekLabel}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">Tổng số ca:</span> {schedules.length} ca
                                </p>
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">Nhân viên:</span> {new Set(schedules.map(s => s.user_id)).size} người
                                </p>
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">Tổng giờ:</span> {totalScheduledHours}h
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">
                                Email thông báo sẽ được gửi đến tất cả nhân viên có ca trong tuần này.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
                            <button onClick={() => setShowConfirmSend(false)} 
                                className="flex-1 px-5 py-2.5 text-slate-600 bg-slate-100 rounded-xl font-medium hover:bg-slate-200">
                                Hủy
                            </button>
                            <button 
                                onClick={sendScheduleNotification}
                                disabled={sendingNotification}
                                className="flex-1 px-5 py-2.5 bg-[#009099] text-white rounded-xl font-medium hover:bg-[#007a82] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sendingNotification ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <Send size={18} /> Gửi ngay
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
