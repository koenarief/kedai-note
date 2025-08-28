// src/components/SalesList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

export default function SalesList({ user }) {
  const [sales, setSales] = useState([]);

  dayjs.extend(relativeTime);

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

  const diffMinutes = (createdAt) => {
    if(!createdAt) return true;
    const firestoreDate = createdAt.toDate();
	const now = new Date();
	const differenceInMilliseconds = Math.abs(now.getTime() - firestoreDate.getTime());
	const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
	return differenceInMinutes < 500;
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Penjualan Hari Ini</h2>
      <ul className="space-y-2">
		{sales.map((sale) => (
          <li
            key={sale.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <div>
              <p>
                {sale.flavor} - {sale.qty} x {Intl.NumberFormat('en-US').format(sale.price)}
				<span> [ {Intl.NumberFormat('en-US').format(sale.subTotal)} ]</span>
              </p>
			  <p className="text-xs">
			    {dayjs(sale.createdAt?.toDate()).locale('id').fromNow()}
                {sale.note && <span className="text-sm text-gray-500 ml-1">{sale.note}</span>}
			  </p>
            </div>
            <div className="space-x-2">
			  {diffMinutes(sale.createdAt) && (
              <button
                onClick={() => handleDelete(sale.id)}
                className="text-sm bg-red-500 text-white px-2 py-1 rounded"
              >
                Hapus
              </button>
			  )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
