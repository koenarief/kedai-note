import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

import ItemAddForm from "./components/ItemAddForm";
import ItemCardList from "./components/ItemCardList";
import ItemList from "./components/ItemList";
import Login from "./components/Login";
import NavMenu from "./components/NavMenu";
import Profile from "./components/Profile";
import SalesList from "./components/SalesList";
import Settings from "./components/Settings";
import Summary from "./components/Summary";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [selectedItem, setSelectedItem] = useState({});
  const [blokir, setBlokir] = useState(false);
  const [open, setOpen] = useState(false);

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
            <NavMenu page={page} setPage={setPage} />

            {/* 🔹 Page content */}
            {page === "settings" && (
              <>
                <ItemAddForm
                  user={user}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
                <ItemList user={user} setSelectedItem={setSelectedItem} />
                <Login />
              </>
            )}

            {page === "home" && (
              <>
                <ItemCardList user={user} blokir={blokir} />
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
