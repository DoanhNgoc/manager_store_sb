import express from "express";
import cors from "cors";
import "dotenv/config";

import userRoutes from "./routes/user.route";
import reviewWeekRoutes from "./routes/reviewWeek.route";
import categoryRoutes from "./routes/category.route";
import productRoutes from "./routes/product.route";
import warehouseTransaction from "./routes/warehouseTransaction.route";
const app = express();

app.use(cors());
app.use(express.json());

/* gắn route */
app.use("/api", userRoutes);
app.use("/api", reviewWeekRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes)
app.use('/api', warehouseTransaction)

/* test sống */
app.get("/ping", (_req, res) => {
    res.json({ success: true, message: "Server alive" });
});

app.listen(3001, () => {
    console.log("🚀 Backend running at http://localhost:3001");
});
