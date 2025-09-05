// src/components/Login.jsx
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
import { useState, useEffect } from "react";

export default function Login() {
  const [user] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        await saveUserProfile(user);
      })
      .catch((error) => {
        setError(error.message);
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
    <div className="flex justify-center my-4">
      {user ? (
        <div className="flex items-center space-x-4">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="av"
              className="w-8 h-8 rounded-full"
            />
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
          {error && (
            <div
              className="flex items-center p-4 mb-4 mt-4 text-blue-800 rounded-lg bg-white dark:bg-gray-800 dark:text-blue-400"
              role="alert"
            >
              <svg
                className="shrink-0 w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div className="ms-3 text-sm font-medium">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ms-auto -mx-1.5 -my-1.5 bg-white text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                data-dismiss-target="#alert-1"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-4 bg-white p-4 rounded-2xl shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 
    outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm/6 font-medium text-gray-900">
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900
    outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2
    focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3
            py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div className="my-4 text-center text-sm/6 text-gray-500">
              <button
                onClick={handleLogin}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Login dengan Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
