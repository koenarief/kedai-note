import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import short from "short-uuid";
import ItemCard from "./ItemCard";
import PropTypes from "prop-types";

import { db } from "../../firebase";
import { useUserContext } from "../../context/UserContext";
import SearchInput from "./SearchInput";

ItemList.propTypes = {
  items: PropTypes.object.isRequired,
  qty: PropTypes.object.isRequired,
  minusQty: PropTypes.object.isRequired,
};

const itemsSample = [
  { id: 1, name: "Esteh Manis", price: 2500, kategori: "Minuman" },
  { id: 2, name: "Teh Hangat", price: 2000, kategori: "Minuman" },
  { id: 3, name: "Kopi Hitam", price: 3000, kategori: "Minuman" },
  { id: 4, name: "Kopi Susu", price: 3500, kategori: "Minuman" },
];

export default function ItemCardList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [qty, setQty] = useState({});
  const [items, setItems] = useState(itemsSample);
  const blokir = false;
  const translator = short();
  let running = false;
  const user = useUserContext();

  useEffect(() => {
    const q = query(collection(db, "users", user.uid, "items"));
    const unsub = onSnapshot(q, (snap) => {
      if (running) {
        return;
      }
      running = true;
      if (snap.empty) {
        const url =
          "https://firebasestorage.googleapis.com/v0/b/rife-522b2.appspot.com/o/esteh-app%2Fdefault.png?alt=media&token=9cfb0007-3a4f-4d12-9d2a-12456c9ebbf0";
        itemsSample.forEach(async (item) => {
          await addDoc(collection(db, "users", user.uid, "items"), {
            name: item.name,
            price: item.price,
            kategori: item.kategori,
            image: url,
            createdAt: serverTimestamp(),
          });
        });
      }
    });
    return () => unsub();
  }, [db, user.uid]);

  useEffect(() => {
    const itemsRef = collection(db, "users", user.uid, "items");
    let baseQuery = query(itemsRef, orderBy("name"));

    const unsub = onSnapshot(baseQuery, (snap) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Konversi search term ke huruf kecil

      const filteredItems = snap.docs
        // 1. Filter di JavaScript (Client-Side)
        .filter((doc) => {
          // Ambil nama dari data dokumen
          const name = doc.data().name || "";
          const kategori = doc.data().kategori || "";

          // Konversi nama dokumen ke huruf kecil sebelum membandingkan
          return (
            name.toLowerCase().includes(lowerCaseSearchTerm) ||
            kategori.toLowerCase().includes(lowerCaseSearchTerm)
          );
        })
        // 2. Map hasilnya
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }));

      setItems(filteredItems);
    });

    return () => unsub();
  }, [db, user.uid, searchTerm]);

  const sumTotal = () =>
    items.reduce((sum, item) => {
      const jml = qty[item.id] ?? 0;
      return sum + jml * item.price;
    }, 0);

  const addQty = (id) => {
    setQty((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  const minusQty = (id) => {
    setQty((prev) => {
      const current = prev[id] ?? 0;
      if (current <= 0) return prev; // tidak perlu update kalau sudah 0
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  const submitForm = () => {
    if (!user) return;
    const shortId = translator.generate();
    items.forEach(async (item) => {
      if (qty[item.id] > 0) {
        await addDoc(collection(db, "users", user.uid, "sales"), {
          name: item.name,
          price: parseInt(item.price),
          qty: parseInt(qty[item.id]),
          subTotal: item.price * qty[item.id],
          note: shortId,
          createdAt: serverTimestamp(),
        });
      }
    });
    setQty({});
  };

  return (
    <div>
      <SearchInput onSearch={(val) => setSearchTerm(val)} />
      {/* 🔹 Item Grid */}
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            onAdd={() => addQty(item.id)}
            onSub={() => minusQty(item.id)}
            item={item}
            qty={qty}
          />
        ))}
      </div>
      {/* 🔹 Total & Item List */}
      {sumTotal() > 1 && (
        <div className="mt-6">
          <div className="bg-white p-4 rounded-2xl shadow mb-4">
            <p className="text-2xl font-semibold">
              Total:
              <span className="ml-2">
                {Intl.NumberFormat("en-US").format(sumTotal())}
              </span>
            </p>
            {/* 🔹 Submit Button (pindah ke bawah) */}
            {!blokir && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={submitForm}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <ItemList qty={qty} minusQty={minusQty} items={items} />
        </div>
      )}
    </div>
  );
}

function ItemList({ items, qty, minusQty }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold">Nota Penjualan</h2>
      <ul className="space-y-2">
        {items
          .filter((itm) => qty[itm.id] > 0)
          .map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border-b pb-1 last:border-b-0"
            >
              <button
                className=" cursor-pointer"
                onClick={() => minusQty(item.id)}
              >
                {qty[item.id]} x {item.name}
                <span className="ml-2">
                  @ {Intl.NumberFormat("en-US").format(item.price / 1000)}k
                </span>
                {" / "}
                {Intl.NumberFormat("en-US").format(
                  (item.price * qty[item.id]) / 1000,
                )}
                k
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
