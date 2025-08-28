// src/App.jsx
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/Login";

import ItemForm from "./components/ItemForm";
import SalesForm from "./components/SalesForm";
import SalesList from "./components/SalesList";
import Summary from "./components/Summary";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [selectedSale, setSelectedSale] = useState(null); // ✅ new state

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">📊 Pencatatan Penjualan</h1>
        <Login />
        {user ? (
          <>
            <ItemForm />
            <SalesForm selectedSale={selectedSale} setSelectedSale={setSelectedSale} user={user} />
            <Summary user={user} />
            <SalesList setSelectedSale={setSelectedSale} user={user} />
          </>
        ) : (
          <p className="text-center text-gray-600">Silakan login untuk melanjutkan.</p>
        )}
      </div>
    </div>
  );
}
