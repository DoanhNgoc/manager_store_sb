import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../servers/warehouse/products/product.service";


const router = Router();

router.get("/products", async (_req, res) => {
    const data = await getAllProducts();
    res.json({ success: true, data });
});

router.post("/products", async (req, res) => {
    const result = await createProduct(req.body);
    res.json({ success: true, data: result });
});

router.put("/products/:id", async (req, res) => {
    await updateProduct(req.params.id, req.body);
    res.json({ success: true });
});

router.delete("/products/:id", async (req, res) => {
    await deleteProduct(req.params.id);
    res.json({ success: true });
});

export default router;
