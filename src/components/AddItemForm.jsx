// src/components/AddItemForm.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function AddItemForm({ selectedItem, user }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kategori, setKategori] = useState("");

  // ✅ Whenever selectedItem changes, pre-fill fields
  useEffect(() => {
    if (selectedItem) {
      setName(selectedItem.name || "");
      setPrice(selectedItem.price || "");
      setKategori(selectedItem.kategori || "");
    }
  }, [selectedItem]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
	  
    if (!name || !price) return alert("Isi item dan harga!");

    const harga = parseInt(price);
	  
    await addDoc(collection(db, "users", user.uid, "items"), {
      name,
      price: harga < 100 ? harga * 1000 : harga,
      kategori,
      createdAt: serverTimestamp(),
    });

    setName("");
    setPrice("");
    setKategori("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Tambah Item</h2>
      <div className="grid gap-2">
        <input className="border p-2 rounded" placeholder="Item" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="border p-2 rounded" placeholder="Harga" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Kategori" value={kategori} onChange={(e) => setKategori(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Entri</button>
      </div>
    </form>
  );
}
