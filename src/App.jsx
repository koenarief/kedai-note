import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

import BelanjaAddForm from "./components/belanja/BelanjaAddForm";
import ItemAddForm from "./components/items/ItemAddForm";
import ItemCardList from "./components/sales/ItemCardList";

import Login from "./components/Login";
import NavMenu from "./components/NavMenu";
import Profile from "./components/Profile";
import LabaRugi from "./components/LabaRugi";

import { UserContext } from "./context/UserContext";
import { ToastContainer } from "react-toastify";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    // 🔹 sekali fetch awal (biar langsung muncul)
    getDoc(profileRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name ?? "");
      }
    });

    // 🔹 listener realtime
    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name ?? "");
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-2">
        <h1 className="text-xl font-bold text-center">📊 Jurnal Harian</h1>
        {user ? (
          <UserContext.Provider value={user}>
            <p className="text-4xl font-bold text-center">{name}</p>
            {/* 🔹 Navigation */}
            <BrowserRouter>
              <NavMenu />
              <Routes>
                <Route path="/" element={<ItemCardList />} />
                <Route path="/laba-rugi" element={<LabaRugi />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/belanja" element={<BelanjaAddForm />} />
                <Route path="/items" element={<ItemAddForm />} />
              </Routes>
            </BrowserRouter>
          </UserContext.Provider>
        ) : (
          // 🔹 Hanya tampilkan login kalau belum ada user
          <Login />
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
