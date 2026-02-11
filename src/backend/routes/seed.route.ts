import { Router } from "express";
import { collection, addDoc, getDocs, Timestamp, query, where } from "firebase/firestore";
import { db } from "../firebase/client/firebaseClient";

const router = Router();

// Lấy danh sách tất cả users
router.get("/users", async (_req, res) => {
    try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(usersRef);
        const users = snap.docs.map(doc => ({
            uid: doc.id,
            ...doc.data(),
            roleKey: doc.data().role_id?.id ?? null
        }));
        res.json({ success: true, data: users });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Seed data mẫu cho một user
router.post("/seed/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        const results = {
            schedules: 0,
            attendance: 0,
            salaries: 0
        };

        // 1. Seed Schedules (Lịch làm việc tuần này và tuần sau)
        const schedulesRef = collection(db, "schedules");
        const today = new Date();
        const scheduleData = [
            { dayOffset: 0, shift_type: "morning", start_time: "06:00", end_time: "14:00" },
            { dayOffset: 1, shift_type: "afternoon", start_time: "14:00", end_time: "22:00" },
            { dayOffset: 2, shift_type: "morning", start_time: "06:00", end_time: "14:00" },
            { dayOffset: 4, shift_type: "morning", start_time: "06:00", end_time: "14:00" },
            { dayOffset: 5, shift_type: "afternoon", start_time: "14:00", end_time: "22:00" },
            { dayOffset: 7, shift_type: "morning", start_time: "06:00", end_time: "14:00" },
            { dayOffset: 8, shift_type: "morning", start_time: "06:00", end_time: "14:00" },
            { dayOffset: 9, shift_type: "afternoon", start_time: "14:00", end_time: "22:00" },
        ];

        for (const schedule of scheduleData) {
            const date = new Date(today);
            date.setDate(today.getDate() + schedule.dayOffset);
            const dateStr = date.toISOString().split('T')[0];

            // Kiểm tra đã có chưa
            const existingQuery = query(schedulesRef, where("user_id", "==", userId), where("date", "==", dateStr));
            const existingSnap = await getDocs(existingQuery);
            
            if (existingSnap.empty) {
                await addDoc(schedulesRef, {
                    user_id: userId,
                    date: dateStr,
                    shift_type: schedule.shift_type,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    status: "scheduled",
                    created_at: Timestamp.now()
                });
                results.schedules++;
            }
        }

        // 2. Seed Attendance (Lịch sử chấm công 10 ngày gần đây)
        const attendanceRef = collection(db, "attendance");
        const attendanceData = [
            { dayOffset: -1, check_in: "06:02", check_out: "14:05", status: "on_time", work_hours: 8 },
            { dayOffset: -2, check_in: "14:15", check_out: "22:00", status: "late", work_hours: 7.75 },
            { dayOffset: -3, check_in: "06:00", check_out: "13:30", status: "early_leave", work_hours: 7.5 },
            { dayOffset: -5, check_in: "06:05", check_out: "14:00", status: "on_time", work_hours: 7.92 },
            { dayOffset: -6, check_in: "06:00", check_out: "14:10", status: "on_time", work_hours: 8.17 },
            { dayOffset: -7, check_in: "14:00", check_out: "22:05", status: "on_time", work_hours: 8.08 },
            { dayOffset: -8, check_in: "06:10", check_out: "14:00", status: "late", work_hours: 7.83 },
            { dayOffset: -9, check_in: "06:00", check_out: "14:00", status: "on_time", work_hours: 8 },
            { dayOffset: -12, check_in: "06:00", check_out: "14:00", status: "on_time", work_hours: 8 },
            { dayOffset: -13, check_in: "14:05", check_out: "22:00", status: "on_time", work_hours: 7.92 },
        ];

        for (const att of attendanceData) {
            const date = new Date(today);
            date.setDate(today.getDate() + att.dayOffset);
            const dateStr = date.toISOString().split('T')[0];

            // Kiểm tra đã có chưa
            const existingQuery = query(attendanceRef, where("user_id", "==", userId), where("date", "==", dateStr));
            const existingSnap = await getDocs(existingQuery);
            
            if (existingSnap.empty) {
                await addDoc(attendanceRef, {
                    user_id: userId,
                    date: dateStr,
                    check_in: att.check_in,
                    check_out: att.check_out,
                    shift_type: att.check_in.startsWith("06") ? "Ca sáng" : "Ca chiều",
                    status: att.status,
                    work_hours: att.work_hours,
                    created_at: Timestamp.now()
                });
                results.attendance++;
            }
        }

        // 3. Seed Salaries (3 tháng gần đây)
        const salariesRef = collection(db, "salaries");
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const salaryData = [
            { 
                month: currentMonth, 
                year: currentYear, 
                base_salary: 8000000, 
                work_days: 10, 
                total_days: 22,
                overtime_hours: 12, 
                overtime_pay: 600000, 
                bonus: 500000, 
                deductions: 200000, 
                total_salary: 8900000, 
                status: "pending" 
            },
            { 
                month: currentMonth - 1 > 0 ? currentMonth - 1 : 12, 
                year: currentMonth - 1 > 0 ? currentYear : currentYear - 1, 
                base_salary: 8000000, 
                work_days: 22, 
                total_days: 22,
                overtime_hours: 8, 
                overtime_pay: 400000, 
                bonus: 1000000, 
                deductions: 150000, 
                total_salary: 9250000, 
                status: "paid",
                paid_date: "2025-02-05"
            },
            { 
                month: currentMonth - 2 > 0 ? currentMonth - 2 : 12 + (currentMonth - 2), 
                year: currentMonth - 2 > 0 ? currentYear : currentYear - 1, 
                base_salary: 8000000, 
                work_days: 20, 
                total_days: 22,
                overtime_hours: 16, 
                overtime_pay: 800000, 
                bonus: 2000000, 
                deductions: 100000, 
                total_salary: 10700000, 
                status: "paid",
                paid_date: "2025-01-05"
            },
        ];

        for (const salary of salaryData) {
            // Kiểm tra đã có chưa
            const existingQuery = query(
                salariesRef, 
                where("user_id", "==", userId), 
                where("month", "==", salary.month),
                where("year", "==", salary.year)
            );
            const existingSnap = await getDocs(existingQuery);
            
            if (existingSnap.empty) {
                await addDoc(salariesRef, {
                    user_id: userId,
                    ...salary,
                    created_at: Timestamp.now()
                });
                results.salaries++;
            }
        }

        res.json({ 
            success: true, 
            message: "Seed data thành công!",
            data: results 
        });

    } catch (err: any) {
        console.error("Seed error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
