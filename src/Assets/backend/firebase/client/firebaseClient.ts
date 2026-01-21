// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDDuxM5K8goU80ZdGfy0AxWk4G9U5XZ6zA",
    authDomain: "manager-store-4ce1d.firebaseapp.com",
    projectId: "manager-store-4ce1d",
    storageBucket: "manager-store-4ce1d.firebasestorage.app",
    messagingSenderId: "908905830839",
    appId: "1:908905830839:web:285ef8241c7db45f2d3032",
    measurementId: "G-SXG1HEE6L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);