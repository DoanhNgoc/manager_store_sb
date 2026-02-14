import { adminDb } from "../../firebase/admin/firebaseAdmin";
import admin from "firebase-admin";

/* ===== GET ALL ===== */
export async function getAllReviewWeeks() {
    const snapshot = await adminDb
        .collection("review_week")
        .orderBy("created_at", "desc")
        .get();

    const reviews = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Populate user_create
            let userCreate = null;
            if (data.user_create) {
                const userSnap = await data.user_create.get();
                if (userSnap.exists) {
                    userCreate = { id: userSnap.id, ...userSnap.data() };
                }
            }
            
            // Populate user_review
            let userReview = null;
            if (data.user_review) {
                const userSnap = await data.user_review.get();
                if (userSnap.exists) {
                    userReview = { id: userSnap.id, ...userSnap.data() };
                }
            }
            
            return {
                id: doc.id,
                ...data,
                user_create: userCreate,
                user_review: userReview,
            };
        })
    );

    return reviews;
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

/* ===== GET BY USER (cho Staff xem đánh giá của mình) ===== */
export async function getReviewsByUserId(userId: string) {
    const userRef = adminDb.doc(`users/${userId}`);
    
    // Query chỉ với where, sort trong memory để tránh cần composite index
    const snapshot = await adminDb
        .collection("review_week")
        .where("user_review", "==", userRef)
        .get();

    const reviews = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Populate user_create
            let userCreate = null;
            if (data.user_create) {
                try {
                    const userSnap = await data.user_create.get();
                    if (userSnap.exists) {
                        userCreate = { id: userSnap.id, ...userSnap.data() };
                    }
                } catch (e) {
                    console.error("Error populating user_create:", e);
                }
            }
            
            return {
                id: doc.id,
                ...data,
                user_create: userCreate,
                user_review: { id: userId },
            };
        })
    );

    // Sort by created_at descending in memory
    return reviews.sort((a: any, b: any) => {
        const aTime = a.created_at?._seconds || a.created_at?.seconds || 0;
        const bTime = b.created_at?._seconds || b.created_at?.seconds || 0;
        return bTime - aTime;
    });
}
