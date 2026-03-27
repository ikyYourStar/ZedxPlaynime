import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

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

// Gembok inisialisasi Firebase biar gak double load
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

// FUNGSI GEMBOK SAKTI: Pastiin cuma jalan di Client/HP
const isNative = () => typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative;

// Inisialisasi Native Plugin
if (isNative()) {
  GoogleAuth.initialize({
    clientId: '942728827571-p9ih8fv6er1qa7sc6i57darcm450bk9q.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

export const signInWithGoogleNative = async () => {
  try {
    if (!isNative()) {
       throw new Error("Plugin Native cuma jalan di HP cuy.");
    }
    const googleUser = await GoogleAuth.signIn();
    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    console.error("Gagal Login Native:", error);
    throw error;
  }
};

export const signOutNative = async () => {
  try {
     if (isNative()) {
       await GoogleAuth.signOut();
     }
     await signOut(auth);
  } catch (error) {
    console.error("Gagal Logout:", error);
  }
};
