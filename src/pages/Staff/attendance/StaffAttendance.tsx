import { useState, useEffect, useCallback } from "react";
import { 
    Clock, LogIn, LogOut, CheckCircle, XCircle, Calendar, Timer, 
    TrendingUp, TrendingDown, Award, Flame, AlertTriangle, Bell,
    ChevronLeft, ChevronRight, BarChart3
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface AttendanceRecord {
    id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    shift_type: string;
    schedule_start?: string;
    schedule_end?: string;
    status: "on_time" | "late" | "early_leave" | "absent";
    work_hours: number;
}

interface TodaySchedule {
    id: string;
    shift_type: string;
    start_time: string;
    end_time: string;
    date: string;
}

interface TodayAttendance {
    id?: string;
    check_in: string | null;
    check_out: string | null;
    status?: string;
    schedule_start?: string;
    schedule_end?: string;
}

interface WeeklyData {
    weekLabel: string;
    totalHours: number;
    daysWorked: number;
    onTime: number;
    late: number;
}

interface RankingItem {
    userId: string;
    name: string;
    total: number;
    onTime: number;
    rate: number;
}

interface MonthComparison {
    current: { totalDays: number; totalHours: number; onTime: number; late: number };
    previous: { totalDays: number; totalHours: number; onTime: number; late: number };
    comparison: { hoursChange: number; daysChange: number; onTimeChange: number };
}

export default function StaffAttendance() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [todaySchedule, setTodaySchedule] = useState<TodaySchedule | null>(null);
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [streak, setStreak] = useState(0);
    const [monthComparison, setMonthComparison] = useState<MonthComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [workingTime, setWorkingTime] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            // Update working time if checked in
            if (todayAttendance?.check_in && !todayAttendance?.check_out) {
                const [h, m] = todayAttendance.check_in.split(':').map(Number);
                const checkInMinutes = h * 60 + m;
                const now = new Date();
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                setWorkingTime(nowMinutes - checkInMinutes);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [todayAttendance]);

    // Check for notifications
    useEffect(() => {
        if (!todaySchedule || !currentTime) return;
        
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
        const [startH, startM] = todaySchedule.start_time.split(':').map(Number);
        const [endH, endM] = todaySchedule.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Nhắc check-in 15 phút trước ca
        if (!todayAttendance?.check_in && now >= startMinutes - 15 && now < startMinutes) {
            setNotification({ type: "warning", message: `Còn ${startMinutes - now} phút nữa là đến giờ làm việc!` });
        }
        // Cảnh báo đi muộn
        else if (!todayAttendance?.check_in && now > startMinutes + 5) {
            setNotification({ type: "error", message: "Bạn đang đi muộn! Hãy check-in ngay." });
        }
        // Nhắc check-out 15 phút trước khi hết ca
        else if (todayAttendance?.check_in && !todayAttendance?.check_out && now >= endMinutes - 15 && now < endMinutes) {
            setNotification({ type: "info", message: `Còn ${endMinutes - now} phút nữa là hết ca làm việc.` });
        }
        // Quên check-out
        else if (todayAttendance?.check_in && !todayAttendance?.check_out && now > endMinutes + 30) {
            setNotification({ type: "error", message: "Bạn quên check-out! Hãy check-out ngay." });
        }
        else {
            setNotification(null);
        }
    }, [currentTime, todaySchedule, todayAttendance]);

    const fetchAllData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [scheduleRes, attendanceRes, historyRes, weeklyRes, streakRes, rankingRes, comparisonRes] = await Promise.all([
                fetch(`http://localhost:3001/api/attendance/${userId}/schedule-today`),
                fetch(`http://localhost:3001/api/attendance/${userId}/today`),
                fetch(`http://localhost:3001/api/attendance/${userId}`),
                fetch(`http://localhost:3001/api/attendance/${userId}/weekly?weeks=4`),
                fetch(`http://localhost:3001/api/attendance/${userId}/streak`),
                fetch(`http://localhost:3001/api/attendance-ranking`),
                fetch(`http://localhost:3001/api/attendance/${userId}/comparison`)
            ]);

            const [schedule, attendance, history, weekly, streakData, rankingData, comparison] = await Promise.all([
                scheduleRes.json(), attendanceRes.json(), historyRes.json(),
                weeklyRes.json(), streakRes.json(), rankingRes.json(), comparisonRes.json()
            ]);

            if (schedule.success) setTodaySchedule(schedule.data);
            if (attendance.success) setTodayAttendance(attendance.data);
            if (history.success) setAttendanceHistory(history.data || []);
            if (weekly.success) setWeeklyData(weekly.data || []);
            if (streakData.success) setStreak(streakData.data?.streak || 0);
            if (rankingData.success) setRanking(rankingData.data || []);
            if (comparison.success) setMonthComparison(comparison.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleCheckIn = async () => {
        if (!userId) return;
        setActionLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/attendance/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const json = await res.json();
            if (json.success) {
                setTodayAttendance(json.data);
                fetchAllData();
                if (json.data.isLate) {
                    setNotification({ type: "warning", message: "Check-in thành công nhưng bạn đã đi muộn!" });
                } else {
                    setNotification({ type: "success", message: "Check-in thành công! Chúc bạn ngày làm việc hiệu quả." });
                }
            } else {
                setNotification({ type: "error", message: json.message || "Check-in thất bại" });
            }
        } catch (error) {
            setNotification({ type: "error", message: "Có lỗi xảy ra khi check-in" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!userId) return;
        setActionLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/attendance/check-out", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const json = await res.json();
            if (json.success) {
                setTodayAttendance(json.data);
                setWorkingTime(0);
                fetchAllData();
                setNotification({ type: "success", message: `Check-out thành công! Bạn đã làm ${json.data.work_hours} giờ hôm nay.` });
            } else {
                setNotification({ type: "error", message: json.message || "Check-out thất bại" });
            }
        } catch (error) {
            setNotification({ type: "error", message: "Có lỗi xảy ra khi check-out" });
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "on_time":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} /> Đúng giờ</span>;
            case "late":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock size={12} /> Đi muộn</span>;
            case "early_leave":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 flex items-center gap-1"><LogOut size={12} /> Về sớm</span>;
            case "absent":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} /> Vắng mặt</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    };

    const formatWorkingTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getCountdown = () => {
        if (!todaySchedule) return null;
        const now = currentTime.getHours() * 60 + currentTime.getMinutes();
        const [startH, startM] = todaySchedule.start_time.split(':').map(Number);
        const [endH, endM] = todaySchedule.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if (!todayAttendance?.check_in && now < startMinutes) {
            const diff = startMinutes - now;
            return { label: "Còn", time: formatWorkingTime(diff), type: "start" };
        }
        if (todayAttendance?.check_in && !todayAttendance?.check_out && now < endMinutes) {
            const diff = endMinutes - now;
            return { label: "Còn", time: formatWorkingTime(diff), type: "end" };
        }
        return null;
    };

    const countdown = getCountdown();
    const isCheckedIn = todayAttendance?.check_in && !todayAttendance?.check_out;
    const isCheckedOut = todayAttendance?.check_in && todayAttendance?.check_out;
    const maxHours = Math.max(...weeklyData.map(w => w.totalHours), 1);

    // Filter history by selected month
    const filteredHistory = attendanceHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === selectedMonth.getMonth() && 
               recordDate.getFullYear() === selectedMonth.getFullYear();
    });

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedMonth(newDate);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009099]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notification Banner */}
            {notification && (
                <div className={`rounded-xl p-4 flex items-center gap-3 animate-pulse ${
                    notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                    notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                }`}>
                    <Bell size={20} className={
                        notification.type === 'error' ? 'text-red-500' :
                        notification.type === 'warning' ? 'text-yellow-500' :
                        notification.type === 'success' ? 'text-green-500' :
                        'text-blue-500'
                    } />
                    <span className={`font-medium ${
                        notification.type === 'error' ? 'text-red-700' :
                        notification.type === 'warning' ? 'text-yellow-700' :
                        notification.type === 'success' ? 'text-green-700' :
                        'text-blue-700'
                    }`}>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chấm công</h1>
                    <p className="text-slate-500 mt-1">Check-in / Check-out ca làm việc</p>
                </div>
                {/* Streak Badge */}
                {streak > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                        <Flame size={20} />
                        <span className="font-bold">{streak} ngày</span>
                        <span className="text-sm opacity-90">đúng giờ liên tiếp</span>
                    </div>
                )}
            </div>

            {/* Main Check-in Card */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-2xl p-6 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Time Display */}
                        <div className="text-center lg:text-left">
                            <p className="text-slate-300 text-sm mb-2">
                                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-5xl font-bold tracking-wider font-mono">
                                {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                            
                            {/* Today's Schedule */}
                            {todaySchedule ? (
                                <div className="mt-4 p-3 bg-white/10 rounded-xl">
                                    <p className="text-sm text-slate-300">Ca làm hôm nay</p>
                                    <p className="text-lg font-semibold text-[#00d4e0]">
                                        {todaySchedule.shift_type} • {todaySchedule.start_time} - {todaySchedule.end_time}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                                    <p className="text-sm text-red-300 flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        Bạn không có lịch làm việc hôm nay
                                    </p>
                                </div>
                            )}

                            {/* Status Info */}
                            {todayAttendance?.check_in && (
                                <div className="mt-3 space-y-1">
                                    <p className="text-[#009099] flex items-center justify-center lg:justify-start gap-2">
                                        <CheckCircle size={16} />
                                        Check-in lúc {todayAttendance.check_in}
                                        {todayAttendance.check_out && ` • Check-out lúc ${todayAttendance.check_out}`}
                                    </p>
                                    {isCheckedIn && (
                                        <p className="text-white/80 text-sm">
                                            Đang làm việc: <span className="font-bold text-[#00d4e0]">{formatWorkingTime(workingTime)}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Countdown + Buttons */}
                        <div className="flex flex-col items-center gap-4">
                            {/* Countdown */}
                            {countdown && (
                                <div className="text-center p-4 bg-white/10 rounded-xl min-w-[150px]">
                                    <p className="text-xs text-slate-300 uppercase tracking-wider">{countdown.label}</p>
                                    <p className="text-2xl font-bold text-[#00d4e0]">{countdown.time}</p>
                                    <p className="text-xs text-slate-400">
                                        {countdown.type === 'start' ? 'đến giờ làm' : 'hết ca'}
                                    </p>
                                </div>
                            )}

                            {/* Check-in/out Buttons */}
                            <div className="flex gap-4 justify-center">
                                {!todaySchedule ? (
                                    <div className="flex items-center gap-3 px-8 py-4 bg-slate-600 rounded-xl font-semibold cursor-not-allowed">
                                        <XCircle size={24} />
                                        <span>Không có ca làm</span>
                                    </div>
                                ) : !todayAttendance?.check_in ? (
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={actionLoading}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#009099] hover:bg-[#007a82] rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#009099]/30 hover:shadow-[#009099]/50 hover:scale-105"
                                    >
                                        {actionLoading ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        ) : (
                                            <LogIn size={24} />
                                        )}
                                        <span>Check-in</span>
                                    </button>
                                ) : isCheckedIn ? (
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={actionLoading}
                                        className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
                                    >
                                        {actionLoading ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        ) : (
                                            <LogOut size={24} />
                                        )}
                                        <span>Check-out</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3 px-8 py-4 bg-green-600 rounded-xl font-semibold">
                                        <CheckCircle size={24} />
                                        <span>Đã hoàn thành</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Month Comparison Stats */}
                {monthComparison && (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#009099]/10 flex items-center justify-center">
                                    <Calendar size={20} className="text-[#009099]" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Ngày làm tháng này</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-bold text-slate-800">{monthComparison.current.totalDays}</p>
                                        {monthComparison.comparison.daysChange !== 0 && (
                                            <span className={`text-xs flex items-center ${monthComparison.comparison.daysChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {monthComparison.comparison.daysChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(monthComparison.comparison.daysChange)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <CheckCircle size={20} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Đúng giờ</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-bold text-slate-800">{monthComparison.current.onTime}</p>
                                        {monthComparison.comparison.onTimeChange !== 0 && (
                                            <span className={`text-xs flex items-center ${monthComparison.comparison.onTimeChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {monthComparison.comparison.onTimeChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(monthComparison.comparison.onTimeChange)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                                    <Clock size={20} className="text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Đi muộn</p>
                                    <p className="text-xl font-bold text-slate-800">{monthComparison.current.late}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Timer size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Tổng giờ</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-bold text-slate-800">{monthComparison.current.totalHours.toFixed(1)}h</p>
                                        {monthComparison.comparison.hoursChange !== 0 && (
                                            <span className={`text-xs flex items-center ${monthComparison.comparison.hoursChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {monthComparison.comparison.hoursChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(monthComparison.comparison.hoursChange).toFixed(1)}h
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {/* Streak */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-sm p-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Flame size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-white/80">Streak đúng giờ</p>
                            <p className="text-xl font-bold">{streak} ngày</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Hours Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <BarChart3 size={20} className="text-[#009099]" />
                            Số giờ làm theo tuần
                        </h3>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {weeklyData.map((week, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '120px' }}>
                                    <div 
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#009099] to-[#00b8c4] rounded-t-lg transition-all duration-500"
                                        style={{ height: `${(week.totalHours / maxHours) * 100}%` }}
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#009099]">
                                            {week.totalHours.toFixed(1)}h
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">{week.weekLabel}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Award size={20} className="text-yellow-500" />
                            Top đúng giờ tháng này
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {ranking.map((item, idx) => (
                            <div key={item.userId} className={`flex items-center gap-3 p-3 rounded-xl ${
                                item.userId === userId ? 'bg-[#009099]/10 border border-[#009099]/30' : 'bg-slate-50'
                            }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                                    idx === 2 ? 'bg-orange-400 text-orange-900' :
                                    'bg-slate-200 text-slate-600'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${item.userId === userId ? 'text-[#009099]' : 'text-slate-800'}`}>
                                        {item.name} {item.userId === userId && '(Bạn)'}
                                    </p>
                                    <p className="text-xs text-slate-500">{item.onTime}/{item.total} ngày đúng giờ</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${item.rate >= 90 ? 'text-green-500' : item.rate >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {item.rate}%
                                    </p>
                                </div>
                            </div>
                        ))}
                        {ranking.length === 0 && (
                            <p className="text-center text-slate-500 py-4">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Lịch sử chấm công</h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} className="text-slate-500" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 min-w-[120px] text-center">
                            Tháng {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
                        </span>
                        <button 
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} className="text-slate-500" />
                        </button>
                    </div>
                </div>
                
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Không có dữ liệu chấm công trong tháng này</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ca làm</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Giờ ca</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Check-in</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Check-out</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Số giờ</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{formatDate(record.date)}</td>
                                        <td className="px-6 py-4 text-slate-600">{record.shift_type || "Ca sáng"}</td>
                                        <td className="px-6 py-4 text-center text-slate-500 text-sm">
                                            {record.schedule_start && record.schedule_end 
                                                ? `${record.schedule_start} - ${record.schedule_end}`
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {record.check_in ? (
                                                <span className="text-green-600 font-medium">{record.check_in}</span>
                                            ) : (
                                                <span className="text-slate-300">--:--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {record.check_out ? (
                                                <span className="text-red-500 font-medium">{record.check_out}</span>
                                            ) : (
                                                <span className="text-slate-300">--:--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-800">
                                            {record.work_hours > 0 ? `${record.work_hours}h` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(record.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
