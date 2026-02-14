import { Router } from "express";
import {
    getNotificationsForUser,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getAllNotifications,
    deleteNotification,
    sendScheduleReminder,
    sendSchedulePublished,
    createNotification,
    notifyScheduleRequest,
    notifyInventorySubmit
} from "../servers/notification/notification.service";

const router = Router();

// Lấy thông báo cho user (cần truyền role qua query)
router.get("/notifications/:userId", async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) return res.status(400).json({ success: false, message: "Missing role" });
        const data = await getNotificationsForUser(req.params.userId, role as string);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy số thông báo chưa đọc
router.get("/notifications/:userId/unread-count", async (req, res) => {
    try {
        const { role } = req.query;
        if (!role) return res.status(400).json({ success: false, message: "Missing role" });
        const count = await getUnreadCount(req.params.userId, role as string);
        res.json({ success: true, count });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Đánh dấu đã đọc
router.post("/notifications/:id/read", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
        await markAsRead(req.params.id, userId);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Đánh dấu tất cả đã đọc
router.post("/notifications/mark-all-read", async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (!userId || !role) return res.status(400).json({ success: false, message: "Missing userId or role" });
        await markAllAsRead(userId, role);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== ADMIN ROUTES =====

// Lấy tất cả thông báo
router.get("/admin/notifications", async (_req, res) => {
    try {
        const data = await getAllNotifications();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Tạo thông báo mới
router.post("/admin/notifications", async (req, res) => {
    try {
        const data = await createNotification(req.body);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Xóa thông báo
router.delete("/admin/notifications/:id", async (req, res) => {
    try {
        await deleteNotification(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Gửi nhắc nhở đăng ký ca (Manager -> Staff)
router.post("/admin/notifications/schedule-reminder", async (req, res) => {
    try {
        const { weekStart, weekEnd, createdBy } = req.body;
        if (!weekStart || !weekEnd || !createdBy) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await sendScheduleReminder(weekStart, weekEnd, createdBy);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Gửi thông báo lịch làm (Manager -> Staff)
router.post("/admin/notifications/schedule-published", async (req, res) => {
    try {
        const { weekStart, weekEnd, createdBy } = req.body;
        if (!weekStart || !weekEnd || !createdBy) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await sendSchedulePublished(weekStart, weekEnd, createdBy);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Thông báo đăng ký ca mới (Staff -> Manager)
router.post("/notifications/schedule-request", async (req, res) => {
    try {
        const { staffName, weekStart, weekEnd, slotCount } = req.body;
        if (!staffName || !weekStart || !weekEnd) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await notifyScheduleRequest(staffName, weekStart, weekEnd, slotCount || 1);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Thông báo gửi phiếu kiểm kê (Staff -> Manager)
router.post("/notifications/inventory-submit", async (req, res) => {
    try {
        const { staffName, checkCode, totalProducts, diffCount } = req.body;
        if (!staffName || !checkCode) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await notifyInventorySubmit(staffName, checkCode, totalProducts || 0, diffCount || 0);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
