import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";

export default function Profile({ setBlokir, blokir }) {
  const [user] = useAuthState(auth);
  const [active, setActive] = useState(false);
  const [qty, setQty] = useState(0); // ✅ state for sales count

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setActive(data.active ?? false);
        if (data.active) {
          setBlokir(false);
        }
      }
    });

    return () => unsub(); // ✅ cleanup on unmount or user change
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const trxRef = collection(db, "users", user.uid, "sales");

    const unsub = onSnapshot(trxRef, (snap) => {
      setQty(snap.size); // snap.size is the number of docs
      if (!active && snap.size > 10) {
        setBlokir(true);
      }
    });

    return () => unsub(); // ✅ cleanup on unmount or user change
  }, [active]); // listen when active changes

  return (
    <div className="flex justify-center my-4">
      {blokir && <span>❌ Inactive — Sales Count: {qty}</span>}
      {active && <span>✅ Active</span>}
    </div>
  );
}
