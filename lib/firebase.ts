import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFLJKvR00BAAUnOsD_zHtev19Adi69TKQ",
  authDomain: "zedxplay-5f18a.firebaseapp.com",
  databaseURL: "https://zedxplay-5f18a-default-rtdb.firebaseio.com",
  projectId: "zedxplay-5f18a",
  storageBucket: "zedxplay-5f18a.firebasestorage.app",
  messagingSenderId: "942728827571",
  appId: "1:942728827571:web:ef0f96fe1d66d71e5ed6c6",
  measurementId: "G-VMCNFZ8WMJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut };
