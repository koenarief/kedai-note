// src/components/Summary.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";

export default function Summary({ user }) {
  const [summary, setSummary] = useState({ count: 0, totalQty: 0, total: 0, perFlavor: {} });

  useEffect(() => {
	if(!user) return;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const q = query(collection(db, "users", user.uid, "sales") , where("createdAt", ">=", start));

    const unsub = onSnapshot(q, (snap) => {
      let count = 0, totalQty = 0, total = 0;
      let perFlavor = {};
      snap.forEach((d) => {
        const data = d.data();
        count++;
        totalQty += data.qty;
        total += data.price * data.qty;
        perFlavor[data.flavor] = (perFlavor[data.flavor] || 0) + data.price * data.qty;
      });
      setSummary({ count, totalQty, total, perFlavor });
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Ringkasan Penjualan ({format(new Date(), "dd/MM/yyyy")})</h2>
      <p>Jumlah Transaksi: {summary.count}</p>
      <p>Total Unit: {summary.totalQty}</p>
      <p>Total Pendapatan: Rp{summary.total}</p>
      <h3 className="mt-2 font-semibold">Pendapatan per item:</h3>
      <ul className="list-disc list-inside">
        {Object.entries(summary.perFlavor).map(([flavor, amt]) => (
          <li key={flavor}>{flavor}: Rp{amt}</li>
        ))}
      </ul>
    </div>
  );
}
