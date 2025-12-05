import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBuTI1kxcmrbzo0qO5lc6WO34LR6eWZ2Xk",
    authDomain: "alternativa-service-2025.firebaseapp.com",
    projectId: "alternativa-service-2025",
    storageBucket: "alternativa-service-2025.firebasestorage.app",
    messagingSenderId: "683036588204",
    appId: "1:683036588204:web:12e2b2f2ecc6f9658e8709"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
