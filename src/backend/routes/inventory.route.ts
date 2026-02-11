import { Router } from "express";
import {
    createInventoryCheck,
    getInventoryCheckById,
    getInventoryChecksByUser,
    getAllInventoryChecks,
    updateInventoryItem,
    saveDraft,
    submitInventoryCheck,
    approveInventoryCheck,
    rejectInventoryCheck,
    getInventoryStats,
    getProductTransactionHistory,
    deleteInventoryCheck
} from "../servers/inventory/inventory.service";

const router = Router();

// Tạo phiếu kiểm kê mới
router.post("/inventory-checks", async (req, res) => {
    try {
        const { userId, title } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }
        const data = await createInventoryCheck(userId, title);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy phiếu kiểm kê theo ID
router.get("/inventory-checks/:id", async (req, res) => {
    try {
        const data = await getInventoryCheckById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phiếu kiểm kê" });
        }
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy danh sách phiếu kiểm kê của user
router.get("/inventory-checks/user/:userId", async (req, res) => {
    try {
        const data = await getInventoryChecksByUser(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy tất cả phiếu kiểm kê (cho Manager)
router.get("/inventory-checks", async (_req, res) => {
    try {
        const data = await getAllInventoryChecks();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Cập nhật item trong phiếu kiểm kê
router.put("/inventory-checks/:id/items/:productId", async (req, res) => {
    try {
        const { actual_quantity, note, reason } = req.body;
        const data = await updateInventoryItem(req.params.id, req.params.productId, {
            actual_quantity,
            note,
            reason
        });
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Lưu nháp
router.put("/inventory-checks/:id/draft", async (req, res) => {
    try {
        const { items } = req.body;
        const data = await saveDraft(req.params.id, items);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Xóa phiếu kiểm kê
router.delete("/inventory-checks/:id", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }
        const data = await deleteInventoryCheck(req.params.id, userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Gửi phiếu kiểm kê
router.post("/inventory-checks/:id/submit", async (req, res) => {
    try {
        const data = await submitInventoryCheck(req.params.id);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Duyệt phiếu kiểm kê
router.post("/inventory-checks/:id/approve", async (req, res) => {
    try {
        const { managerId } = req.body;
        if (!managerId) {
            return res.status(400).json({ success: false, message: "Missing managerId" });
        }
        const data = await approveInventoryCheck(req.params.id, managerId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Từ chối phiếu kiểm kê
router.post("/inventory-checks/:id/reject", async (req, res) => {
    try {
        const { managerId, reason } = req.body;
        if (!managerId || !reason) {
            return res.status(400).json({ success: false, message: "Missing managerId or reason" });
        }
        const data = await rejectInventoryCheck(req.params.id, managerId, reason);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Lấy thống kê kiểm kê
router.get("/inventory-stats", async (req, res) => {
    try {
        const { userId } = req.query;
        const data = await getInventoryStats(userId as string);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lịch sử nhập/xuất của sản phẩm
router.get("/products/:productId/transactions", async (req, res) => {
    try {
        const { limit } = req.query;
        const data = await getProductTransactionHistory(
            req.params.productId,
            limit ? parseInt(limit as string) : 10
        );
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
