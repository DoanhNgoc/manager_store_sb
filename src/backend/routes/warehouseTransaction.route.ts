import { Router } from "express";
import { createWarehouseTransaction, getAllWarehouseTransactions } from "../servers/warehouse/products/warehouseTransaction.service";


const router = Router();

router.post("/warehouse-transactions", async (req, res) => {
    try {
        const result = await createWarehouseTransaction(req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        console.error("🔥 CREATE TRANSACTION ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message ?? "Internal server error",
        });
    }
});

/* ================= GET ALL HISTORY ================= */
router.get("/warehouse-transactions", async (_req, res) => {
    try {
        const data = await getAllWarehouseTransactions();
        res.json({ success: true, data });
    } catch (err: any) {
        console.error("🔥 GET TRANSACTIONS ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message ?? "Internal server error",
        });
    }
});

export default router;
