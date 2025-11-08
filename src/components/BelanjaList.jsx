import React, { useEffect, useState } from "react";
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

import ConfirmDeleteModal from "./ConfirmDeleteModal";
import PropTypes from 'prop-types';

BelanjaList.propTypes = {
  user: PropTypes.object.isRequired,
  setSelectedBelanja: PropTypes.object.isRequired,
};

export default function BelanjaList({ user, setSelectedBelanja }) {
  const [belanjas, setBelanjas] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [belanjaToDelete, setBelanjaToDelete] = useState(null);
  const [namaBelanja, setNamaBelanja] = useState(null);

  const handleDeleteClick = (belanja) => {
    setBelanjaToDelete(belanja.id);
    setNamaBelanja(belanja.name);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "belanja", belanjaToDelete));

    setShowConfirm(false);
    setBelanjaToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setBelanjaToDelete(null);
  };

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "belanja"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setBelanjas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Pengeluaran Belanja</h2>
      <ul className="space-y-2">
        {belanjas.map((belanja) => (
          <li
            key={belanja.id}
            className="flex justify-between belanjas-center border-b pb-1 last:border-b-0"
          >
            <div>
              <button onClick={() => setSelectedBelanja(belanja)}>
                {belanja.kategori} / {belanja.name}
                <span>
                  {" "}
                  / {Intl.NumberFormat("en-US").format(belanja.nominal / 1000)}k
                </span>
              </button>
              <p className="text-xs">
                {dayjs(belanja.createdAt?.toDate()).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleDeleteClick(belanja)}
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
        item={namaBelanja}
      />
    </div>
  );
}
