import { Router } from "express";
import { deleteUserByAdmin } from "../servers/users/deleteUser";
import { createUserByAdmin } from "../servers/users/createUser";

const router = Router();

/* TEST */
router.get("/test", (_req, res) => {
    res.json({ success: true, message: "User route OK" });
});

/* DELETE USER */
router.post("/delete-user", async (req, res) => {
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

/* CREATE USER */
router.post("/create-user", async (req, res) => {
    try {
        const result = await createUserByAdmin(req.body);
        res.json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
