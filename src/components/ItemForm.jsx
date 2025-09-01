import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import short from "short-uuid";

const itemsSample = [
  { id: 1, name: "Esteh Manis", price: 2500, kategori: "Minuman" },
  { id: 2, name: "Teh Hangat", price: 2000, kategori: "Minuman" },
  { id: 3, name: "Kopi Hitam", price: 3000, kategori: "Minuman" },
  { id: 4, name: "Kopi Susu", price: 3500, kategori: "Minuman" },
];

export default function ItemForm({ user, blokir }) {
  const [qty, setQty] = useState({});
  const [items, setItems] = useState(itemsSample);
  const translator = short();
  let running = false;

  useEffect(() => {
    const q = query(collection(db, "users", user.uid, "items"));
    const unsub = onSnapshot(q, (snap) => {
      if (running) {
        return;
      }
      running = true;
      if (snap.empty) {
        itemsSample.forEach(async (item) => {
          await addDoc(collection(db, "users", user.uid, "items"), {
            name: item.name,
            price: item.price,
            kategori: item.kategori,
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
    const newval = (qty[id] ?? 0) - 1;
    setQty((prev) => ({
      ...prev,
      [id]: newval > -1 ? newval : 0,
    }));
  };

  const submitForm = () => {
    if (!user) return;
    const shortId = translator.generate();
    items.forEach(async (item) => {
      if (qty[item.id] > 0) {
        await addDoc(collection(db, "users", user.uid, "sales"), {
          flavor: item.name,
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
    <div className="bg-white p-4 rounded-2xl shadow mb-4 text-2xl">

      {items.map((item) => (
        <ButtonGroup
          onPrimary={() => addQty(item.id)}
          onIcon={() => minusQty(item.id)}
          item={item}
          qty={qty[item.id]}
        />
      ))}

      {!blokir && (
        <div className="flex justify-between mt-2">
          <button
            onClick={submitForm}
            className="bg-green-600 text-white px-4 py-1 rounded ml-1"
          >
            Submit
          </button>
        </div>
      )}
    </div>

    {sumTotal() > 9 && (
    <div>
    <div className="bg-white p-4 rounded-2xl shadow mb-4 text-2xl">
      <p className="text-2xl">
        Total:
        <span className="px-2">
          {Intl.NumberFormat("en-US").format(sumTotal())}
        </span>
      </p>
    </div>

    <ItemList qty={qty} minusQty={minusQty} items={items} />
    </div>

    )}


    </div>
  );
}

function ButtonGroup({ onPrimary, onIcon, item, qty }) {
  return (
    <div className="inline-flex overflow-hidden rounded shadow-xl mr-2 mt-2">
      {/* Primary text button */}
      <button
        type="button"
        onClick={onPrimary}
        className="w-58 h-10 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        {item.name} @ {Intl.NumberFormat("en-US").format(item.price / 1000)}K
      </button>
    </div>
  );
}

function ItemList({ items, qty, minusQty }) {

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Nota Penjualan</h2>
      <ul className="space-y-2">
        {items.filter(itm => qty[itm.id] > 0).map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center border-b pb-1"
          >
              <button
                onClick={() => minusQty(item.id)}>
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
