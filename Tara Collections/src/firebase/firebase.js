import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaNA_shAuRwe2-gWY33k8gGsBI_-NtYi4",
  authDomain: "tara-collections.firebaseapp.com",
  projectId: "tara-collections",
  storageBucket: "tara-collections.firebasestorage.app",
  messagingSenderId: "615628058237",
  appId: "1:615628058237:web:2fa38c6c6907dbfd434b14"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;