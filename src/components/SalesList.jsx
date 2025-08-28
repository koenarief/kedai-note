// src/components/SalesList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function SalesList({ setSelectedSale, user }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {

    const q = query(
      collection(db, "users", user.uid, "sales"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "sales", id));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Daftar Penjualan</h2>
      <ul className="space-y-2">
		{sales.map((sale) => (
          <li
            key={sale.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <div>
              <p>
                {sale.flavor} - {sale.qty} x Rp{sale.price}
              </p>
              {sale.note && <p className="text-sm text-gray-500">{sale.note}</p>}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedSale(sale)} // ✅ send sale to form
                className="text-sm bg-yellow-400 text-white px-2 py-1 rounded"
              >
                Copy
              </button>
              <button
                onClick={() => handleDelete(sale.id)}
                className="text-sm bg-red-500 text-white px-2 py-1 rounded"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
