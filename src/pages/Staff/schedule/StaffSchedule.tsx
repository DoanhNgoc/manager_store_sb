import { useState, useEffect, useCallback } from "react";
import {
    Calendar, ChevronLeft, ChevronRight,
    Send, CheckCircle, RefreshCw, Info
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Notification/Toast";

type ShiftType = "morning" | "afternoon" | "evening";
type ViewTab = "schedule" | "register";

interface Schedule {
    id: string;
    date: string;
    shift_type: ShiftType;
    start_time: string;
    end_time: string;
    status: "scheduled" | "completed" | "absent";
}

interface ScheduleRequest {
    id: string;
    date: string;
    shift_type: ShiftType;
    status: "pending" | "approved" | "rejected";
}

const SHIFTS: { key: ShiftType; label: string; time: string; color: string; bg: string; border: string }[] = [
    { key: "morning", label: "Ca 1", time: "7h - 12h", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300" },
    { key: "afternoon", label: "Ca 2", time: "12h - 18h", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300" },
    { key: "evening", label: "Ca 3", time: "18h - 23h", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-300" },
];

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_FULL = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function StaffSchedule() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [requests, setRequests] = useState<ScheduleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<ViewTab>("schedule");

    // selections[dayIndex] = Set of shift keys
    const [selections, setSelections] = useState<Map<number, Set<ShiftType>>>(new Map());

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
    const startDateStr = weekDays[0].toISOString().split("T")[0];
    const endDateStr = weekDays[6].toISOString().split("T")[0];

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [schedRes, reqRes] = await Promise.all([
                fetch(`http://localhost:3001/api/schedules/${userId}/week?startDate=${startDateStr}&endDate=${endDateStr}`),
                fetch(`http://localhost:3001/api/schedule-requests/${userId}?startDate=${startDateStr}&endDate=${endDateStr}`),
            ]);
            const schedJson = await schedRes.json();
            const reqJson = await reqRes.json();
            if (schedJson.success) setSchedules(schedJson.data || []);
            if (reqJson.success) {
                setRequests(reqJson.data || []);
                // Populate selections from existing pending requests
                const map = new Map<number, Set<ShiftType>>();
                for (const r of (reqJson.data || []) as ScheduleRequest[]) {
                    const dayIdx = weekDays.findIndex(d => d.toISOString().split("T")[0] === r.date);
                    if (dayIdx >= 0) {
                        if (!map.has(dayIdx)) map.set(dayIdx, new Set());
                        map.get(dayIdx)!.add(r.shift_type);
                    }
                }
                setSelections(map);
            }
        } catch (err) {
            console.error("Error fetching schedule data:", err);
        } finally {
            setLoading(false);
        }
    }, [userId, startDateStr, endDateStr]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const navigateWeek = (dir: number) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    const toggleShift = (dayIdx: number, shift: ShiftType) => {
        if (isPast(weekDays[dayIdx])) return;
        setSelections(prev => {
            const next = new Map(prev);
            const set = new Set(next.get(dayIdx) || []);
            if (set.has(shift)) set.delete(shift);
            else set.add(shift);
            if (set.size === 0) next.delete(dayIdx);
            else next.set(dayIdx, set);
            return next;
        });
    };

    const totalSelected = Array.from(selections.values()).reduce((sum, s) => sum + s.size, 0);

    const submitRequest = async () => {
        if (!userId || totalSelected === 0) return;
        setSubmitting(true);
        try {
            const weekData = Array.from(selections.entries()).map(([dayIdx, shifts]) => ({
                date: weekDays[dayIdx].toISOString().split("T")[0],
                shifts: Array.from(shifts),
            }));
            const res = await fetch("http://localhost:3001/api/schedule-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, weekData }),
            });
            const json = await res.json();
            if (json.success) {
                showToast("success", "Đã gửi đăng ký lịch làm thành công!");
                fetchData();
            } else {
                showToast("error", json.message || "Không thể gửi đăng ký");
            }
        } catch {
            showToast("error", "Lỗi kết nối server");
        } finally {
            setSubmitting(false);
        }
    };

    const getScheduleForDate = (date: Date) => {
        const ds = date.toISOString().split("T")[0];
        return schedules.filter(s => s.date === ds);
    };

    const getRequestsForDate = (date: Date) => {
        const ds = date.toISOString().split("T")[0];
        return requests.filter(r => r.date === ds);
    };

    const weekLabel = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1} - ${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;
    const totalScheduled = schedules.length;
    const totalHours = schedules.reduce((acc, s) => {
        const [sh, sm] = s.start_time.split(":").map(Number);
        const [eh, em] = s.end_time.split(":").map(Number);
        return acc + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📅 Lịch làm việc</h1>
                    <p className="text-slate-500 mt-1">Xem lịch và đăng ký ca làm</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#009099]/10 rounded-lg">
                        <Calendar size={16} className="text-[#009099]" />
                        <span className="text-sm font-medium text-[#009099]">{totalScheduled} ca • {totalHours.toFixed(0)}h tuần này</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex gap-1">
                <button onClick={() => setActiveTab("schedule")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "schedule" ? "bg-[#009099] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                    <Calendar size={16} /> Lịch làm việc
                </button>
                <button onClick={() => setActiveTab("register")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "register" ? "bg-[#009099] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                    <Send size={16} /> Đăng ký ca làm
                </button>
            </div>

            {/* Week Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-semibold text-slate-800">{weekLabel}</h3>
                        <button onClick={() => setCurrentDate(new Date())} className="text-xs text-[#009099] hover:underline mt-0.5">Về tuần hiện tại</button>
                    </div>
                    <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#009099] mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm">Đang tải...</p>
                    </div>
                </div>
            ) : activeTab === "schedule" ? (
                /* ===== SCHEDULE VIEW ===== */
                <div className="space-y-4">
                    {/* Week grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day, idx) => {
                            const daySchedules = getScheduleForDate(day);
                            const dayRequests = getRequestsForDate(day);
                            const today = isToday(day);
                            return (
                                <div key={idx} className={`bg-white rounded-2xl shadow-sm border-2 p-3 min-h-[160px] transition-all ${today ? "border-[#009099] bg-[#009099]/5" : "border-slate-100"}`}>
                                    <div className={`text-center mb-3 ${today ? "text-[#009099]" : "text-slate-600"}`}>
                                        <p className="text-xs font-medium uppercase">{DAY_NAMES[idx]}</p>
                                        <p className={`text-lg font-bold ${today ? "bg-[#009099] text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto" : ""}`}>{day.getDate()}</p>
                                    </div>
                                    {daySchedules.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {daySchedules.map(s => {
                                                const shift = SHIFTS.find(sh => sh.key === s.shift_type);
                                                if (!shift) return null;
                                                return (
                                                    <div key={s.id} className={`${shift.bg} rounded-lg p-1.5 text-center border ${shift.border}`}>
                                                        <p className={`text-xs font-bold ${shift.color}`}>{shift.label}</p>
                                                        <p className="text-[9px] text-slate-500">{s.start_time}-{s.end_time}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : dayRequests.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {dayRequests.map(r => {
                                                const shift = SHIFTS.find(sh => sh.key === r.shift_type);
                                                if (!shift) return null;
                                                const statusColor = r.status === "approved" ? "text-green-500" : r.status === "rejected" ? "text-red-500" : "text-yellow-500";
                                                const statusLabel = r.status === "approved" ? "✓" : r.status === "rejected" ? "✗" : "⏳";
                                                return (
                                                    <div key={r.id} className={`${shift.bg} rounded-lg p-1.5 text-center border border-dashed ${shift.border}`}>
                                                        <p className={`text-xs font-bold ${shift.color}`}>{shift.label}</p>
                                                        <p className={`text-[9px] font-medium ${statusColor}`}>{statusLabel}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-300 text-xs mt-6">Nghỉ</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                        <div className="flex flex-wrap gap-6">
                            {SHIFTS.map(s => (
                                <div key={s.key} className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-lg ${s.bg} border ${s.border}`}>
                                        <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{s.time}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">⏳</span>
                                <span className="text-xs text-slate-500">Chờ duyệt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 text-sm">✓</span>
                                <span className="text-xs text-slate-500">Đã duyệt</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ===== REGISTER VIEW ===== */
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">Chọn các ca bạn muốn làm trong tuần, sau đó nhấn "Gửi đăng ký". Manager sẽ duyệt và xếp lịch cho bạn.</p>
                    </div>

                    {/* Selection Grid */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Header row */}
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-200">
                            <div className="p-3 bg-slate-50"></div>
                            {weekDays.map((day, idx) => {
                                const today = isToday(day);
                                const past = isPast(day);
                                return (
                                    <div key={idx} className={`p-3 text-center border-l border-slate-100 ${today ? "bg-[#009099]/5" : past ? "bg-slate-50" : ""}`}>
                                        <p className={`text-xs font-medium ${today ? "text-[#009099]" : past ? "text-slate-400" : "text-slate-600"}`}>{DAY_NAMES[idx]}</p>
                                        <p className={`text-sm font-bold ${today ? "text-[#009099]" : past ? "text-slate-400" : "text-slate-800"}`}>{day.getDate()}/{day.getMonth() + 1}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Shift rows */}
                        {SHIFTS.map(shift => (
                            <div key={shift.key} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0">
                                <div className="p-3 flex items-center gap-2 bg-slate-50">
                                    <div className={`px-2 py-1 rounded-lg ${shift.bg} border ${shift.border}`}>
                                        <span className={`text-xs font-bold ${shift.color}`}>{shift.label}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{shift.time}</span>
                                </div>
                                {weekDays.map((day, dayIdx) => {
                                        const past = isPast(day);
                                        const selected = selections.get(dayIdx)?.has(shift.key) || false;
                                        const existingReq = getRequestsForDate(day).find(r => r.shift_type === shift.key);
                                        const existingSched = getScheduleForDate(day).find(s => s.shift_type === shift.key);

                                        if (existingSched) {
                                            return (
                                                <div key={dayIdx} className={`p-2 border-l border-slate-100 flex items-center justify-center ${shift.bg}`}>
                                                    <span className={`text-xs font-medium ${shift.color}`}>Đã xếp ✓</span>
                                                </div>
                                            );
                                        }

                                        if (existingReq && existingReq.status !== "pending") {
                                            return (
                                                <div key={dayIdx} className={`p-2 border-l border-slate-100 flex items-center justify-center ${existingReq.status === "approved" ? "bg-green-50" : "bg-red-50"}`}>
                                                    <span className={`text-xs font-medium ${existingReq.status === "approved" ? "text-green-600" : "text-red-600"}`}>
                                                        {existingReq.status === "approved" ? "Duyệt ✓" : "Từ chối ✗"}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={dayIdx} className="p-2 border-l border-slate-100 flex items-center justify-center">
                                                <button
                                                    onClick={() => toggleShift(dayIdx, shift.key)}
                                                    disabled={past}
                                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                                                        past ? "bg-slate-50 cursor-not-allowed" :
                                                        selected ? `${shift.bg} border-2 ${shift.border} shadow-sm scale-110` :
                                                        "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                                                    }`}
                                                >
                                                    {past ? (
                                                        <span className="text-slate-300 text-xs">—</span>
                                                    ) : selected ? (
                                                        <CheckCircle size={18} className={shift.color} />
                                                    ) : (
                                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                    </div>

                    {/* Summary & Submit */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Đã chọn <span className="font-bold text-[#009099]">{totalSelected}</span> ca trong tuần
                                </p>
                                {totalSelected > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Array.from(selections.entries()).sort((a, b) => a[0] - b[0]).map(([dayIdx, shifts]) => (
                                            Array.from(shifts).map(s => {
                                                const shift = SHIFTS.find(sh => sh.key === s)!;
                                                return (
                                                    <span key={`${dayIdx}-${s}`} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${shift.bg} ${shift.color}`}>
                                                        {DAY_FULL[dayIdx]} - {shift.label}
                                                    </span>
                                                );
                                            })
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={submitRequest}
                                disabled={submitting || totalSelected === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#009099] text-white rounded-xl font-medium hover:bg-[#007a82] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                                Gửi đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
