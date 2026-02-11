import { Router } from "express";
import {
    getAllShifts,
    getScheduleByUserId,
    getScheduleByWeek,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleRequests,
    submitScheduleRequest,
    getAllScheduleRequestsByWeek,
    getAllSchedulesByWeek,
    approveScheduleRequest,
    rejectScheduleRequest,
    approveMultipleRequests,
    assignSchedule,
    removeSchedule
} from "../servers/schedule/schedule.service";

const router = Router();

// Lấy tất cả ca làm việc
router.get("/shifts", async (_req, res) => {
    try {
        const data = await getAllShifts();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lịch làm việc của nhân viên
router.get("/schedules/:userId", async (req, res) => {
    try {
        const data = await getScheduleByUserId(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lịch làm việc theo tuần
router.get("/schedules/:userId/week", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing startDate or endDate" });
        }
        const data = await getScheduleByWeek(
            req.params.userId,
            startDate as string,
            endDate as string
        );
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Tạo lịch làm việc mới
router.post("/schedules", async (req, res) => {
    try {
        const data = await createSchedule(req.body);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Cập nhật lịch làm việc
router.put("/schedules/:id", async (req, res) => {
    try {
        await updateSchedule(req.params.id, req.body);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Xóa lịch làm việc
router.delete("/schedules/:id", async (req, res) => {
    try {
        await deleteSchedule(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy đăng ký lịch làm theo tuần
router.get("/schedule-requests/:userId", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing startDate or endDate" });
        }
        const data = await getScheduleRequests(req.params.userId, startDate as string, endDate as string);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Gửi đăng ký lịch làm
router.post("/schedule-requests", async (req, res) => {
    try {
        const { userId, weekData } = req.body;
        if (!userId || !weekData) {
            return res.status(400).json({ success: false, message: "Missing userId or weekData" });
        }
        const data = await submitScheduleRequest(userId, weekData);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== MANAGER ROUTES =====

// Lấy tất cả đăng ký theo tuần (tất cả nhân viên)
router.get("/admin/schedule-requests", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing startDate or endDate" });
        }
        const data = await getAllScheduleRequestsByWeek(startDate as string, endDate as string);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy tất cả lịch đã xếp theo tuần
router.get("/admin/schedules", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing startDate or endDate" });
        }
        const data = await getAllSchedulesByWeek(startDate as string, endDate as string);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Duyệt đăng ký
router.post("/admin/schedule-requests/:id/approve", async (req, res) => {
    try {
        const data = await approveScheduleRequest(req.params.id);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Từ chối đăng ký
router.post("/admin/schedule-requests/:id/reject", async (req, res) => {
    try {
        await rejectScheduleRequest(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Duyệt hàng loạt
router.post("/admin/schedule-requests/approve-bulk", async (req, res) => {
    try {
        const { requestIds } = req.body;
        if (!requestIds || !Array.isArray(requestIds)) {
            return res.status(400).json({ success: false, message: "Missing requestIds" });
        }
        const data = await approveMultipleRequests(requestIds);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Manager tự xếp ca
router.post("/admin/schedules/assign", async (req, res) => {
    try {
        const data = await assignSchedule(req.body);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Manager xóa ca
router.delete("/admin/schedules/:id", async (req, res) => {
    try {
        await removeSchedule(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
