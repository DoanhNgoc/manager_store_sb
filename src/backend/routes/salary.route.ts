import { Router } from "express";
import {
    getSalaryByUserId,
    getSalaryByMonth,
    createSalary,
    updateSalaryStatus,
    calculateSalary,
    getAllSalaries
} from "../servers/salary/salary.service";

const router = Router();

// Lấy tất cả bảng lương (manager)
router.get("/salaries", async (_req, res) => {
    try {
        const data = await getAllSalaries();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lịch sử lương của nhân viên
router.get("/salaries/:userId", async (req, res) => {
    try {
        const data = await getSalaryByUserId(req.params.userId);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Lấy lương theo tháng cụ thể
router.get("/salaries/:userId/:year/:month", async (req, res) => {
    try {
        const { userId, year, month } = req.params;
        const data = await getSalaryByMonth(userId, parseInt(month), parseInt(year));
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Tạo bảng lương mới (manager)
router.post("/salaries", async (req, res) => {
    try {
        const data = await createSalary(req.body);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Cập nhật trạng thái lương
router.put("/salaries/:id/status", async (req, res) => {
    try {
        const { status, paidDate } = req.body;
        await updateSalaryStatus(req.params.id, status, paidDate);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Tính lương tự động dựa trên chấm công
router.post("/salaries/calculate", async (req, res) => {
    try {
        const { userId, month, year, baseSalary } = req.body;
        if (!userId || !month || !year || !baseSalary) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: userId, month, year, baseSalary" 
            });
        }
        const data = await calculateSalary(userId, month, year, baseSalary);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
