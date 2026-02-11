import { collection, doc, getDocs, addDoc, updateDoc, query, where, Timestamp, DocumentReference } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

// Helper: convert Timestamp to time string (HH:mm)
function timestampToTimeString(ts: Timestamp | null): string | null {
    if (!ts) return null;
    const date = ts.toDate();
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Helper: get user reference
function getUserRef(userId: string): DocumentReference {
    return doc(db, "users", userId);
}

// Lấy lịch sử chấm công của nhân viên
export async function getAttendanceByUserId(userId: string) {
    const userRef = getUserRef(userId);
    const attendanceRef = collection(db, "attendance");
    const q = query(attendanceRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => {
        const docData = d.data();
        return {
            id: d.id,
            ...docData,
            user_id: docData.user_id?.id || userId,
            check_in: timestampToTimeString(docData.check_in),
            check_out: timestampToTimeString(docData.check_out),
        };
    });
    return data.sort((a: any, b: any) => b.date?.localeCompare(a.date));
}

// Lấy chấm công hôm nay của nhân viên
export async function getTodayAttendance(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const userRef = getUserRef(userId);
    const attendanceRef = collection(db, "attendance");
    const q = query(
        attendanceRef,
        where("user_id", "==", userRef),
        where("date", "==", today)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0].data();
    return {
        id: snap.docs[0].id,
        ...docData,
        user_id: docData.user_id?.id || userId,
        check_in: timestampToTimeString(docData.check_in),
        check_out: timestampToTimeString(docData.check_out),
    };
}

// Lấy lịch làm việc hôm nay của nhân viên
export async function getTodaySchedule(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const schedulesRef = collection(db, "schedules");
    const q = query(
        schedulesRef,
        where("user_id", "==", userId),
        where("date", "==", today)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Tính trạng thái check-in (đúng giờ/muộn)
function calculateCheckInStatus(checkInTime: string, scheduleStartTime: string): "on_time" | "late" {
    const [checkH, checkM] = checkInTime.split(':').map(Number);
    const [schedH, schedM] = scheduleStartTime.split(':').map(Number);
    const checkMinutes = checkH * 60 + checkM;
    const schedMinutes = schedH * 60 + schedM;
    // Cho phép trễ 15 phút
    return checkMinutes <= schedMinutes + 15 ? "on_time" : "late";
}

// Tính trạng thái check-out (về sớm/đúng giờ)
function calculateCheckOutStatus(checkOutTime: string, scheduleEndTime: string, currentStatus: string): string {
    const [checkH, checkM] = checkOutTime.split(':').map(Number);
    const [schedH, schedM] = scheduleEndTime.split(':').map(Number);
    const checkMinutes = checkH * 60 + checkM;
    const schedMinutes = schedH * 60 + schedM;
    // Về sớm hơn 15 phút
    if (checkMinutes < schedMinutes - 15) {
        return currentStatus === "late" ? "late" : "early_leave";
    }
    return currentStatus;
}

// Check-in với tích hợp lịch làm việc
export async function checkIn(userId: string, scheduleId?: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const checkInTimestamp = Timestamp.fromDate(now);
    const checkInTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Kiểm tra đã check-in chưa
    const existing = await getTodayAttendance(userId);
    if (existing && (existing as any).check_in) {
        throw new Error("Bạn đã check-in hôm nay rồi");
    }

    // Lấy lịch làm việc hôm nay
    const schedule = await getTodaySchedule(userId);
    if (!schedule) {
        throw new Error("Bạn không có lịch làm việc hôm nay. Vui lòng liên hệ quản lý.");
    }

    const scheduleData = schedule as any;
    const status = calculateCheckInStatus(checkInTime, scheduleData.start_time);
    const userRef = getUserRef(userId);

    const attendanceRef = collection(db, "attendance");
    const docRef = await addDoc(attendanceRef, {
        user_id: userRef,
        schedule_id: schedule.id,
        date: today,
        check_in: checkInTimestamp,
        check_out: null,
        shift_type: scheduleData.shift_type,
        schedule_start: scheduleData.start_time,
        schedule_end: scheduleData.end_time,
        status,
        work_hours: 0,
        created_at: Timestamp.now()
    });

    return {
        id: docRef.id,
        date: today,
        check_in: checkInTime,
        check_out: null,
        shift_type: scheduleData.shift_type,
        schedule_start: scheduleData.start_time,
        schedule_end: scheduleData.end_time,
        status,
        isLate: status === "late"
    };
}

// Check-out
export async function checkOut(userId: string) {
    const now = new Date();
    const checkOutTimestamp = Timestamp.fromDate(now);
    const checkOutTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

    const existing = await getTodayAttendance(userId);
    if (!existing) {
        throw new Error("Bạn chưa check-in hôm nay");
    }
    const existingData = existing as any;
    if (existingData.check_out) {
        throw new Error("Bạn đã check-out hôm nay rồi");
    }

    // Tính số giờ làm việc từ check_in string
    const checkInTime = existingData.check_in;
    const [checkInH, checkInM] = checkInTime.split(':').map(Number);
    const [checkOutH, checkOutM] = checkOutTime.split(':').map(Number);
    const checkInMinutes = checkInH * 60 + checkInM;
    const checkOutMinutes = checkOutH * 60 + checkOutM;
    const workHours = Math.round((checkOutMinutes - checkInMinutes) / 60 * 100) / 100;

    // Tính trạng thái cuối cùng
    const finalStatus = existingData.schedule_end 
        ? calculateCheckOutStatus(checkOutTime, existingData.schedule_end, existingData.status)
        : existingData.status;

    const attendanceRef = doc(db, "attendance", existingData.id);
    await updateDoc(attendanceRef, {
        check_out: checkOutTimestamp,
        work_hours: workHours > 0 ? workHours : 0,
        status: finalStatus,
        updated_at: Timestamp.now()
    });

    return {
        ...existingData,
        check_out: checkOutTime,
        work_hours: workHours > 0 ? workHours : 0,
        status: finalStatus
    };
}

// Lấy thống kê chấm công theo tháng
export async function getAttendanceStats(userId: string, month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const userRef = getUserRef(userId);

    const attendanceRef = collection(db, "attendance");
    const q = query(
        attendanceRef,
        where("user_id", "==", userRef),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    const records = snap.docs.map(d => d.data());

    return {
        totalDays: records.length,
        onTime: records.filter(r => r.status === "on_time").length,
        late: records.filter(r => r.status === "late").length,
        earlyLeave: records.filter(r => r.status === "early_leave").length,
        absent: records.filter(r => r.status === "absent").length,
        totalHours: records.reduce((acc, r) => acc + (r.work_hours || 0), 0)
    };
}

// Lấy thống kê theo tuần (cho biểu đồ)
export async function getWeeklyStats(userId: string, weeksBack: number = 4) {
    const weeks = [];
    const now = new Date();
    const userRef = getUserRef(userId);
    
    for (let i = 0; i < weeksBack; i++) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);
        
        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];
        
        const attendanceRef = collection(db, "attendance");
        const q = query(
            attendanceRef,
            where("user_id", "==", userRef),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );
        const snap = await getDocs(q);
        const records = snap.docs.map(d => d.data());
        
        weeks.unshift({
            weekLabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
            totalHours: records.reduce((acc, r) => acc + (r.work_hours || 0), 0),
            daysWorked: records.length,
            onTime: records.filter(r => r.status === "on_time").length,
            late: records.filter(r => r.status === "late").length
        });
    }
    
    return weeks;
}

// Tính streak (số ngày liên tiếp đúng giờ)
export async function getOnTimeStreak(userId: string) {
    const userRef = getUserRef(userId);
    const attendanceRef = collection(db, "attendance");
    const q = query(attendanceRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    
    const records = snap.docs.map(d => d.data())
        .sort((a: any, b: any) => b.date?.localeCompare(a.date));
    
    let streak = 0;
    for (const record of records) {
        if (record.status === "on_time") {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Lấy ranking staff đúng giờ nhất (tháng hiện tại)
export async function getOnTimeRanking() {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

    const attendanceRef = collection(db, "attendance");
    const q = query(
        attendanceRef,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    
    // Group by user (user_id is now a reference)
    const userStats: Record<string, { total: number; onTime: number }> = {};
    snap.docs.forEach(d => {
        const data = d.data();
        const uid = data.user_id?.id || data.user_id;
        if (!userStats[uid]) {
            userStats[uid] = { total: 0, onTime: 0 };
        }
        userStats[uid].total++;
        if (data.status === "on_time") {
            userStats[uid].onTime++;
        }
    });

    // Get user names
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const usersMap: Record<string, string> = {};
    usersSnap.docs.forEach(d => {
        usersMap[d.id] = d.data().name || "Unknown";
    });

    // Calculate ranking
    const ranking = Object.entries(userStats)
        .map(([userId, stats]) => ({
            userId,
            name: usersMap[userId] || "Unknown",
            total: stats.total,
            onTime: stats.onTime,
            rate: stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0
        }))
        .sort((a, b) => b.rate - a.rate || b.onTime - a.onTime)
        .slice(0, 5);

    return ranking;
}

// So sánh với tháng trước
export async function getMonthComparison(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentStats = await getAttendanceStats(userId, currentMonth, currentYear);
    const prevStats = await getAttendanceStats(userId, prevMonth, prevYear);

    return {
        current: currentStats,
        previous: prevStats,
        comparison: {
            hoursChange: currentStats.totalHours - prevStats.totalHours,
            daysChange: currentStats.totalDays - prevStats.totalDays,
            onTimeChange: currentStats.onTime - prevStats.onTime
        }
    };
}
