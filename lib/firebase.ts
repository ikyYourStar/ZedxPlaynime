import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { GoogleAuth } from '@capacitor-community/google-auth';

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

// Inisialisasi Native Plugin
if (typeof window !== 'undefined') {
  GoogleAuth.initialize({
    clientId: '942728827571-p9ih8fv6er1qa7sc6i57darcm450bk9q.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

export const signInWithGoogleNative = async () => {
  try {
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
    await GoogleAuth.signOut();
    await signOut(auth);
  } catch (error) {
    console.error("Gagal Logout:", error);
  }
};
