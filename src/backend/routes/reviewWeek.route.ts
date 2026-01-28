import { Router } from "express";
import { createReviewWeek, deleteReviewWeek, getAllReviewWeeks } from "../servers/review_week/reviewWeek.service";


const router = Router();

/* TEST */
router.get("/test", (_req, res) => {
    res.json({ success: true, message: "ReviewWeek route OK" });
});

/* GET ALL */
router.get("/review-week", async (_req, res) => {
    try {
        const data = await getAllReviewWeeks();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* CREATE */
router.post("/review-week", async (req, res) => {
    try {
        const result = await createReviewWeek(req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* DELETE */
router.delete("/review-week/:id", async (req, res) => {
    try {
        await deleteReviewWeek(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
