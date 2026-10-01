import { auth } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

let confirmationResult = null;

function resetRecaptcha() {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore if already cleared
    }
    window.recaptchaVerifier = null;
  }
}

// Call when the user clicks "Send OTP"
// phoneNumber must be E.164 format: +919876543210
export async function sendPhoneOTP(phoneNumber) {
  resetRecaptcha();

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container", // id of the div in your page
    { size: "invisible" }
  );

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );
    return true; // SMS sent
  } catch (err) {
    resetRecaptcha(); // allow retry after a failure
    throw err;
  }
}

// Call when the user submits the 6-digit code
export async function verifyPhoneOTP(otpCode) {
  if (!confirmationResult) {
    throw new Error("Please request an OTP first.");
  }
  const result = await confirmationResult.confirm(otpCode);
  const user = result.user;
  const token = await user.getIdToken();
  return { uid: user.uid, phone: user.phoneNumber, token };
}