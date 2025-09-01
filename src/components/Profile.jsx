import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot, collection, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";

export default function Profile({ setBlokir, blokir }) {
  const [user] = useAuthState(auth);
  const [active, setActive] = useState(false);
  const [qty, setQty] = useState(0); // ✅ state for sales count
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name);
        setActive(data.active ?? false);
        if (data.active) {
          setBlokir(false);
        }
      }
    });

    return () => unsub(); // ✅ cleanup on unmount or user change
  }, [user]);

  const saveName = async () => {
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      await setDoc(
        profileRef,
        {
          name: name,
        },
        { merge: true }, // merge biar tidak overwrite semua field
      );
    }
  }

  useEffect(() => {
    if (!user) return;

    const trxRef = collection(db, "users", user.uid, "sales");

    const unsub = onSnapshot(trxRef, (snap) => {
      setQty(snap.size); // snap.size is the number of docs
      if (!active && snap.size > 100) {
        setBlokir(true);
      }
    });

    return () => unsub(); // ✅ cleanup on unmount or user change
  }, [active]); // listen when active changes

  return (
    <div className="flex justify-center my-4 bg-white p-4 rounded shadow">
      {blokir && <span>❌ Inactive — Sales Count: {qty}</span>}
      {active && <span>✅ Active</span>}
      <input value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-80 bg-gray-100 p-2 border"/>
      <button onClick={saveName} className="ml-2">Save</button>
    </div>
  );
}
