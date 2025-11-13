import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export default function Login() {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState("bakso@online.com");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("112233");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    console.log(name);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        await saveUserProfile(user);
      })
      .catch((error) => {
        setError("Kesalahan input email/password");
        console.error("Sign in error:", error.message);
      });
  };

  async function saveUserProfile(user) {
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      // bisa update atau merge kalau perlu
      setName(profileSnap.data().name);
      await setDoc(
        profileRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }, // merge biar tidak overwrite semua field
      );
    } else {
      await setDoc(profileRef, {
        email: user.email,
        name: user.displayName,
        createdAt: serverTimestamp(),
        active: false,
      });
    }
  }

  useEffect(() => {
    if (user == null) {
      return;
    }
    const profileRef = doc(db, "profiles", user.uid);
    const unsub = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // setError('');
    if (user) {
      saveUserProfile(user);
    }
  }, [user]);

  useEffect(() => {
    if (email || password) setError("");
  }, [email, password]);

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
    <div className="flex justify-center my-6">
      {user ? (
        <div className="flex items-center space-x-3 bg-white shadow p-3 rounded-xl">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-9 h-9 rounded-full border"
            />
          )}
          <span className="font-medium text-gray-700">
            {user.displayName || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          {/* 🔹 Error message */}
          {error && (
            <div className="flex items-center p-3 mb-4 text-red-800 bg-red-100 border border-red-200 rounded-lg text-sm">
              <svg
                className="w-4 h-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          {/* 🔹 Login form */}
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Sign in
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                Sign in
              </button>
            </form>

            <div className="flex items-center justify-center">
              <span className="text-gray-500 text-sm">atau</span>
            </div>

            {/* 🔹 Google login */}
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              Daftar/Login dengan Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
