import { adminDb } from "../../firebase/admin/firebaseAdmin";
import admin from "firebase-admin";

/* ===== GET ALL ===== */
export async function getAllReviewWeeks() {
    const snapshot = await adminDb
        .collection("review_week")
        .orderBy("created_at", "desc")
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

/* ===== CREATE ===== */
export async function createReviewWeek(data: {
    content: string;
    rating: number;
    start_week: string; // yyyy-mm-dd
    end_week: string;   // yyyy-mm-dd
    user_create: string; // uid
    user_review: string; // uid
}) {
    const docRef = await adminDb.collection("review_week").add({
        content: data.content,
        rating: data.rating,
        start_week: new Date(data.start_week),
        end_week: new Date(data.end_week),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        user_create: adminDb.doc(`users/${data.user_create}`),
        user_review: adminDb.doc(`users/${data.user_review}`),
    });

    return { id: docRef.id };
}

/* ===== DELETE ===== */
export async function deleteReviewWeek(id: string) {
    await adminDb.collection("review_week").doc(id).delete();
    return { success: true };
}
