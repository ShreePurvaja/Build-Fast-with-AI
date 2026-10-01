import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export { saveUserToFirestore, getUser } from "./userStorage";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photo: user.photoURL,
    authMethod: "google",
    token,
  };
}
