import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/user.route";

const app = express();

app.use(cors());
app.use(express.json());

/* gắn route */
app.use("/api", userRoutes);

/* test sống */
app.get("/ping", (_req, res) => {
    res.json({ success: true, message: "Server alive" });
});

app.listen(3001, () => {
    console.log("🚀 Backend running at http://localhost:3001");
});
