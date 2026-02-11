import { useState, useEffect, useCallback } from "react";
import {
    Calendar, ChevronLeft, ChevronRight,
    CheckCircle, AlertTriangle, RefreshCw, Users,
    Check, X, Plus, Clock
} from "lucide-react";
import { useUsers } from "../../../hooks/useUsers";

type ShiftType = "morning" | "afternoon" | "evening";
type TabType = "requests" | "assigned";

interface ScheduleRequest {
    id: string;
    user_id: string;
    date: string;
    shift_type: ShiftType;
    status: "pending" | "approved" | "rejected";
}

interface ScheduleEntry {
    id: string;
    user_id: string;
    date: string;
    shift_type: ShiftType;
    start_time: string;
    end_time: string;
    status: string;
}

const SHIFTS: { key: ShiftType; label: string; time: string; color: string; bg: string; border: string }[] = [
    { key: "morning", label: "Ca 1", time: "7h-12h", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300" },
    { key: "afternoon", label: "Ca 2", time: "12h-18h", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300" },
    { key: "evening", label: "Ca 3", time: "18h-23h", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-300" },
];

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function HomeSchedule() {
    const { users } = useUsers();
    const staffUsers = users.filter((u: any) => u.roleKey === "staff");

    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState<ScheduleRequest[]>([]);
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("requests");
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [processing, setProcessing] = useState<Set<string>>(new Set());
    const [assignModal, setAssignModal] = useState<{ date: string; shift: ShiftType } | null>(null);
    const [hoveredCell, setHoveredCell] = useState<{ date: string; shift: ShiftType } | null>(null);

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

    const showNotification = (type: string, message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const approveRequest = async (id: string) => {
        setProcessing(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedule-requests/${id}/approve`, { method: "POST" });
            const json = await res.json();
            if (json.success) { showNotification("success", "Đã duyệt ca làm"); fetchData(); }
            else showNotification("error", json.message);
        } catch { showNotification("error", "Lỗi kết nối"); }
        finally { setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; }); }
    };

    const rejectRequest = async (id: string) => {
        setProcessing(prev => new Set(prev).add(id));
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedule-requests/${id}/reject`, { method: "POST" });
            const json = await res.json();
            if (json.success) { showNotification("success", "Đã từ chối ca làm"); fetchData(); }
            else showNotification("error", json.message);
        } catch { showNotification("error", "Lỗi kết nối"); }
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
            if (json.success) { showNotification("success", `Đã duyệt ${pendingIds.length} ca làm`); fetchData(); }
        } catch { showNotification("error", "Lỗi kết nối"); }
        finally { setLoading(false); }
    };

    const assignShift = async (userId: string) => {
        if (!assignModal) return;
        try {
            const res = await fetch("http://localhost:3001/api/admin/schedules/assign", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, date: assignModal.date, shift_type: assignModal.shift }),
            });
            const json = await res.json();
            if (json.success) { showNotification("success", "Đã xếp ca thành công"); setAssignModal(null); fetchData(); }
            else showNotification("error", json.message);
        } catch { showNotification("error", "Lỗi kết nối"); }
    };

    const removeScheduleEntry = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/schedules/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) { showNotification("success", "Đã xóa ca làm"); fetchData(); }
        } catch { showNotification("error", "Lỗi kết nối"); }
    };

    const pendingRequests = requests.filter(r => r.status === "pending");
    const weekLabel = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1} - ${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;

    const getShiftCount = (date: string, shift: ShiftType) => schedules.filter(s => s.date === date && s.shift_type === shift).length;
    const getPendingCount = (date: string, shift: ShiftType) => requests.filter(r => r.date === date && r.shift_type === shift && r.status === "pending").length;
    const getPendingUsers = (date: string, shift: ShiftType) => requests.filter(r => r.date === date && r.shift_type === shift && r.status === "pending").map(r => getUserName(r.user_id));
    const getAssignedUsers = (date: string, shift: ShiftType) => schedules.filter(s => s.date === date && s.shift_type === shift).map(s => getUserName(s.user_id));

    return (
        <div className="space-y-5">
            {notification && (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                    {notification.type === "success" ? <CheckCircle size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-red-500" />}
                    <span className={notification.type === "error" ? "text-red-700" : "text-green-700"}>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📅 Phân lịch làm việc</h1>
                    <p className="text-slate-500 mt-1">Duyệt đăng ký và xếp ca cho nhân viên</p>
                </div>
                {pendingRequests.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <Clock size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">{pendingRequests.length} đăng ký chờ duyệt</span>
                    </div>
                )}
            </div>

            {/* Tabs + Week Nav */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
                    <button onClick={() => setActiveTab("requests")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "requests" ? "bg-[#009099] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Users size={16} /> Đăng ký ca
                        {pendingRequests.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === "requests" ? "bg-white/20" : "bg-yellow-100 text-yellow-700"}`}>{pendingRequests.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab("assigned")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "assigned" ? "bg-[#009099] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Calendar size={16} /> Lịch đã xếp
                    </button>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => navigateWeek(-1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronLeft size={18} /></button>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg min-w-[180px] text-center">
                        <span className="font-semibold text-slate-800">{weekLabel}</span>
                    </div>
                    <button onClick={() => navigateWeek(1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ChevronRight size={18} /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-xs text-[#009099] bg-[#009099]/10 rounded-lg hover:bg-[#009099]/20 font-medium">Hôm nay</button>
                </div>
            </div>

            {/* Overview Grid - Full Width */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700">Tổng quan tuần</h3>
                    <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Đã xếp</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400"></span> Chờ duyệt</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-24">Ca</th>
                                {weekDays.map((day, idx) => (
                                    <th key={idx} className={`px-3 py-3 text-center ${isToday(day) ? "bg-[#009099]/10" : ""}`}>
                                        <p className={`text-xs font-medium ${isToday(day) ? "text-[#009099]" : "text-slate-500"}`}>{DAY_NAMES[idx]}</p>
                                        <p className={`text-lg font-bold ${isToday(day) ? "text-[#009099]" : "text-slate-800"}`}>{day.getDate()}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SHIFTS.map(shift => (
                                <tr key={shift.key} className="border-t border-slate-100">
                                    <td className="px-4 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${shift.bg}`}>
                                            <span className={`font-semibold text-sm ${shift.color}`}>{shift.label}</span>
                                            <span className="text-xs text-slate-500">({shift.time})</span>
                                        </div>
                                    </td>
                                    {weekDays.map((day, idx) => {
                                        const dateStr = day.toISOString().split("T")[0];
                                        const count = getShiftCount(dateStr, shift.key);
                                        const pending = getPendingCount(dateStr, shift.key);
                                        const isHovered = hoveredCell?.date === dateStr && hoveredCell?.shift === shift.key;
                                        const assignedNames = getAssignedUsers(dateStr, shift.key);
                                        const pendingNames = getPendingUsers(dateStr, shift.key);
                                        return (
                                            <td key={idx} className={`px-3 py-4 text-center relative ${isToday(day) ? "bg-[#009099]/5" : ""}`}
                                                onMouseEnter={() => setHoveredCell({ date: dateStr, shift: shift.key })}
                                                onMouseLeave={() => setHoveredCell(null)}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {count > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                                                            {count} <Users size={14} />
                                                        </span>
                                                    )}
                                                    {pending > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                                                            +{pending} ⏳
                                                        </span>
                                                    )}
                                                    {count === 0 && pending === 0 && <span className="text-slate-300">—</span>}
                                                </div>
                                                {/* Tooltip */}
                                                {isHovered && (assignedNames.length > 0 || pendingNames.length > 0) && (
                                                    <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg min-w-[150px]">
                                                        {assignedNames.length > 0 && (
                                                            <div className="mb-1">
                                                                <p className="text-green-400 font-medium mb-0.5">Đã xếp:</p>
                                                                {assignedNames.map((n, i) => <p key={i}>• {n}</p>)}
                                                            </div>
                                                        )}
                                                        {pendingNames.length > 0 && (
                                                            <div>
                                                                <p className="text-yellow-400 font-medium mb-0.5">Chờ duyệt:</p>
                                                                {pendingNames.map((n, i) => <p key={i}>• {n}</p>)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#009099]"></div>
                </div>
            ) : activeTab === "requests" ? (
                <div className="space-y-4">
                    {pendingRequests.length > 0 && (
                        <div className="flex justify-end">
                            <button onClick={approveAll} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600">
                                <Check size={18} /> Duyệt tất cả ({pendingRequests.length})
                            </button>
                        </div>
                    )}
                    {staffUsers.filter((u: any) => requests.some(r => r.user_id === u.uid)).map((user: any) => {
                        const userRequests = requests.filter(r => r.user_id === user.uid);
                        const userPending = userRequests.filter(r => r.status === "pending");
                        return (
                            <div key={user.uid} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
                                    <div className="w-10 h-10 rounded-xl bg-[#009099]/10 flex items-center justify-center font-bold text-[#009099]">
                                        {getUserInitial(user.uid)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-slate-500">{userPending.length} ca chờ duyệt</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 w-20">Ca</th>
                                                {weekDays.map((day, idx) => (
                                                    <th key={idx} className={`px-2 py-2 text-center ${isToday(day) ? "bg-[#009099]/5" : ""}`}>
                                                        <p className="text-[10px] text-slate-500">{DAY_NAMES[idx]}</p>
                                                        <p className="text-sm font-bold text-slate-700">{day.getDate()}</p>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SHIFTS.map(shift => (
                                                <tr key={shift.key} className="border-t border-slate-100">
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-semibold ${shift.color}`}>{shift.label}</span>
                                                    </td>
                                                    {weekDays.map((day, idx) => {
                                                        const dateStr = day.toISOString().split("T")[0];
                                                        const req = userRequests.find(r => r.date === dateStr && r.shift_type === shift.key);
                                                        const isProc = req ? processing.has(req.id) : false;
                                                        return (
                                                            <td key={idx} className={`px-2 py-3 text-center ${isToday(day) ? "bg-[#009099]/5" : ""}`}>
                                                                {req ? (
                                                                    req.status === "pending" ? (
                                                                        isProc ? <RefreshCw size={16} className="animate-spin text-slate-400 mx-auto" /> : (
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                <button onClick={() => approveRequest(req.id)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"><Check size={14} /></button>
                                                                                <button onClick={() => rejectRequest(req.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200"><X size={14} /></button>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <span className={`text-sm font-bold ${req.status === "approved" ? "text-green-500" : "text-red-400"}`}>
                                                                            {req.status === "approved" ? "✓" : "✗"}
                                                                        </span>
                                                                    )
                                                                ) : <span className="text-slate-200">—</span>}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                    {requests.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
                            <Calendar size={56} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 text-lg">Chưa có đăng ký ca nào trong tuần này</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 w-48">Nhân viên</th>
                                    {weekDays.map((day, idx) => (
                                        <th key={idx} className={`px-3 py-4 text-center ${isToday(day) ? "bg-[#009099]/10" : ""}`}>
                                            <p className={`text-xs font-medium ${isToday(day) ? "text-[#009099]" : "text-slate-500"}`}>{DAY_NAMES[idx]}</p>
                                            <p className={`text-lg font-bold ${isToday(day) ? "text-[#009099]" : "text-slate-800"}`}>{day.getDate()}/{day.getMonth() + 1}</p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {staffUsers.map((user: any) => (
                                    <tr key={user.uid} className="border-t border-slate-100">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-[#009099]/10 flex items-center justify-center font-bold text-[#009099] text-sm">
                                                    {getUserInitial(user.uid)}
                                                </div>
                                                <span className="font-medium text-slate-800">{user.first_name} {user.last_name}</span>
                                            </div>
                                        </td>
                                        {weekDays.map((day, idx) => {
                                            const dateStr = day.toISOString().split("T")[0];
                                            const dayScheds = schedules.filter(s => s.user_id === user.uid && s.date === dateStr);
                                            return (
                                                <td key={idx} className={`px-2 py-3 ${isToday(day) ? "bg-[#009099]/5" : ""}`}>
                                                    <div className="flex flex-col gap-1.5 items-center">
                                                        {dayScheds.map(s => {
                                                            const sh = SHIFTS.find(x => x.key === s.shift_type);
                                                            if (!sh) return null;
                                                            return (
                                                                <div key={s.id} className={`${sh.bg} ${sh.border} border rounded-lg px-2 py-1 text-center relative group min-w-[60px]`}>
                                                                    <span className={`text-xs font-bold ${sh.color}`}>{sh.label}</span>
                                                                    <button onClick={() => removeScheduleEntry(s.id)}
                                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow">
                                                                        <X size={10} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                        {dayScheds.length < 3 && (
                                                            <button onClick={() => {
                                                                const avail = SHIFTS.filter(s => !dayScheds.some(ds => ds.shift_type === s.key));
                                                                if (avail.length > 0) setAssignModal({ date: dateStr, shift: avail[0].key });
                                                            }} className="w-[60px] py-1 rounded-lg border-2 border-dashed border-slate-200 text-slate-300 hover:text-[#009099] hover:border-[#009099] transition-colors">
                                                                <Plus size={14} className="mx-auto" />
                                                            </button>
                                                        )}
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
            )}

            {/* Assign Modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800 text-lg">Xếp ca làm</h3>
                            <p className="text-sm text-slate-500">{new Date(assignModal.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}</p>
                        </div>
                        <div className="p-5">
                            <div className="flex gap-2 mb-5">
                                {SHIFTS.map(s => (
                                    <button key={s.key} onClick={() => setAssignModal({ ...assignModal, shift: s.key })}
                                        className={`flex-1 p-3 rounded-xl text-center transition-all ${assignModal.shift === s.key ? `${s.bg} border-2 ${s.border}` : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"}`}>
                                        <p className={`font-bold ${s.color}`}>{s.label}</p>
                                        <p className="text-xs text-slate-500">{s.time}</p>
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-3">Chọn nhân viên:</p>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                {staffUsers.map((user: any) => {
                                    const exists = schedules.some(s => s.user_id === user.uid && s.date === assignModal.date && s.shift_type === assignModal.shift);
                                    return (
                                        <button key={user.uid} onClick={() => !exists && assignShift(user.uid)} disabled={exists}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${exists ? "bg-slate-50 opacity-50 cursor-not-allowed border-slate-200" : "hover:bg-[#009099]/5 hover:border-[#009099] border-slate-200"}`}>
                                            <div className="w-9 h-9 rounded-lg bg-[#009099]/10 flex items-center justify-center font-bold text-[#009099]">{getUserInitial(user.uid)}</div>
                                            <span className="font-medium text-slate-700">{user.first_name} {user.last_name}</span>
                                            {exists && <span className="ml-auto text-xs text-green-500 font-medium">Đã xếp</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                            <button onClick={() => setAssignModal(null)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
