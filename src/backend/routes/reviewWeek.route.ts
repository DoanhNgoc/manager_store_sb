import { Router } from "express";
import { createReviewWeek, deleteReviewWeek, getAllReviewWeeks, getReviewsByUserId } from "../servers/review_week/reviewWeek.service";


const router = Router();

/* TEST */
router.get("/test", (_req, res) => {
    res.json({ success: true, message: "ReviewWeek route OK" });
});

/* GET ALL */
router.get("/review-weeks", async (_req, res) => {
    try {
        const data = await getAllReviewWeeks();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* GET BY USER ID (cho Staff) */
router.get("/review-weeks/user/:userId", async (req, res) => {
    try {
        console.log("Fetching reviews for userId:", req.params.userId);
        const data = await getReviewsByUserId(req.params.userId);
        console.log("Found reviews:", data.length);
        res.json({ success: true, data });
    } catch (err: any) {
        console.error("Error fetching reviews by user:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* CREATE */
router.post("/review-weeks", async (req, res) => {
    try {
        const result = await createReviewWeek(req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* DELETE */
router.delete("/review-weeks/:id", async (req, res) => {
    try {
        await deleteReviewWeek(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
