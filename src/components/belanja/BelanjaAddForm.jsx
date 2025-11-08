import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import BelanjaList from "./BelanjaList";
import { useUserContext } from "../../context/UserContext";

export default function BelanjaAddForm() {
  const [name, setName] = useState("");
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState("");
  const [edit, setEdit] = useState(false);
  const [selectedBelanja, setSelectedBelanja] = useState({});
  const user = useUserContext();

  useEffect(() => {
    if (selectedBelanja?.name) {
      setName(selectedBelanja.name || "");
      setNominal(selectedBelanja.nominal || "");
      setKategori(selectedBelanja.kategori || "");
      setEdit(true);
    }
  }, [selectedBelanja]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !nominal || !kategori) return alert("Lengkapi data belanja..");

    const harga = parseInt(nominal);

    if (edit) {
      const reff = doc(db, "users", user.uid, "belanja", selectedBelanja.id);
      await setDoc(
        reff,
        {
          name,
          nominal: harga < 100 ? harga * 1000 : harga,
          kategori,
        },
        { merge: true },
      );
    } else {
      await addDoc(collection(db, "users", user.uid, "belanja"), {
        name,
        nominal: harga < 100 ? harga * 1000 : harga,
        kategori,
        createdAt: serverTimestamp(),
      });
    }

    setEdit(false);
    setSelectedBelanja(null);
    setName("");
    setNominal("");
    setKategori("");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl shadow mb-4 space-y-3"
      >
        <h2 className="text-lg font-bold">
          {edit ? "✏️ Edit Pengeluaran Belanja" : "➕ Input Pengeluaran Belanja"}
        </h2>

        <div className="grid gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Keterangan
            </label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan keterangan"
              value={name}
              autoFocus={!edit}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nominal</label>
            <input
              type="number"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Misalnya: pengeluaran harian"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            />
          </div>

          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium">
            {edit ? "Update" : "Save"}
          </button>
        </div>
      </form>
      <BelanjaList user={user} setSelectedBelanja={setSelectedBelanja} />
    </>
  );
}
