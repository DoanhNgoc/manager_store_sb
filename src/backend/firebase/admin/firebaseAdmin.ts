import admin from "firebase-admin";
import "dotenv/config";

if (
    !process.env.FB_PROJECT_ID ||
    !process.env.FB_CLIENT_EMAIL ||
    !process.env.FB_PRIVATE_KEY
) {
    throw new Error("❌ Missing Firebase Admin ENV");
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FB_PROJECT_ID,
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
