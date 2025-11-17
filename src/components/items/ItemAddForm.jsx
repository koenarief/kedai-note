import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useUserContext } from "../../context/UserContext";
import ImageUploaderTailwind from "../ImageUploaderTailwind";
import ItemList from "./ItemList";
import { toast } from "react-toastify";

export default function ItemAddForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kategori, setKategori] = useState("");
  const [edit, setEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const user = useUserContext();

  // ✅ Whenever selectedItem changes, pre-fill fields
  useEffect(() => {
    if (selectedItem?.name) {
      setName(selectedItem.name || "");
      setPrice(selectedItem.price || "");
      setKategori(selectedItem.kategori || "");
      setImageUrl(selectedItem.image || "");
      setEdit(true);
    }
  }, [selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !price || !kategori) return alert("Lengkapi data item..");

    const harga = parseInt(price);

    if (edit) {
      const reff = doc(db, "users", user.uid, "items", selectedItem.id);
      await setDoc(
        reff,
        {
          name,
          price: harga < 100 ? harga * 1000 : harga,
          kategori,
          image: imageUrl,
        },
        { merge: true },
      );
    } else {
      await addDoc(collection(db, "users", user.uid, "items"), {
        name,
        price: harga < 100 ? harga * 1000 : harga,
        kategori,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });
    }

    setEdit(false);
    setSelectedItem(null);
    setImageUrl(null);
    setName("");
    setPrice("");
    setKategori("");
    toast('Data berhasil disimpan');
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl shadow mb-4 space-y-3"
      >
        <h2 className="text-lg font-bold">
          {edit ? "✏️ Edit item produk" : "➕ Buat item produk baru"}
			{selectedItem?.name}
        </h2>

        <div className="grid gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Item Produk</label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama item"
              value={name}
              autoFocus={!edit}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Harga</label>
            <input
              type="number"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Misalnya: Minuman"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <ImageUploaderTailwind
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>

          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium">
            {edit ? "Update" : "Save"}
          </button>
        </div>
      </form>
      <ItemList setSelectedItem={setSelectedItem} />
    </>
  );
}
