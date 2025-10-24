import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  onSnapshot,
  collection,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";
import InputModal from "./InputModal";
import PropTypes from 'prop-types';

Profile.propTypes = {
  setBlokir: PropTypes.object.isRequired,
  blokir: PropTypes.boolean,
};

export default function Profile({ setBlokir, blokir }) {
  const [user] = useAuthState(auth);
  const [active, setActive] = useState(false);
  const [qty, setQty] = useState(0);
  const [name, setName] = useState("");
  const [inputModal, setInputModal] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name ?? "");
        setActive(data.active ?? false);
        if (data.active) setBlokir(false);
      }
    });

    return () => unsub();
  }, [user]);

  const saveName = async (newName) => {
    if (!user) return;
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      await setDoc(profileRef, { name: newName }, { merge: true });
    }
    setInputModal(false);
  };

  useEffect(() => {
    if (!user) return;

    const trxRef = collection(db, "users", user.uid, "sales");

    const unsub = onSnapshot(trxRef, (snap) => {
      setQty(snap.size);
      if (!active && snap.size > 100) {
        setBlokir(true);
      }
    });

    return () => unsub();
  }, [active, user]);

  return (
    <div className="flex flex-col items-center gap-2 my-4 bg-white p-4 rounded shadow">
      {blokir && <span>❌ Inactive — Sales Count: {qty}</span>}
      {active && <span>✅ Active</span>}
      <span className="font-medium">Nama Kedai: {name || "Belum diisi"}</span>

      <button
        onClick={() => {
          setTempName(name);
          setInputModal(true);
        }}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
      >
        Ganti Nama
      </button>

      {inputModal && (
        <InputModal
          isOpen={inputModal}
          value={tempName}
          onConfirm={saveName}
          onCancel={() => setInputModal(false)}
          item="Nama Kedai"
        />
      )}
    </div>
  );
}
