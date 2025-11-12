import React from "react";
import {
  doc,
  onSnapshot,
  collection,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import InputModal from "./InputModal";
import { useUserContext } from "../context/UserContext";
import dayjs from "dayjs";
import { Pencil } from "lucide-react";
import ImageUploaderTailwind from "./ImageUploaderTailwind";

export default function Profile() {
  const [active, setActive] = useState(false);
  const [qty, setQty] = useState(0);
  const [profile, setProfile] = useState({});
  const [inputModal, setInputModal] = useState(false);
  const [inputPhoneModal, setInputPhoneModal] = useState(false);
  const user = useUserContext();
  // const [imageUrl, setImageUrl] = useState("");
  const setImageUrl = async (imageUrl) => {
    if (!imageUrl) return;
    if (!user) return;
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      await setDoc(profileRef, { imageUrl: imageUrl }, { merge: true });
    }
  };

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);

        setActive(data.active ?? false);
      } else {
        setDoc(profileRef, {
          email: user.email,
          name: user.displayName,
          createdAt: serverTimestamp(),
          active: false,
        });
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
    } else {
      setDoc(profileRef, {
        email: user.email,
        name: newName,
        createdAt: serverTimestamp(),
        active: false,
      });
    }
    setInputModal(false);
  };

  const savePhone = async (newPhone) => {
    if (!user) return;
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      await setDoc(profileRef, { phone: newPhone }, { merge: true });
    }
    setInputPhoneModal(false);
  };

  const freeKuota = 1000;

  useEffect(() => {
    if (!user) return;

    if (!active) {
      const trxRef = collection(db, "users", user.uid, "sales");

      const unsub = onSnapshot(trxRef, (snap) => {
        setQty(snap.size);
      });

      return () => unsub();
    }
  }, [active, user]);

  return (
    <div className="flex flex-col items-center gap-2 my-4 bg-white p-4 rounded shadow">
      <div className="font-medium">
        Nama merchant:
        <span className="font-bold ml-2">{profile.name || "Belum diisi"}</span>
        {/* Ikon Pensil */}
        <button
          className="text-gray-500 hover:text-blue-600 focus:outline-none ml-2"
          // Tambahkan handler untuk membuka modal/form edit di sini
          onClick={() => {
            setInputModal(true);
          }}
          aria-label="Edit nama merchant"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <div className="font-medium">
        Telp.:<span className="font-bold ml-2">{profile.phone}</span>
        <button
          className="text-gray-500 hover:text-blue-600 focus:outline-none ml-2"
          // Tambahkan handler untuk membuka modal/form edit di sini
          onClick={() => {
            setInputPhoneModal(true);
          }}
          aria-label="Edit no hp"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <div className="font-medium">
        Email:<span className="font-bold ml-2">{profile.email}</span>
      </div>
      <div className="font-medium">
        Tgl pendaftaran:
        <span className="font-bold ml-2">
          {dayjs(profile.createdAt?.toDate()).format("d-M-YYYY")}
        </span>
      </div>
      <div className="font-medium">
        Status:
        <span className="font-bold ml-2">
          {profile.active ? "Verified ✅" : "Belum verifikasi"}
        </span>
      </div>
      {!profile.active && (
        <div>
          Penjualan:
          <span className="font-bold ml-2">
            {qty} (free {freeKuota})
          </span>
        </div>
      )}

      {inputModal && (
        <InputModal
          isOpen={inputModal}
          value={profile.name}
          onConfirm={saveName}
          onCancel={() => setInputModal(false)}
          item="Nama Merchant"
        />
      )}
      {inputPhoneModal && (
        <InputModal
          isOpen={inputPhoneModal}
          value={profile.phone}
          onConfirm={savePhone}
          onCancel={() => setInputPhoneModal(false)}
          item="Telp."
        />
      )}
      <div>
        <ImageUploaderTailwind
          imageUrl={profile.imageUrl}
          setImageUrl={setImageUrl}
        />
      </div>
    </div>
  );
}
