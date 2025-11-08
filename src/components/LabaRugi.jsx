import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { useUserContext } from "../context/UserContext";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function LabaRugi() {
  const today = new Date();
  const [awalTgl, setAwalTgl] = useState(today);
  const [akhirTgl, setAkhirTgl] = useState(today);
  const [bln, setBln] = useState(0);

  const [summary, setSummary] = useState({
    count: 0,
    totalQty: 0,
    total: 0,
    perName: {},
  });

  const [summaryBelanja, setSummaryBelanja] = useState({
    count: 0,
    total: 0,
    perKategori: {},
  });

  const user = useUserContext();

  const bulanSebelumnya = (n) => {
    if (n == 0) return bulanIni();

    const today = new Date();

    // 1. **Awal Bulan Sebelumnya**
    // Ambil tahun dan bulan saat ini
    const previousMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - n, // Kurangi 1 dari bulan saat ini
      1, // Selalu set hari ke 1
    );

    // 2. **Akhir Bulan Sebelumnya**
    // Mulai dari awal bulan saat ini (hari ke-1 bulan ini)
    const currentMonthStart = new Date(
      previousMonthStart.getFullYear(),
      previousMonthStart.getMonth() + 1,
      1,
    );

    // Kurangi 1 milidetik dari awal bulan ini
    // Ini akan membawa kita ke hari terakhir bulan sebelumnya
    const previousMonthEnd = new Date(currentMonthStart.getTime() - 1);

    return [previousMonthStart, previousMonthEnd];
  };

  const bulanIni = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const akhir = new Date(endMonth.getTime() - 1);
    return [start, akhir];
  };

  useEffect(() => {
    if (!user) return;

    const tgl = bulanSebelumnya(bln);
    setAwalTgl(tgl[0]);
    setAkhirTgl(tgl[1]);

    const q = query(
      collection(db, "users", user.uid, "sales"),
      where("createdAt", ">=", tgl[0]),
      where("createdAt", "<=", tgl[1]),
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

    return () => { unsub(); unsubBelanja(); }
  }, [bln]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">
        Laba Rugi ({format(awalTgl, "dd-MM-yyyy")}
        {" s/d "}
        {format(akhirTgl, "dd-MM-yyyy")})
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

      <h3 className="mt-2 font-semibold flex items-center"><ChevronRight className="w-4 h-4 mr-2" /> Pendapatan:</h3>
      <ul className="list-disc list-inside">
        {Object.entries(summary.perName).map(([name, amt]) => (
          <li key={name} className="ml-6">
            {name}: {Intl.NumberFormat("en-US").format(amt / 1000)}k
          </li>
        ))}
      </ul>
      <h3 className="mt-2 font-semibold">Total Pendapatan: {Intl.NumberFormat("en-US").format(summary.total / 1000)}k</h3>
      <h3 className="mt-2 font-semibold flex items-center"><ChevronRight className="w-4 h-4 mr-2" /> Pengeluaran</h3>
      <ul className="list-disc list-inside">
        {Object.entries(summaryBelanja.perKategori).map(([kategori, amt]) => (
          <li key={kategori} className="ml-6">
            {kategori}: {Intl.NumberFormat("en-US").format(amt / 1000)}k
          </li>
        ))}
      </ul>
      <h3 className="mt-2 font-semibold">Total Pengeluaran: {Intl.NumberFormat("en-US").format(summaryBelanja.total / 1000)}k</h3>
      <h3 className="mt-2 font-semibold">Laba Rugi: {Intl.NumberFormat("en-US").format((summary.total - summaryBelanja.total) / 1000)}k</h3>
    </div>
  );
}
