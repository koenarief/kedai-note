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
import relativeTime from "dayjs/plugin/relativeTime";

import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { useUserContext } from "../../context/UserContext";
import { db } from "../../firebase";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [salesIds, setSalesIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [namaItem, setNamaItem] = useState(null);
  const user = useUserContext();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      console.log(time);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteClick = (sale) => {
    setItemToDelete(sale);
    setNamaItem(sale);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {

    if (!user) return;
    salesById(itemToDelete).forEach((item) => deleteDoc(doc(db, "users", user.uid, "sales", item.id)));

    setShowConfirm(false);
    setItemToDelete(null); // Clear itemToDelete
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setItemToDelete(null); // Clear itemToDelete
  };

  const salesById = (note) => sales.filter((sale) => sale.note == note);
  const totalSales = (note) =>
    sales
      .filter((sale) => sale.note == note)
      .reduce((total, sale) => total + sale.qty * sale.price, 0);

  useEffect(() => {
    dayjs.extend(relativeTime);
    dayjs.locale("id");

    const q = query(
      collection(db, "users", user.uid, "sales"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const sales = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const allIds = sales.map((sale) => sale.note);
      const uniqueIds = [...new Set(allIds)];
      setSalesIds(uniqueIds);
      setSales(sales);
    });
    return () => unsub();
  }, []);

  const diffMinutes = (createdAt) => {
    if (!createdAt) return true;
    const firestoreDate = createdAt.toDate();
    const now = new Date();
    const differenceInMilliseconds = Math.abs(
      now.getTime() - firestoreDate.getTime(),
    );
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    return differenceInMinutes < 60;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-lg font-bold mb-2">Penjualan Hari Ini</h2>
      <ul className="space-y-3">
        {salesIds.map((note) => (
          <li
            key={note}
            className="p-3 rounded-xl border shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1 w-full">
                {salesById(note).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="text-gray-700">
                      <span className="font-medium">
                        {sale.qty}× {sale.name}
                      </span>
                      <span className="text-gray-500 ml-1">
                        @ {Intl.NumberFormat("en-US").format(sale.price / 1000)}
                        k
                      </span>
                    </div>
                    <div className="text-right font-semibold text-gray-800">
                      {Intl.NumberFormat("en-US").format(sale.subTotal / 1000)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 border-t pt-1">
              <span>
                🧾 {dayjs(salesById(note)[0].createdAt?.toDate()).fromNow()}
                {diffMinutes(salesById(note)[0].createdAt) && (
                  <button
                    onClick={() => handleDeleteClick(note)}
                    className="ml-4 bg-gray-100 text-gray rounded hover:bg-gray-200"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </span>
              <span>Total: {totalSales(note) / 1000}k</span>
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
