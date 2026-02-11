import { Router } from "express";
import {
    getAttendanceByUserId,
    getTodayAttendance,
    getTodaySchedule,
    checkIn,
    checkOut,
    getAttendanceStats,
    getWeeklyStats,
    getOnTimeStreak,
    getOnTimeRanking,
    getMonthComparison
} from "../servers/attendance/attendance.service";

const router = Router();

// Lấy lịch sử chấm công của nhân viên
router.get("/attendance/:userId", async (req, res) => {
    try {
        const data = await getAttendanceByUserId(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy chấm công hôm nay
router.get("/attendance/:userId/today", async (req, res) => {
    try {
        const data = await getTodayAttendance(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lịch làm việc hôm nay
router.get("/attendance/:userId/schedule-today", async (req, res) => {
    try {
        const data = await getTodaySchedule(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Check-in
router.post("/attendance/check-in", async (req, res) => {
    try {
        const { userId, scheduleId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }
        const data = await checkIn(userId, scheduleId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Check-out
router.post("/attendance/check-out", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }
        const data = await checkOut(userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Lấy thống kê chấm công theo tháng
router.get("/attendance/:userId/stats", async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const m = month ? parseInt(month as string) : currentDate.getMonth() + 1;
        const y = year ? parseInt(year as string) : currentDate.getFullYear();
        const data = await getAttendanceStats(req.params.userId, m, y);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy thống kê theo tuần (cho biểu đồ)
router.get("/attendance/:userId/weekly", async (req, res) => {
    try {
        const { weeks } = req.query;
        const weeksBack = weeks ? parseInt(weeks as string) : 4;
        const data = await getWeeklyStats(req.params.userId, weeksBack);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy streak đúng giờ
router.get("/attendance/:userId/streak", async (req, res) => {
    try {
        const streak = await getOnTimeStreak(req.params.userId);
        res.json({ success: true, data: { streak } });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy ranking đúng giờ
router.get("/attendance-ranking", async (_req, res) => {
    try {
        const data = await getOnTimeRanking();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// So sánh với tháng trước
router.get("/attendance/:userId/comparison", async (req, res) => {
    try {
        const data = await getMonthComparison(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
