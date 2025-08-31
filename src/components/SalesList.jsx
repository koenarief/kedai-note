// src/components/SalesList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import DeleteIcon from '../icons/DeleteIcon';

export default function SalesList({ user }) {
  const [sales, setSales] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [namaItem, setNamaItem] = useState(null);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteClick = (sale) => {
    setItemToDelete(sale.id);
	setNamaItem(sale.flavor);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    // Perform your actual delete logic here, e.g., API call
	
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "sales", itemToDelete));

    setShowConfirm(false);
    setItemToDelete(null); // Clear itemToDelete
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setItemToDelete(null); // Clear itemToDelete
  };
  
  useEffect(() => {

    dayjs.extend(relativeTime);
    dayjs.locale('id');

    const q = query(
      collection(db, "users", user.uid, "sales"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const diffMinutes = (createdAt) => {
    if(!createdAt) return true;
    const firestoreDate = createdAt.toDate();
	const now = new Date();
	const differenceInMilliseconds = Math.abs(now.getTime() - firestoreDate.getTime());
	const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
	return differenceInMinutes < 6000;
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
                {sale.flavor} / {sale.qty} x {Intl.NumberFormat('en-US').format(sale.price/1000)}k
				<span> / {Intl.NumberFormat('en-US').format(sale.subTotal/1000)}k</span>
              </p>
			  <p className="text-xs">
			    {dayjs(sale.createdAt?.toDate()).fromNow()}
				<span className="ml-1">/</span>
                {sale.note && <span className="text-sm text-gray-500 ml-1">{sale.note}</span>}
			  </p>
            </div>
            <div className="space-x-2">
			  {diffMinutes(sale.createdAt) && (
              <button
                onClick={() => handleDeleteClick(sale)}
                className="text-sm bg-red-500 text-white px-2 py-2 rounded"
              >
                <DeleteIcon width="22"/>
              </button>
			  )}
            </div>
          </li>
        ))}
      </ul>
	  <ConfirmDeleteModal
        isOpen={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
		item={namaItem}
      />
    </div>
  );
}

