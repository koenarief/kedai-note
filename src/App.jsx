// src/App.jsx
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

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
  const [selectedItem, setSelectedItem] = useState({});
  const [blokir, setBlokir] = useState(false);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">📊 Jurnal Harian</h1>

        <Login />

        {user && (
          <div className="flex justify-center my-4">
            <button onClick={() => setPage("home")}>
              <HomeIcon />
            </button>
            <button className="ml-2" onClick={() => setPage("settings")}>
              <AddIcon />
            </button>
          </div>
        )}

        {page == "settings" && user && (
          <>
            <AddItemForm
              user={user}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <ItemList user={user} setSelectedItem={setSelectedItem} />
          </>
        )}

        {page == "home" && (
          <>
            {user && (
              <>
                <Profile setBlokir={setBlokir} blokir={blokir} />
                <ItemForm user={user} blokir={blokir} />
                <Summary user={user} />
                <SalesList user={user} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
