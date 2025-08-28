// src/components/SalesForm.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SalesForm({ selectedSale, setSelectedSale, user }) {
  const [flavor, setFlavor] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  // ✅ Whenever selectedSale changes, pre-fill fields
  useEffect(() => {
    if (selectedSale) {
      setFlavor(selectedSale.flavor || "");
      setPrice(selectedSale.price || "");
      setQty(selectedSale.qty || "");
      setNote(selectedSale.note || "");
    }
  }, [selectedSale]);

	
  const handleSubmit = async (e) => {
    e.preventDefault();
	  if (!user) return; // jaga-jaga
	  
    if (!flavor || !price) return alert("Isi rasa dan harga!");

    await addDoc(collection(db, "users", user.uid, "sales"), {
      flavor,
      price: parseInt(price),
      qty: parseInt(qty),
      note,
      createdAt: serverTimestamp(),
    });

    setFlavor("");
    setPrice("");
    setQty(1);
    setNote("");
	setSelectedSale(null); // ✅ reset after submit
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Tambah Penjualan</h2>
      <div className="grid gap-2">
        <input className="border p-2 rounded" placeholder="Rasa" value={flavor} onChange={(e) => setFlavor(e.target.value)} />
        <input type="number" className="border p-2 rounded" placeholder="Harga" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type="number" className="border p-2 rounded" placeholder="Jumlah" value={qty} onChange={(e) => setQty(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Entri</button>
      </div>
    </form>
  );
}
