import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, DocumentReference } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

// Helper: get user reference
function getUserRef(userId: string): DocumentReference {
    return doc(db, "users", userId);
}

// Lấy tất cả ca làm việc
export async function getAllShifts() {
    const shiftsRef = collection(db, "shifts");
    const snap = await getDocs(shiftsRef);
    return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));
}

// Lấy lịch làm việc của một nhân viên
export async function getScheduleByUserId(userId: string) {
    const userRef = getUserRef(userId);
    const schedulesRef = collection(db, "schedules");
    const q = query(schedulesRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            user_id: data.user_id?.id || userId,
        };
    });
}

// Lấy lịch làm việc theo tuần
export async function getScheduleByWeek(userId: string, startDate: string, endDate: string) {
    const userRef = getUserRef(userId);
    const schedulesRef = collection(db, "schedules");
    // Query đơn giản hơn - chỉ filter theo user_id, sau đó filter date ở client
    const q = query(schedulesRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    return snap.docs
        .map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                user_id: data.user_id?.id || userId,
            } as any;
        })
        .filter((s: any) => s.date >= startDate && s.date <= endDate);
}

// Tạo lịch làm việc mới
export async function createSchedule(data: {
    user_id: string;
    date: string;
    shift_type: string;
    start_time: string;
    end_time: string;
}) {
    const userRef = getUserRef(data.user_id);
    const schedulesRef = collection(db, "schedules");
    const docRef = await addDoc(schedulesRef, {
        ...data,
        user_id: userRef,
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

// Ca cố định (legacy support)
const SHIFT_TIMES: Record<string, { start: string; end: string }> = {
    morning: { start: "07:00", end: "12:00" },
    afternoon: { start: "12:00", end: "18:00" },
    evening: { start: "18:00", end: "23:00" },
};

// Lấy đăng ký lịch làm theo tuần
export async function getScheduleRequests(userId: string, startDate: string, endDate: string) {
    const userRef = getUserRef(userId);
    const ref = collection(db, "schedule_requests");
    // Query đơn giản - chỉ filter theo user_id, sau đó filter date ở client
    const q = query(ref, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    return snap.docs
        .map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                user_id: data.user_id?.id || userId,
            } as any;
        })
        .filter((r: any) => r.date >= startDate && r.date <= endDate);
}

// Interface cho ca linh hoạt
interface FlexibleSlot {
    start_time: string;
    end_time: string;
}

// Gửi đăng ký lịch làm cho cả tuần (hỗ trợ cả ca cố định và ca linh hoạt)
export async function submitScheduleRequest(
    userId: string, 
    weekData: { date: string; shifts?: string[]; slots?: FlexibleSlot[] }[]
) {
    const userRef = getUserRef(userId);
    const ref = collection(db, "schedule_requests");

    // Xóa các request cũ của tuần này (chỉ xóa pending) - query đơn giản hơn
    const dates = weekData.map(d => d.date);
    if (dates.length > 0) {
        // Query chỉ theo user_id, filter ở client
        const oldQ = query(ref, where("user_id", "==", userRef));
        const oldSnap = await getDocs(oldQ);
        for (const d of oldSnap.docs) {
            const data = d.data();
            // Chỉ xóa pending requests trong khoảng ngày
            if (data.status === "pending" && data.date >= dates[0] && data.date <= dates[dates.length - 1]) {
                await deleteDoc(d.ref);
            }
        }
    }

    // Tạo mới
    const created: any[] = [];
    for (const day of weekData) {
        // Hỗ trợ ca linh hoạt (slots)
        if (day.slots && day.slots.length > 0) {
            for (const slot of day.slots) {
                const docRef = await addDoc(ref, {
                    user_id: userRef,
                    date: day.date,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    status: "pending",
                    created_at: Timestamp.now(),
                });
                created.push({ 
                    id: docRef.id, 
                    date: day.date, 
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    status: "pending" 
                });
            }
        }
        // Legacy: hỗ trợ ca cố định (shifts)
        else if (day.shifts && day.shifts.length > 0) {
            for (const shift of day.shifts) {
                const times = SHIFT_TIMES[shift];
                if (!times) continue;
                const docRef = await addDoc(ref, {
                    user_id: userRef,
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
    }
    return created;
}

// ===== MANAGER: Quản lý lịch làm =====

// Lấy tất cả đăng ký theo tuần (tất cả nhân viên)
export async function getAllScheduleRequestsByWeek(startDate: string, endDate: string) {
    const ref = collection(db, "schedule_requests");
    // Lấy tất cả, filter ở client
    const snap = await getDocs(ref);
    return snap.docs
        .map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                user_id: data.user_id?.id || data.user_id,
            } as any;
        })
        .filter((r: any) => r.date >= startDate && r.date <= endDate);
}

// Lấy tất cả lịch đã xếp theo tuần (tất cả nhân viên)
export async function getAllSchedulesByWeek(startDate: string, endDate: string) {
    const ref = collection(db, "schedules");
    // Lấy tất cả, filter ở client
    const snap = await getDocs(ref);
    return snap.docs
        .map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                user_id: data.user_id?.id || data.user_id,
            } as any;
        })
        .filter((s: any) => s.date >= startDate && s.date <= endDate);
}

// Duyệt đăng ký -> tạo schedule + cập nhật request status
export async function approveScheduleRequest(requestId: string) {
    const reqRef = doc(db, "schedule_requests", requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found");

    const reqData = reqSnap.data();
    const userRef = reqData.user_id; // Already a reference

    // Kiểm tra đã có schedule trùng chưa - query đơn giản hơn
    const schedRef = collection(db, "schedules");
    const q = query(schedRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => {
        const data = d.data();
        return data.date === reqData.date && 
               data.start_time === reqData.start_time && 
               data.end_time === reqData.end_time;
    });
    
    if (existing) {
        await updateDoc(reqRef, { status: "approved", updated_at: Timestamp.now() });
        return { id: existing.id };
    }

    // Tạo schedule mới
    const docRef = await addDoc(schedRef, {
        user_id: userRef,
        date: reqData.date,
        start_time: reqData.start_time,
        end_time: reqData.end_time,
        status: "scheduled",
        created_at: Timestamp.now(),
    });

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
    for (const reqId of requestIds) {
        try {
            const result = await approveScheduleRequest(reqId);
            results.push({ id: reqId, success: true, scheduleId: result.id });
        } catch (err: any) {
            results.push({ id: reqId, success: false, error: err.message });
        }
    }
    return results;
}

// Manager tự xếp ca (không cần request) - hỗ trợ ca linh hoạt
export async function assignSchedule(data: {
    user_id: string;
    date: string;
    shift_type?: string;
    start_time?: string;
    end_time?: string;
}) {
    let startTime = data.start_time;
    let endTime = data.end_time;

    // Legacy: nếu có shift_type thì dùng giờ cố định
    if (data.shift_type && !startTime) {
        const times = SHIFT_TIMES[data.shift_type];
        if (!times) throw new Error("Invalid shift type");
        startTime = times.start;
        endTime = times.end;
    }

    if (!startTime || !endTime) throw new Error("Missing start_time or end_time");

    const userRef = getUserRef(data.user_id);

    // Kiểm tra trùng - query đơn giản hơn
    const schedRef = collection(db, "schedules");
    const q = query(schedRef, where("user_id", "==", userRef));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => {
        const docData = d.data();
        return docData.date === data.date && 
               docData.start_time === startTime && 
               docData.end_time === endTime;
    });
    
    if (existing) throw new Error("Schedule already exists");

    const docRef = await addDoc(schedRef, {
        user_id: userRef,
        date: data.date,
        start_time: startTime,
        end_time: endTime,
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


// ===== NOTIFICATION FUNCTIONS =====

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

async function sendEmail(to: string, subject: string, html: string) {
    await transporter.sendMail({
        from: `"Sunday Basic" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    });
}

// Gửi thông báo lịch làm cho tất cả nhân viên
export async function sendScheduleNotification(startDate: string, endDate: string) {
    // Lấy tất cả schedules trong tuần
    const schedRef = collection(db, "schedules");
    const snap = await getDocs(schedRef);
    const weekSchedules = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(s => s.date >= startDate && s.date <= endDate);

    // Group by user
    const schedulesByUser: Record<string, any[]> = {};
    for (const sched of weekSchedules) {
        const userId = sched.user_id?.id || sched.user_id;
        if (!schedulesByUser[userId]) schedulesByUser[userId] = [];
        schedulesByUser[userId].push(sched);
    }

    // Lấy thông tin users
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const usersMap: Record<string, any> = {};
    usersSnap.docs.forEach(d => {
        usersMap[d.id] = { id: d.id, ...d.data() };
    });

    let sentCount = 0;
    const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    for (const [userId, userSchedules] of Object.entries(schedulesByUser)) {
        const user = usersMap[userId];
        if (!user?.email) continue;

        // Sort by date
        userSchedules.sort((a, b) => a.date.localeCompare(b.date));

        // Build schedule table
        let scheduleHtml = userSchedules.map(s => {
            const date = new Date(s.date);
            const dayName = DAY_NAMES[date.getDay()];
            return `<tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${dayName}, ${date.getDate()}/${date.getMonth() + 1}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #009099;">${s.start_time} - ${s.end_time}</td>
            </tr>`;
        }).join("");

        const totalHours = userSchedules.reduce((sum, s) => {
            const [sh] = s.start_time.split(":").map(Number);
            const [eh] = s.end_time.split(":").map(Number);
            return sum + (eh - sh);
        }, 0);

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #009099, #00b4b4); padding: 20px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📅 Lịch làm việc tuần mới</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="color: #475569; margin-bottom: 20px;">Xin chào <strong>${user.first_name} ${user.last_name}</strong>,</p>
                    <p style="color: #475569; margin-bottom: 20px;">Dưới đây là lịch làm việc của bạn trong tuần từ <strong>${startDate}</strong> đến <strong>${endDate}</strong>:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background: #009099; color: white;">
                                <th style="padding: 10px; text-align: left;">Ngày</th>
                                <th style="padding: 10px; text-align: center;">Ca làm</th>
                            </tr>
                        </thead>
                        <tbody style="background: white;">
                            ${scheduleHtml}
                        </tbody>
                    </table>
                    
                    <div style="background: #009099; color: white; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                        <strong>Tổng: ${userSchedules.length} ca • ${totalHours} giờ</strong>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">Vui lòng đến đúng giờ và liên hệ quản lý nếu có thay đổi.</p>
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Trân trọng,<br><strong>Sunday Basic</strong></p>
                </div>
            </div>
        `;

        try {
            await sendEmail(
                user.email,
                `📅 Lịch làm việc tuần ${startDate} - ${endDate}`,
                emailHtml
            );
            sentCount++;
        } catch (err) {
            console.error(`Failed to send email to ${user.email}:`, err);
        }
    }

    return { sentCount, totalUsers: Object.keys(schedulesByUser).length };
}

// Gửi nhắc nhở đăng ký ca
export async function sendRegistrationReminder(startDate: string, endDate: string) {
    // Lấy tất cả staff users
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const staffUsers = usersSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(u => u.roleKey === "staff" && u.email);

    let sentCount = 0;

    for (const user of staffUsers) {
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b, #fbbf24); padding: 20px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Nhắc nhở đăng ký ca làm</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="color: #475569; margin-bottom: 20px;">Xin chào <strong>${user.first_name} ${user.last_name}</strong>,</p>
                    <p style="color: #475569; margin-bottom: 20px;">Đây là nhắc nhở để bạn đăng ký ca làm việc cho tuần từ <strong>${startDate}</strong> đến <strong>${endDate}</strong>.</p>
                    
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #92400e; margin: 0; font-weight: bold;">⏰ Hạn đăng ký: Chủ nhật tuần này</p>
                    </div>
                    
                    <p style="color: #475569; margin-bottom: 20px;">Vui lòng truy cập ứng dụng để đăng ký ca làm việc phù hợp với lịch của bạn.</p>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Trân trọng,<br><strong>Sunday Basic</strong></p>
                </div>
            </div>
        `;

        try {
            await sendEmail(
                user.email,
                `🔔 Nhắc nhở đăng ký ca làm tuần ${startDate} - ${endDate}`,
                emailHtml
            );
            sentCount++;
        } catch (err) {
            console.error(`Failed to send reminder to ${user.email}:`, err);
        }
    }

    return { sentCount, totalUsers: staffUsers.length };
}
