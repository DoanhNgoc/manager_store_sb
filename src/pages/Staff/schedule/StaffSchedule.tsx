import { useState, useEffect, useCallback } from "react";
import {
    Calendar, ChevronLeft, ChevronRight, Send, CheckCircle, RefreshCw, 
    Info, Clock, Plus, X, Sun, Sunset, Moon, CalendarDays
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Notification/Toast";

type ViewTab = "schedule" | "register";

interface Schedule {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: "scheduled" | "completed" | "absent";
}

interface ScheduleRequest {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: "pending" | "approved" | "rejected";
}

interface TimeSlot {
    start_time: string;
    end_time: string;
}

const STORE_CONFIG = {
    openTime: "07:00",
    closeTime: "23:00",
    minHours: 4,
    maxHours: 10,
};

const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, "0")}:00`;
});

const DAY_NAMES_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_NAMES_FULL = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

const calcHours = (start: string, end: string) => {
    const [sh] = start.split(":").map(Number);
    const [eh] = end.split(":").map(Number);
    return eh - sh;
};

const formatTimeDisplay = (time: string) => `${parseInt(time.split(":")[0])}:00`;

const getShiftInfo = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return { label: "Ca sáng", icon: Sun, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconColor: "text-amber-500" };
    if (hour < 18) return { label: "Ca chiều", icon: Sunset, bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", iconColor: "text-sky-500" };
    return { label: "Ca tối", icon: Moon, bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", iconColor: "text-indigo-500" };
};

export default function StaffSchedule() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const userName = authContext?.lastName || "Nhân viên";
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [requests, setRequests] = useState<ScheduleRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<ViewTab>("schedule");
    const [selections, setSelections] = useState<Map<number, TimeSlot[]>>(new Map());
    const [addModal, setAddModal] = useState<{ dayIdx: number } | null>(null);
    const [newSlot, setNewSlot] = useState<TimeSlot>({ start_time: "07:00", end_time: "13:00" });

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
                const map = new Map<number, TimeSlot[]>();
                for (const r of (reqJson.data || []) as ScheduleRequest[]) {
                    if (r.status !== "pending") continue;
                    const dayIdx = weekDays.findIndex(d => d.toISOString().split("T")[0] === r.date);
                    if (dayIdx >= 0) {
                        const slots = map.get(dayIdx) || [];
                        slots.push({ start_time: r.start_time, end_time: r.end_time });
                        map.set(dayIdx, slots);
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

    const addSlot = (dayIdx: number, slot: TimeSlot) => {
        setSelections(prev => {
            const next = new Map(prev);
            const slots = [...(next.get(dayIdx) || []), slot];
            next.set(dayIdx, slots);
            return next;
        });
    };

    const removeSlot = (dayIdx: number, slotIdx: number) => {
        setSelections(prev => {
            const next = new Map(prev);
            const slots = [...(next.get(dayIdx) || [])];
            slots.splice(slotIdx, 1);
            if (slots.length === 0) next.delete(dayIdx);
            else next.set(dayIdx, slots);
            return next;
        });
    };

    const totalSlots = Array.from(selections.values()).reduce((sum, s) => sum + s.length, 0);
    const totalHoursSelected = Array.from(selections.values()).reduce((sum, slots) => 
        sum + slots.reduce((h, s) => h + calcHours(s.start_time, s.end_time), 0), 0);

    const handleAddSlot = () => {
        if (!addModal) return;
        const hours = calcHours(newSlot.start_time, newSlot.end_time);
        if (hours < STORE_CONFIG.minHours) {
            showToast("error", `Ca làm tối thiểu ${STORE_CONFIG.minHours} giờ`);
            return;
        }
        if (hours > STORE_CONFIG.maxHours) {
            showToast("error", `Ca làm tối đa ${STORE_CONFIG.maxHours} giờ`);
            return;
        }
        addSlot(addModal.dayIdx, newSlot);
        setAddModal(null);
        setNewSlot({ start_time: "07:00", end_time: "13:00" });
    };

    const submitRequest = async () => {
        if (!userId || totalSlots === 0) return;
        setSubmitting(true);
        try {
            const days: Date[] = [];
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                days.push(d);
            }
            
            const weekData = Array.from(selections.entries()).map(([dayIdx, slots]) => ({
                date: days[dayIdx].toISOString().split("T")[0],
                slots: slots,
            }));
            
            const res = await fetch("http://localhost:3001/api/schedule-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, weekData }),
            });
            const json = await res.json();
            
            if (json.success) {
                showToast("success", "Đã gửi đăng ký lịch làm thành công!");
                setSelections(new Map());
                fetchData();
                try {
                    await fetch("http://localhost:3001/api/notifications/schedule-request", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ staffName: userName, weekStart: startDateStr, weekEnd: endDateStr, slotCount: totalSlots }),
                    });
                } catch (notifyErr) {
                    console.error("Error sending notification:", notifyErr);
                }
            } else {
                showToast("error", json.message || "Không thể gửi đăng ký");
            }
        } catch (err) {
            showToast("error", "Lỗi kết nối server");
        } finally {
            setSubmitting(false);
        }
    };

    const getScheduleForDate = (date: Date) => schedules.filter(s => s.date === date.toISOString().split("T")[0]);
    const getRequestsForDate = (date: Date) => requests.filter(r => r.date === date.toISOString().split("T")[0]);

    const weekLabel = `${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1} - ${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}/${weekDays[6].getFullYear()}`;
    const totalScheduled = schedules.length;
    const totalHours = schedules.reduce((acc, s) => acc + calcHours(s.start_time, s.end_time), 0);

    // Tính tổng số ngày làm việc
    const workingDays = new Set(schedules.map(s => s.date)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#009099] to-[#00b8c4] flex items-center justify-center shadow-lg">
                            <CalendarDays size={24} className="text-white" />
                        </div>
                        Lịch làm việc
                    </h1>
                    <p className="text-slate-500 mt-2 ml-15">Xem lịch và đăng ký ca làm linh hoạt theo nhu cầu</p>
                </div>
                
                {/* Stats Cards */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-10 h-10 rounded-xl bg-[#009099]/10 flex items-center justify-center">
                            <Calendar size={20} className="text-[#009099]" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Số ca</p>
                            <p className="text-lg font-bold text-slate-800">{totalScheduled}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tổng giờ</p>
                            <p className="text-lg font-bold text-slate-800">{totalHours}h</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Ngày làm</p>
                            <p className="text-lg font-bold text-slate-800">{workingDays}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab("schedule")}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "schedule" ? "bg-gradient-to-r from-[#009099] to-[#00b8c4] text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Calendar size={18} /> Xem lịch làm việc
                    </button>
                    <button onClick={() => setActiveTab("register")}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "register" ? "bg-gradient-to-r from-[#009099] to-[#00b8c4] text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Send size={18} /> Đăng ký ca làm
                    </button>
                </div>
            </div>

            {/* Week Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-5">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigateWeek(-1)} className="p-3 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronLeft size={24} className="text-slate-600" />
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tuần làm việc</p>
                        <h3 className="text-xl lg:text-2xl font-bold text-slate-800">{weekLabel}</h3>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm text-[#009099] hover:underline mt-1 font-medium">
                            ← Về tuần hiện tại
                        </button>
                    </div>
                    <button onClick={() => navigateWeek(1)} className="p-3 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronRight size={24} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009099] mx-auto mb-4"></div>
                        <p className="text-slate-500">Đang tải lịch làm việc...</p>
                    </div>
                </div>
            ) : activeTab === "schedule" ? (
                /* ===== SCHEDULE VIEW - REDESIGNED ===== */
                <div className="space-y-6">
                    {/* Main Schedule Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <div className="grid grid-cols-7">
                                {weekDays.map((day, idx) => {
                                    const today = isToday(day);
                                    const past = isPast(day);
                                    return (
                                        <div key={idx} className={`p-4 lg:p-5 text-center border-r border-slate-200 last:border-r-0 ${today ? "bg-[#009099]/10" : ""}`}>
                                            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${today ? "text-[#009099]" : past ? "text-slate-400" : "text-slate-500"}`}>
                                                {DAY_NAMES_SHORT[idx]}
                                            </p>
                                            <div className={`inline-flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full text-lg lg:text-xl font-bold ${today ? "bg-[#009099] text-white shadow-lg" : past ? "text-slate-400" : "text-slate-700"}`}>
                                                {day.getDate()}
                                            </div>
                                            <p className={`text-[10px] lg:text-xs mt-1 ${today ? "text-[#009099] font-medium" : "text-slate-400"}`}>
                                                {today ? "Hôm nay" : `Tháng ${day.getMonth() + 1}`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Table Body - Schedule Cells */}
                        <div className="grid grid-cols-7 min-h-[300px] lg:min-h-[400px]">
                            {weekDays.map((day, idx) => {
                                const daySchedules = getScheduleForDate(day);
                                const dayRequests = getRequestsForDate(day);
                                const today = isToday(day);
                                const past = isPast(day);
                                
                                return (
                                    <div key={idx} className={`p-3 lg:p-4 border-r border-slate-200 last:border-r-0 ${today ? "bg-[#009099]/5" : past ? "bg-slate-50/50" : "bg-white"}`}>
                                        <div className="space-y-3">
                                            {/* Scheduled shifts */}
                                            {daySchedules.map(s => {
                                                const shift = getShiftInfo(s.start_time);
                                                const ShiftIcon = shift.icon;
                                                const hours = calcHours(s.start_time, s.end_time);
                                                return (
                                                    <div key={s.id} className={`${shift.bg} ${shift.border} border-2 rounded-xl p-3 lg:p-4 transition-all hover:shadow-md`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ShiftIcon size={16} className={shift.iconColor} />
                                                            <span className={`text-xs font-semibold ${shift.text}`}>{shift.label}</span>
                                                        </div>
                                                        <p className={`text-base lg:text-lg font-bold ${shift.text}`}>
                                                            {formatTimeDisplay(s.start_time)} - {formatTimeDisplay(s.end_time)}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-slate-500">{hours} giờ</span>
                                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Đã xếp</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            
                                            {/* Pending/Approved/Rejected requests */}
                                            {daySchedules.length === 0 && dayRequests.map(r => {
                                                const shift = getShiftInfo(r.start_time);
                                                const ShiftIcon = shift.icon;
                                                const hours = calcHours(r.start_time, r.end_time);
                                                const statusConfig = {
                                                    pending: { label: "⏳ Chờ duyệt", color: "text-yellow-600 bg-yellow-100" },
                                                    approved: { label: "✓ Đã duyệt", color: "text-green-600 bg-green-100" },
                                                    rejected: { label: "✗ Từ chối", color: "text-red-600 bg-red-100" },
                                                };
                                                const status = statusConfig[r.status];
                                                
                                                return (
                                                    <div key={r.id} className={`${shift.bg} border-2 border-dashed ${shift.border} rounded-xl p-3 lg:p-4 opacity-90`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ShiftIcon size={16} className={shift.iconColor} />
                                                            <span className={`text-xs font-semibold ${shift.text}`}>{shift.label}</span>
                                                        </div>
                                                        <p className={`text-base lg:text-lg font-bold ${shift.text}`}>
                                                            {formatTimeDisplay(r.start_time)} - {formatTimeDisplay(r.end_time)}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-slate-500">{hours} giờ</span>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            
                                            {/* Empty state */}
                                            {daySchedules.length === 0 && dayRequests.length === 0 && (
                                                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-300">
                                                    <Calendar size={32} strokeWidth={1.5} />
                                                    <p className="text-sm mt-2 font-medium">{past ? "Đã qua" : "Nghỉ"}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4">Chú thích màu sắc</h4>
                        <div className="flex flex-wrap gap-4 lg:gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                                    <Sun size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Ca sáng</p>
                                    <p className="text-xs text-slate-400">7:00 - 12:00</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
                                    <Sunset size={18} className="text-sky-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Ca chiều</p>
                                    <p className="text-xs text-slate-400">12:00 - 18:00</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center">
                                    <Moon size={18} className="text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Ca tối</p>
                                    <p className="text-xs text-slate-400">18:00 - 23:00</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-600 text-xs font-medium">⏳ Chờ duyệt</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-medium">✓ Đã duyệt</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ===== REGISTER VIEW ===== */
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Info size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-1">Đăng ký ca làm linh hoạt</h4>
                            <p className="text-sm text-blue-700">
                                Chọn giờ bắt đầu và kết thúc theo nhu cầu của bạn. Mỗi ca tối thiểu <strong>{STORE_CONFIG.minHours} giờ</strong>, tối đa <strong>{STORE_CONFIG.maxHours} giờ</strong>.
                                Nhấn nút <strong>+</strong> để thêm ca vào ngày bạn muốn đăng ký.
                            </p>
                        </div>
                    </div>

                    {/* Day Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {weekDays.map((day, dayIdx) => {
                            const past = isPast(day);
                            const today = isToday(day);
                            const daySlots = selections.get(dayIdx) || [];
                            const existingSchedules = getScheduleForDate(day);
                            const existingRequests = getRequestsForDate(day).filter(r => r.status !== "pending");

                            return (
                                <div key={dayIdx} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${today ? "border-[#009099] ring-2 ring-[#009099]/20" : past ? "border-slate-100 opacity-60" : "border-slate-200"}`}>
                                    {/* Day Header */}
                                    <div className={`px-5 py-4 ${today ? "bg-gradient-to-r from-[#009099]/10 to-[#00b8c4]/10" : "bg-slate-50"}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-xs font-semibold uppercase tracking-wider ${today ? "text-[#009099]" : past ? "text-slate-400" : "text-slate-500"}`}>
                                                    {DAY_NAMES_FULL[dayIdx]}
                                                </p>
                                                <p className={`text-2xl font-bold mt-1 ${today ? "text-[#009099]" : past ? "text-slate-400" : "text-slate-800"}`}>
                                                    {day.getDate()}/{day.getMonth() + 1}
                                                </p>
                                                {today && <span className="text-xs text-[#009099] font-medium">Hôm nay</span>}
                                            </div>
                                            {!past && (
                                                <button onClick={() => setAddModal({ dayIdx })}
                                                    className="w-12 h-12 bg-gradient-to-br from-[#009099] to-[#00b8c4] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center">
                                                    <Plus size={24} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Slots Content */}
                                    <div className="p-4 space-y-3 min-h-[140px]">
                                        {/* Existing Schedules */}
                                        {existingSchedules.map(s => {
                                            const shift = getShiftInfo(s.start_time);
                                            const ShiftIcon = shift.icon;
                                            return (
                                                <div key={s.id} className={`${shift.bg} ${shift.border} border-2 rounded-xl p-4`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShiftIcon size={16} className={shift.iconColor} />
                                                        <span className={`text-xs font-semibold ${shift.text}`}>{shift.label}</span>
                                                    </div>
                                                    <p className={`text-lg font-bold ${shift.text}`}>
                                                        {formatTimeDisplay(s.start_time)} - {formatTimeDisplay(s.end_time)}
                                                    </p>
                                                    <span className="inline-block mt-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Đã xếp lịch</span>
                                                </div>
                                            );
                                        })}

                                        {/* Existing Requests */}
                                        {existingRequests.map(r => {
                                            const shift = getShiftInfo(r.start_time);
                                            const ShiftIcon = shift.icon;
                                            return (
                                                <div key={r.id} className={`${shift.bg} ${shift.border} border-2 rounded-xl p-4`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShiftIcon size={16} className={shift.iconColor} />
                                                        <span className={`text-xs font-semibold ${shift.text}`}>{shift.label}</span>
                                                    </div>
                                                    <p className={`text-lg font-bold ${shift.text}`}>
                                                        {formatTimeDisplay(r.start_time)} - {formatTimeDisplay(r.end_time)}
                                                    </p>
                                                    <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${r.status === "approved" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                                                        {r.status === "approved" ? "✓ Đã duyệt" : "✗ Từ chối"}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {/* Selected Slots (pending submission) */}
                                        {daySlots.map((slot, slotIdx) => {
                                            const shift = getShiftInfo(slot.start_time);
                                            const ShiftIcon = shift.icon;
                                            const hours = calcHours(slot.start_time, slot.end_time);
                                            return (
                                                <div key={slotIdx} className={`${shift.bg} border-2 border-dashed ${shift.border} rounded-xl p-4 relative`}>
                                                    <button onClick={() => removeSlot(dayIdx, slotIdx)}
                                                        className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center">
                                                        <X size={16} />
                                                    </button>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShiftIcon size={16} className={shift.iconColor} />
                                                        <span className={`text-xs font-semibold ${shift.text}`}>{shift.label}</span>
                                                    </div>
                                                    <p className={`text-lg font-bold ${shift.text}`}>
                                                        {formatTimeDisplay(slot.start_time)} - {formatTimeDisplay(slot.end_time)}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-slate-500">{hours} giờ</span>
                                                        <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">⏳ Chờ gửi</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Empty State */}
                                        {existingSchedules.length === 0 && existingRequests.length === 0 && daySlots.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-slate-300">
                                                <Calendar size={32} strokeWidth={1.5} />
                                                <p className="text-sm mt-2">{past ? "Đã qua" : "Chưa đăng ký"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary & Submit */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Tổng kết đăng ký</h4>
                                <p className="text-slate-600">
                                    Đã chọn <span className="font-bold text-[#009099] text-lg">{totalSlots}</span> ca 
                                    (<span className="font-bold text-[#009099]">{totalHoursSelected} giờ</span>) trong tuần
                                </p>
                                {totalSlots > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {Array.from(selections.entries()).sort((a, b) => a[0] - b[0]).map(([dayIdx, slots]) => (
                                            slots.map((slot, slotIdx) => {
                                                const shift = getShiftInfo(slot.start_time);
                                                return (
                                                    <span key={`${dayIdx}-${slotIdx}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${shift.bg} ${shift.text} ${shift.border} border`}>
                                                        {DAY_NAMES_FULL[dayIdx]}: {formatTimeDisplay(slot.start_time)}-{formatTimeDisplay(slot.end_time)}
                                                    </span>
                                                );
                                            })
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={submitRequest} disabled={submitting || totalSlots === 0}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#009099] to-[#00b8c4] text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[180px]">
                                {submitting ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                                Gửi đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Slot Modal */}
            {addModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-[#009099] to-[#00b8c4] p-5 text-white">
                            <h3 className="text-xl font-bold">Thêm ca làm</h3>
                            <p className="text-white/80 mt-1">{DAY_NAMES_FULL[addModal.dayIdx]} - {weekDays[addModal.dayIdx].getDate()}/{weekDays[addModal.dayIdx].getMonth() + 1}</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Giờ bắt đầu</label>
                                    <select value={newSlot.start_time} onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] text-lg font-medium">
                                        {TIME_OPTIONS.slice(0, -STORE_CONFIG.minHours).map(t => (
                                            <option key={t} value={t}>{formatTimeDisplay(t)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Giờ kết thúc</label>
                                    <select value={newSlot.end_time} onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] text-lg font-medium">
                                        {TIME_OPTIONS.filter(t => t > newSlot.start_time).map(t => (
                                            <option key={t} value={t}>{formatTimeDisplay(t)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Preview */}
                            <div className="bg-slate-50 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Ca làm đã chọn</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            {formatTimeDisplay(newSlot.start_time)} - {formatTimeDisplay(newSlot.end_time)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Tổng thời gian</p>
                                        <p className="text-2xl font-bold text-[#009099] mt-1">{calcHours(newSlot.start_time, newSlot.end_time)} giờ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-200 flex gap-3">
                            <button onClick={() => setAddModal(null)}
                                className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleAddSlot}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#009099] to-[#00b8c4] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <CheckCircle size={20} />
                                Thêm ca
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
