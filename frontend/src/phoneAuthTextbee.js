import { auth } from "./firebase";
import { signInWithCustomToken } from "firebase/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let lastPhone = null;

export async function sendPhoneOTP(phoneNumber) {
  lastPhone = phoneNumber;
  const res = await fetch(`${API}/api/auth/send-phone-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not send OTP");
  }
  return true;
}

export async function verifyPhoneOTP(otpCode, phoneNumber = lastPhone) {
  const res = await fetch(`${API}/api/auth/verify-phone-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Verification failed");
  }
  const data = await res.json();
  const cred = await signInWithCustomToken(auth, data.customToken);
  const token = await cred.user.getIdToken();
  return { uid: cred.user.uid, phone: data.phone, token };
}
