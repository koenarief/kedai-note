import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { useUserContext } from "../context/UserContext";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { bulanIni, bulanSebelumnya } from "./tgl";

export default function LabaRugi() {
  const today = new Date();
  const [awalTgl, setAwalTgl] = useState(today);
  const [akhirTgl, setAkhirTgl] = useState(today);
  const [bln, setBln] = useState(0);

  const [summary, setSummary] = useState({
    count: 0,
    total: 0,
    perName: {},
  });

  const [summaryBelanja, setSummaryBelanja] = useState({
    count: 0,
    total: 0,
    perKategori: {},
  });

  const user = useUserContext();

  useEffect(() => {
    if (!user) return;

    const tgl = bulanSebelumnya(bln);
    setAwalTgl(tgl[0]);
    setAkhirTgl(tgl[1]);

    const q = query(
      collection(db, "users", user.uid, "penjualans"),
      where("createdAt", ">=", tgl[0]),
      where("createdAt", "<=", tgl[1]),
    );

    const unsub = onSnapshot(q, (snap) => {
      let count = 0,
        total = 0;
      let perName = {};
      snap.forEach((d) => {
        const data = d.data();
        count++;
        total += data.total;
        data.items.forEach((item) => {
          perName[item.name] = (perName[item.name] || 0) + item.subTotal;
        });
      });
      setSummary({ count, total, perName });
    });

    const qBelanja = query(
      collection(db, "users", user.uid, "belanja"),
      where("createdAt", ">=", tgl[0]),
      where("createdAt", "<=", tgl[1]),
    );

    const unsubBelanja = onSnapshot(qBelanja, (snap) => {
      let count = 0,
        total = 0;
      let perKategori = {};
      snap.forEach((d) => {
        const data = d.data();
        count++;
        total += data.nominal;
        perKategori[data.kategori] =
          (perKategori[data.kategori] || 0) + data.nominal;
      });
      setSummaryBelanja({ count, total, perKategori });
    });

    return () => {
      unsub();
      unsubBelanja();
    };
  }, [bln]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">
        Laba Rugi ({format(awalTgl, "d-M-yyyy")}
        {" s/d "}
        {format(akhirTgl, "d-M-yyyy")})
      </h2>

      <div className="">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={() => setBln((val) => val + 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ml-2"
          onClick={() => setBln(0)}
        >
          <Calendar className="w-4 h-4 mr-2" />
        </button>
      </div>

      <h3 className="mt-2 font-semibold flex items-center">
        <ChevronRight className="w-4 h-4 mr-2" /> Pendapatan:
      </h3>
      <ul className="list-disc list-inside">
        {Object.entries(summary.perName).map(([name, amt]) => (
          <li key={name} className="ml-6">
            {name}: {Intl.NumberFormat("en-US").format(amt / 1000)}k
          </li>
        ))}
      </ul>
      <h3 className="mt-2 font-semibold">
        Total Pendapatan:{" "}
        {Intl.NumberFormat("en-US").format(summary.total / 1000)}k
      </h3>
      <h3 className="mt-2 font-semibold flex items-center">
        <ChevronRight className="w-4 h-4 mr-2" /> Pengeluaran
      </h3>
      <ul className="list-disc list-inside">
        {Object.entries(summaryBelanja.perKategori).map(([kategori, amt]) => (
          <li key={kategori} className="ml-6">
            {kategori}: {Intl.NumberFormat("en-US").format(amt / 1000)}k
          </li>
        ))}
      </ul>
      <h3 className="mt-2 font-semibold">
        Total Pengeluaran:{" "}
        {Intl.NumberFormat("en-US").format(summaryBelanja.total / 1000)}k
      </h3>
      <h3 className="mt-2 font-semibold">
        Laba Rugi:{" "}
        {Intl.NumberFormat("en-US").format(
          (summary.total - summaryBelanja.total) / 1000,
        )}
        k
      </h3>
    </div>
  );
}
