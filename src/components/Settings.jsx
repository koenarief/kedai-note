import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import PropTypes from 'prop-types';

Settings.propTypes = {
  user: PropTypes.object.isRequired,
};

export default function Settings({ user }) {
  const [summary, setSummary] = useState({
    count: 0,
    totalQty: 0,
    total: 0,
    perName: {},
  });

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const q = query(
      collection(db, "users", user.uid, "sales"),
      where("createdAt", ">=", start),
    );

    const unsub = onSnapshot(q, (snap) => {
      let count = 0,
        totalQty = 0,
        total = 0;
      let perName = {};
      snap.forEach((d) => {
        const data = d.data();
        count++;
        totalQty += data.qty;
        total += data.price * data.qty;
        perName[data.name] =
          (perName[data.name] || 0) + data.price * data.qty;
      });
      setSummary({ count, totalQty, total, perName });
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Settings Items</h2>
      <p>Jumlah Transaksi: {summary.count}</p>
      <p>Total Unit: {summary.totalQty}</p>
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
