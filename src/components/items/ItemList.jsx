import React, { useEffect, useState } from "react";
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
import PropTypes from "prop-types";

import { db } from "../../firebase";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { useUserContext } from "../../context/UserContext";
import SearchInput from "../sales/SearchInput";

ItemList.propTypes = {
  setSelectedItem: PropTypes.func.isRequired,
};

export default function ItemList({ setSelectedItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [namaItem, setNamaItem] = useState(null);
  const user = useUserContext();

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
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Konversi search term ke huruf kecil
      const filteredItems = snap.docs
        // 1. Filter di JavaScript (Client-Side)
        .filter((doc) => {
          // Ambil nama dari data dokumen
          const name = doc.data().name || "";

          // Konversi nama dokumen ke huruf kecil sebelum membandingkan
          return name.toLowerCase().includes(lowerCaseSearchTerm);
        })
        // 2. Map hasilnya
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      setItems(filteredItems);
    });

    return () => unsub();
  }, [db, user.uid, searchTerm]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <SearchInput onSearch={(val) => setSearchTerm(val)} />
      <h2 className="text-lg font-bold mb-2">Item Produk Penjualan</h2>
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
