import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { useUserContext } from "../../context/UserContext";
import { hariIni } from "../tgl";

export default function Summary() {
  const [summary, setSummary] = useState({
    count: 0,
    totalQty: 0,
    total: 0,
    perName: {},
  });
  const user = useUserContext();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "penjualans"),
      where("createdAt", ">=", hariIni()),
    );

    const unsub = onSnapshot(q, (snap) => {
      let count = 0,
        totalQty = 0,
        total = 0;
      let perName = {};
      snap.forEach((d) => {
        const data = d.data();
        count++;
        total += data.total;
        data.items.forEach((item) => {
          totalQty += item.qty;
          perName[item.name] =
            (perName[item.name] || 0) + item.subTotal;
        });
      });
      setSummary({ count, totalQty, total, perName });
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">
        Ringkasan Penjualan ({format(new Date(), "d-M-yyyy")})
      </h2>
      <p>Jumlah Transaksi: {summary.count}</p>
      <p>Total qty: {summary.totalQty}</p>
      <p>
        Total Pendapatan:{" "}
        {Intl.NumberFormat("en-US").format(summary.total / 1000)}k
      </p>
      <h3 className="mt-2 font-semibold">Pendapatan per item:</h3>
      <ul className="list-disc list-inside">
        {Object.entries(summary.perName).map(([name, amt]) => (
          <li key={name}>
            {name}: {Intl.NumberFormat("en-US").format(amt / 1000)}k
          </li>
        ))}
      </ul>
    </div>
  );
}
