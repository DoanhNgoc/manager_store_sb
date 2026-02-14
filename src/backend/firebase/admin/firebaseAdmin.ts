import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Load .env thủ công
const envPath = path.resolve(process.cwd(), ".env");
console.log("Looking for .env at:", envPath);
console.log("File exists:", fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    console.log("File content length:", envContent.length);
    console.log("First 200 chars:", envContent.substring(0, 200));
    envContent.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Bỏ dấu ngoặc kép nếu có
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

if (
    !process.env.FB_PROJECT_ID ||
    !process.env.FB_CLIENT_EMAIL ||
    !process.env.FB_PRIVATE_KEY
) {
    console.log("ENV loaded:", {
        FB_PROJECT_ID: process.env.FB_PROJECT_ID,
        FB_CLIENT_EMAIL: process.env.FB_CLIENT_EMAIL,
        FB_PRIVATE_KEY: process.env.FB_PRIVATE_KEY ? "exists" : "missing"
    });
    throw new Error("❌ Missing Firebase Admin ENV");
}

const useEmulator = process.env.USE_EMULATOR === "true";

if (!admin.apps.length) {
    if (useEmulator) {
        // Use emulator - no credentials needed
        process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
        admin.initializeApp({ projectId: process.env.FB_PROJECT_ID });
        console.log("🔧 Admin SDK connected to Emulators");
    } else {
        // Use production
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FB_PROJECT_ID,
                clientEmail: process.env.FB_CLIENT_EMAIL,
                privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
        console.log("🚀 Admin SDK connected to Production");
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
