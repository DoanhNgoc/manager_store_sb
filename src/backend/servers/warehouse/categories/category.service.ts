import { adminDb } from "../../../firebase/admin/firebaseAdmin";
import admin from "firebase-admin";

/* GET ALL */
export async function getAllCategories() {
    const snap = await adminDb
        .collection("categories")
        .orderBy("created_at", "desc")
        .get();

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}


/* CREATE */
export async function createCategory(data: {
    code: string;
    name: string;
}) {
    const ref = await adminDb.collection("categories").add({
        code: data.code,
        name: data.name,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: ref.id };
}

/* UPDATE */
export async function updateCategory(
    id: string,
    data: { code?: string; name?: string }
) {
    await adminDb.collection("categories").doc(id).update(data);
    return { success: true };
}

/* DELETE */
export async function deleteCategory(id: string) {
    await adminDb.collection("categories").doc(id).delete();
    return { success: true };
}
