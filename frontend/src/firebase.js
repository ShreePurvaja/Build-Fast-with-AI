import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDKnrfUSGO7yHG8E2Zf0nsUmryVv6t_I8U",
  authDomain: "workverse-auth-e7437.firebaseapp.com",
  projectId: "workverse-auth-e7437",
  storageBucket: "workverse-auth-e7437.firebasestorage.app",
  messagingSenderId: "462614326776",
  appId: "1:462614326776:web:447fa32477d8980dfdba0d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);