import { db } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Call this after every successful login
export async function saveUserToFirestore(user) {
  if (!user || !user.uid) return false;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name: user.name || "User",
      email: user.email || null,
      phone: user.phone || null,
      auth_method: user.authMethod, // "email_otp" | "phone" | "google"
      last_login: serverTimestamp(),
      created_at: serverTimestamp(),
    }, { merge: true }); // merge:true = update if exists, create if not
    return true;
  } catch (err) {
    console.info("Firestore client sync notice (rule/permission):", err?.message || err);
    return false;
  }
}

// To get a user's data anywhere in your app:
export async function getUser(uid) {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.warn("Firestore getUser notice:", err);
    return null;
  }
}
