import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDyy2mlfaJSuEwZkPedP7abALF0WG-nk90",
    authDomain: "alberto-imoveis-2025.firebaseapp.com",
    projectId: "alberto-imoveis-2025",
    storageBucket: "alberto-imoveis-2025.firebasestorage.app",
    messagingSenderId: "934059138214",
    appId: "1:934059138214:web:1e23c532302d0b72d66867"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
