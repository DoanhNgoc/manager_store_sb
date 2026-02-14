import express from "express";
import cors from "cors";
import "dotenv/config";

import userRoutes from "./routes/user.route";
import reviewWeekRoutes from "./routes/reviewWeek.route";
import categoryRoutes from "./routes/category.route";
import productRoutes from "./routes/product.route";
import warehouseTransaction from "./routes/warehouseTransaction.route";
import scheduleRoutes from "./routes/schedule.route";
import attendanceRoutes from "./routes/attendance.route";
import salaryRoutes from "./routes/salary.route";
import seedRoutes from "./routes/seed.route";
import inventoryRoutes from "./routes/inventory.route";
import notificationRoutes from "./routes/notification.route";

const app = express();

app.use(cors());
app.use(express.json());

/* gắn route */
app.use("/api", userRoutes);
app.use("/api", reviewWeekRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', warehouseTransaction);
app.use('/api', scheduleRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', salaryRoutes);
app.use('/api', seedRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', notificationRoutes);

/* test sống */
app.get("/ping", (_req, res) => {
    res.json({ success: true, message: "Server alive" });
});

app.listen(3001, () => {
    console.log("🚀 Backend running at http://localhost:3001");
});
