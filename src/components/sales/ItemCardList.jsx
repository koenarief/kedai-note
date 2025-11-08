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
import PropTypes from 'prop-types';

import { db } from "../../firebase";
import { useUserContext } from "../../context/UserContext";

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
		const url = 'https://firebasestorage.googleapis.com/v0/b/rife-522b2.appspot.com/o/esteh-app%2Fdefault.png?alt=media&token=9cfb0007-3a4f-4d12-9d2a-12456c9ebbf0';
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
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "items"),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

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
      {/* 🔹 Item Grid */}
      <div className="flex flex-wrap gap-4 justify-center">
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
          </div>

          <ItemList qty={qty} minusQty={minusQty} items={items} />

          {/* 🔹 Submit Button (pindah ke bawah) */}
          {!blokir && (
            <div className="flex justify-center mt-6">
              <button
                onClick={submitForm}
                className="bg-green-600 text-white text-xl px-6 py-3 rounded-xl shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemList({ items, qty, minusQty }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Nota Penjualan</h2>
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
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
