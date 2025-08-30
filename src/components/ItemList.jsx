// src/components/ItemList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import DeleteIcon from '../icons/DeleteIcon';

export default function ItemList({ user, setSelectedItem }) {
  const [items, setItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [namaItem, setNamaItem] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item.id);
	setNamaItem(item.name);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;
	  
    await deleteDoc(doc(db, "users", user.uid, "items", itemToDelete));

    setShowConfirm(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setItemToDelete(null);
  };
  
  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "items"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Item Penjualan</h2>
      <ul className="space-y-2">
		{items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <div>
              <p>
                {item.kategori} / {item.name}
				<span> / {Intl.NumberFormat('en-US').format(item.price/1000)}k</span>
              </p>
			  <p className="text-xs">
			    {dayjs(item.createdAt?.toDate()).format('DD/MM/YYYY HH:mm')}
			  </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedItem(item)}
                className="text-sm bg-blue-500 text-white px-2 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(item)}
                className="text-sm bg-red-500 text-white px-2 py-2 rounded"
              >
                Delete
              </button>
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

