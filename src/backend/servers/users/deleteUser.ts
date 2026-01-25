import { adminAuth, adminDb } from "../../firebase/admin/firebaseAdmin";

export async function deleteUserByAdmin(uid: string) {
    // 1. Xóa auth
    await adminAuth.deleteUser(uid);

    // 2. Xóa firestore users/{uid}
    await adminDb.collection("users").doc(uid).delete();

    return { success: true };
}
