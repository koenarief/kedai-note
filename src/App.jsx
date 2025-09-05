// src/App.jsx
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

import AddIcon from "./icons/AddIcon";
import AddItemForm from "./components/AddItemForm";
import HomeIcon from "./icons/HomeIcon";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import Login from "./components/Login";
import Profile from "./components/Profile";
import SalesForm from "./components/SalesForm";
import SalesList from "./components/SalesList";
import Settings from "./components/Settings";
import Summary from "./components/Summary";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [selectedItem, setSelectedItem] = useState({});
  const [blokir, setBlokir] = useState(false);

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
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          📊 Jurnal Harian {name || "—"}
        </h1>

        {user ? (
          <>
            {/* 🔹 Navigation */}
            <div className="flex justify-center my-4 gap-2">
              <button
                onClick={() => setPage("home")}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                  page === "home"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <HomeIcon />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setPage("settings")}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                  page === "settings"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <AddIcon />
                <span className="hidden sm:inline">Tambah</span>
              </button>
            </div>

            {/* 🔹 Page content */}
            {page === "settings" && (
              <>
                <AddItemForm
                  user={user}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
                <ItemList user={user} setSelectedItem={setSelectedItem} />
              </>
            )}

            {page === "home" && (
              <>
                <ItemForm user={user} blokir={blokir} />
                <Summary user={user} />
                <SalesList user={user} />
                <Profile setBlokir={setBlokir} blokir={blokir} />
              </>
            )}
          </>
        ) : (
          // 🔹 Hanya tampilkan login kalau belum ada user
          <Login />
        )}
      </div>
    </div>
  );
}
