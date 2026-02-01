import { Router } from "express";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../servers/warehouse/categories/category.service";

const router = Router();

router.get("/categories", async (_req, res) => {
    const data = await getAllCategories();
    res.json({ success: true, data });
});

router.post("/categories", async (req, res) => {
    const result = await createCategory(req.body);
    res.json({ success: true, data: result });
});

router.put("/categories/:id", async (req, res) => {
    await updateCategory(req.params.id, req.body);
    res.json({ success: true });
});

router.delete("/categories/:id", async (req, res) => {
    console.log("🔥 DELETE ROUTE HIT");
    console.log("🔥 ID =", req.params.id);
    await deleteCategory(req.params.id)
    res.json({ success: true, id: req.params.id });
});

export default router;
