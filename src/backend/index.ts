import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import { deleteUserByAdmin } from "./servers/deleteUser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/delete-user", async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ success: false, message: "Missing uid" });
    }

    try {
        await deleteUserByAdmin(uid);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(3001, () => {
    console.log("Server running at http://localhost:3001");
});
