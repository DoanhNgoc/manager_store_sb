import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDDuxM5K8goU80ZdGfy0AxWk4G9U5XZ6zA",
    authDomain: "manager-store-4ce1d.firebaseapp.com",
    projectId: "manager-store-4ce1d",
    storageBucket: "manager-store-4ce1d.firebasestorage.app",
    messagingSenderId: "908905830839",
    appId: "1:908905830839:web:285ef8241c7db45f2d3032",
    measurementId: "G-SXG1HEE6L6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators if USE_EMULATOR is true
// Works for both Node.js (process.env) and Vite (import.meta.env)
const useEmulator = typeof process !== 'undefined' && process.env?.USE_EMULATOR === "true";

if (useEmulator) {
    console.log("🔧 Using Firebase Emulators (Client SDK)");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099");
    connectStorageEmulator(storage, "localhost", 9199);
}
