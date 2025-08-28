// src/components/Login.jsx
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { setDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";

export default function Login() {
  const [user] = useAuthState(auth);

  async function saveUserProfile(user) {
    const profileRef = doc(db, "users", user.uid, "config", "profile");
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      console.log("Profile already exists:", profileSnap.data());
      // bisa update atau merge kalau perlu
      await setDoc(
        profileRef,
        {
          email: user.email,
          name: user.displayName,
          lastLogin: serverTimestamp(),
        },
        { merge: true } // merge biar tidak overwrite semua field
      );
    } else {
      console.log("No profile found, creating new...");
      await setDoc(profileRef, {
        email: user.email,
        name: user.displayName,
        createdAt: serverTimestamp(),
		active: false,
      });
    }
  }

  useEffect(() => {
    if (user) {
	  saveUserProfile(user);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login gagal", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex justify-center my-4">
      {user ? (
        <div className="flex items-center space-x-4">
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          <span>{user.displayName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Login dengan Google
        </button>
      )}
    </div>
  );
}
