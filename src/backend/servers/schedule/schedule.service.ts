import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

// Lấy tất cả ca làm việc
export async function getAllShifts() {
    const shiftsRef = collection(db, "shifts");
    const snap = await getDocs(shiftsRef);
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Lấy lịch làm việc của một nhân viên
export async function getScheduleByUserId(userId: string) {
    const schedulesRef = collection(db, "schedules");
    const q = query(schedulesRef, where("user_id", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Lấy lịch làm việc theo tuần
export async function getScheduleByWeek(userId: string, startDate: string, endDate: string) {
    const schedulesRef = collection(db, "schedules");
    const q = query(
        schedulesRef,
        where("user_id", "==", userId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Tạo lịch làm việc mới
export async function createSchedule(data: {
    user_id: string;
    date: string;
    shift_type: string;
    start_time: string;
    end_time: string;
}) {
    const schedulesRef = collection(db, "schedules");
    const docRef = await addDoc(schedulesRef, {
        ...data,
        status: "scheduled",
        created_at: Timestamp.now()
    });
    return { id: docRef.id, ...data };
}

// Cập nhật lịch làm việc
export async function updateSchedule(id: string, data: any) {
    const scheduleRef = doc(db, "schedules", id);
    await updateDoc(scheduleRef, {
        ...data,
        updated_at: Timestamp.now()
    });
}

// Xóa lịch làm việc
export async function deleteSchedule(id: string) {
    const scheduleRef = doc(db, "schedules", id);
    await deleteDoc(scheduleRef);
}

// ===== SCHEDULE REQUESTS (Đăng ký lịch làm) =====

const SHIFT_TIMES: Record<string, { start: string; end: string }> = {
    morning: { start: "07:00", end: "12:00" },
    afternoon: { start: "12:00", end: "18:00" },
    evening: { start: "18:00", end: "23:00" },
};

// Lấy đăng ký lịch làm theo tuần
export async function getScheduleRequests(userId: string, startDate: string, endDate: string) {
    const ref = collection(db, "schedule_requests");
    const q = query(
        ref,
        where("user_id", "==", userId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Gửi đăng ký lịch làm cho cả tuần
export async function submitScheduleRequest(userId: string, weekData: { date: string; shifts: string[] }[]) {
    const ref = collection(db, "schedule_requests");

    // Xóa các request cũ của tuần này (chỉ xóa pending)
    const dates = weekData.map(d => d.date);
    if (dates.length > 0) {
        const oldQ = query(
            ref,
            where("user_id", "==", userId),
            where("date", ">=", dates[0]),
            where("date", "<=", dates[dates.length - 1]),
            where("status", "==", "pending")
        );
        const oldSnap = await getDocs(oldQ);
        for (const d of oldSnap.docs) {
            await deleteDoc(d.ref);
        }
    }

    // Tạo mới
    const created: any[] = [];
    for (const day of weekData) {
        for (const shift of day.shifts) {
            const times = SHIFT_TIMES[shift];
            if (!times) continue;
            const docRef = await addDoc(ref, {
                user_id: userId,
                date: day.date,
                shift_type: shift,
                start_time: times.start,
                end_time: times.end,
                status: "pending",
                created_at: Timestamp.now(),
            });
            created.push({ id: docRef.id, date: day.date, shift_type: shift, status: "pending" });
        }
    }
    return created;
}

// ===== MANAGER: Quản lý lịch làm =====

// Lấy tất cả đăng ký theo tuần (tất cả nhân viên)
export async function getAllScheduleRequestsByWeek(startDate: string, endDate: string) {
    const ref = collection(db, "schedule_requests");
    const q = query(
        ref,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Lấy tất cả lịch đã xếp theo tuần (tất cả nhân viên)
export async function getAllSchedulesByWeek(startDate: string, endDate: string) {
    const ref = collection(db, "schedules");
    const q = query(
        ref,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Duyệt đăng ký -> tạo schedule + cập nhật request status
export async function approveScheduleRequest(requestId: string) {
    const reqRef = doc(db, "schedule_requests", requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found");

    const reqData = reqSnap.data();

    // Kiểm tra đã có schedule trùng chưa
    const schedRef = collection(db, "schedules");
    const existQ = query(
        schedRef,
        where("user_id", "==", reqData.user_id),
        where("date", "==", reqData.date),
        where("shift_type", "==", reqData.shift_type)
    );
    const existSnap = await getDocs(existQ);
    if (!existSnap.empty) {
        // Đã có schedule, chỉ cập nhật request
        await updateDoc(reqRef, { status: "approved", updated_at: Timestamp.now() });
        return { id: existSnap.docs[0].id };
    }

    // Tạo schedule mới
    const docRef = await addDoc(schedRef, {
        user_id: reqData.user_id,
        date: reqData.date,
        shift_type: reqData.shift_type,
        start_time: reqData.start_time,
        end_time: reqData.end_time,
        status: "scheduled",
        created_at: Timestamp.now(),
    });

    // Cập nhật request status
    await updateDoc(reqRef, { status: "approved", updated_at: Timestamp.now() });

    return { id: docRef.id };
}

// Từ chối đăng ký
export async function rejectScheduleRequest(requestId: string) {
    const reqRef = doc(db, "schedule_requests", requestId);
    await updateDoc(reqRef, { status: "rejected", updated_at: Timestamp.now() });
}

// Duyệt hàng loạt
export async function approveMultipleRequests(requestIds: string[]) {
    const results = [];
    for (const id of requestIds) {
        try {
            const result = await approveScheduleRequest(id);
            results.push({ id, success: true, ...result });
        } catch (err: any) {
            results.push({ id, success: false, error: err.message });
        }
    }
    return results;
}

// Manager tự xếp ca (không cần request)
export async function assignSchedule(data: {
    user_id: string;
    date: string;
    shift_type: string;
}) {
    const times = SHIFT_TIMES[data.shift_type];
    if (!times) throw new Error("Invalid shift type");

    // Kiểm tra trùng
    const schedRef = collection(db, "schedules");
    const existQ = query(
        schedRef,
        where("user_id", "==", data.user_id),
        where("date", "==", data.date),
        where("shift_type", "==", data.shift_type)
    );
    const existSnap = await getDocs(existQ);
    if (!existSnap.empty) throw new Error("Schedule already exists");

    const docRef = await addDoc(schedRef, {
        user_id: data.user_id,
        date: data.date,
        shift_type: data.shift_type,
        start_time: times.start,
        end_time: times.end,
        status: "scheduled",
        created_at: Timestamp.now(),
    });
    return { id: docRef.id };
}

// Manager xóa ca đã xếp
export async function removeSchedule(scheduleId: string) {
    const ref = doc(db, "schedules", scheduleId);
    await deleteDoc(ref);
}
