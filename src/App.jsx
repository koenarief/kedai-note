// src/App.jsx
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/Login";

import ItemForm from "./components/ItemForm";
import AddItemForm from "./components/AddItemForm";
import SalesForm from "./components/SalesForm";
import SalesList from "./components/SalesList";
import ItemList from "./components/ItemList";
import Summary from "./components/Summary";
import Settings from "./components/Settings";
import HomeIcon from "./icons/HomeIcon";
import AddIcon from "./icons/AddIcon";

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [page, setPage] = useState('home');

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">📊 Jurnal Harian</h1>
		
		<div className="flex justify-center my-4">
		  <button onClick={() => setPage('home')}>
		    <HomeIcon />
		  </button>
		  <button className="ml-2" onClick={() => setPage('settings')}>
		    <AddIcon />
		  </button>
		</div>
		
		{page == 'settings' && user && (
		  <>
		  <AddItemForm user={user} />
		  <ItemList user={user} />
		  </>
		)}
		
		{page == 'home' && (
		<>
        {user ? (
          <>
            <ItemForm user={user} />
            <Summary user={user} />
            <SalesList user={user} />
          </>
        ) : (
          <p className="text-center text-gray-600">Silakan login untuk melanjutkan.</p>
        )}
		</>
		)}
        <Login />
		
      </div>
    </div>
  );
}
