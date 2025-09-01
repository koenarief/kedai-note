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
  const translator = short();
  const [items, setItems] = useState(itemsSample);
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
      orderBy("createdAt", "desc"),
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
    <div className="bg-white p-4 rounded-2xl shadow mb-4 text-2xl">
      <p className="mb-4 text-4xl">
        Total:
        <span className="px-2">
          {Intl.NumberFormat("en-US").format(sumTotal())}
        </span>
      </p>

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
  );
}

const ItemsListIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1" />
    <circle cx="3" cy="12" r="1" />
    <circle cx="3" cy="18" r="1" />
  </svg>
);

const MinusIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function ButtonGroup({ onPrimary, onIcon, item, qty }) {
  return (
    <div className="inline-flex overflow-hidden rounded shadow-xl mr-2 mt-2">
      {/* Primary text button */}
      <button
        type="button"
        onClick={onPrimary}
        className="w-58 h-14 px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        {qty > 0 && <span className="mr-2">✅</span>}
        {qty > 0 ? qty : ""}
        {qty > 0 ? " x " : ""}
        {item.name} @ {Intl.NumberFormat("en-US").format(item.price / 1000)}K
      </button>

      {/* Icon-only button */}
      <button
        type="button"
        onClick={onIcon}
        className="p-2.5 bg-indigo-600/90 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        aria-label="More options"
      >
        {/* 3-dots vertical icon (SVG) */}
        {qty > 0 && <span className="px-2">-</span>}
        {qty == 0 && <span className="px-2">&nbsp;</span>}
      </button>
    </div>
  );
}
