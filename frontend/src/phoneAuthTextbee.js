import { auth } from "./firebase";
import { signInWithCustomToken } from "firebase/auth";

const API = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim()) ? process.env.NEXT_PUBLIC_API_URL.trim() : "http://localhost:8000";

let lastPhone = null;

export async function sendPhoneOTP(phoneNumber, extra = {}) {
  lastPhone = phoneNumber;
  const baseUrl = "http://localhost:8000";
  const res = await fetch(`${baseUrl}/api/auth/send-phone-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not send OTP");
  }
  return true;
}

export async function verifyPhoneOTP(otpCode, phoneNumber = lastPhone, extra = {}) {
  const baseUrl = API || "http://localhost:8000";
  const res = await fetch(`${baseUrl}/api/auth/verify-phone-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber, otp: otpCode, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Verification failed");
  }
  const data = await res.json();
  let token = data.token;
  let uid = data.user?.id || `usr_${data.phone.replace(/[^0-9]/g, '')}`;

  if (data.customToken) {
    try {
      const cred = await signInWithCustomToken(auth, data.customToken);
      const idToken = await cred.user.getIdToken();
      if (!token) token = idToken;
      uid = cred.user.uid;
    } catch (e) {
      console.warn("Firebase custom token signin notice:", e);
    }
  }

  return { 
    uid, 
    phone: data.phone, 
    token: token || data.token,
    user: data.user
  };
}
