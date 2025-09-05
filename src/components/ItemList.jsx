import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Trash2 } from "lucide-react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import ConfirmDeleteModal from "./ConfirmDeleteModal";

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
      orderBy("createdAt", "asc"),
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
            className="flex justify-between items-center border-b pb-1 last:border-b-0"
          >
            <div>
              <button onClick={() => setSelectedItem(item)}>
                {item.kategori} / {item.name}
                <span>
                  {" "}
                  / {Intl.NumberFormat("en-US").format(item.price / 1000)}k
                </span>
              </button>
              <p className="text-xs">
                {dayjs(item.createdAt?.toDate()).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleDeleteClick(item)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 size={16} />
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
