import React from "react";
import {
  doc,
  onSnapshot,
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
import LiveCameraCapture from "./LiveCameraCapture";
import UpdatePassword from "./UpdatePassword";

export default function Profile() {
  const [ubahPassword, setUbahPassword] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [profile, setProfile] = useState({});
  const [inputModal, setInputModal] = useState(false);
  const [inputPhoneModal, setInputPhoneModal] = useState(false);
  const user = useUserContext();

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
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
    updateProfile({ name: newName });
    setInputModal(false);
  };

  const savePhone = async (newPhone) => {
    updateProfile({ phone: newPhone });
    setInputPhoneModal(false);
  };

  const setImageUrl = async (imageUrl) => {
    if (!imageUrl) return;
    updateProfile({ imageUrl: imageUrl });
  };

  const updateProfile = async (field) => {
    if (!user) return;
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      await setDoc(profileRef, field, { merge: true });
    }
  };

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
          {profile.active ? "Verified ✅" : "Belum verifikasi (free 1 bln)"}
        </span>
      </div>

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
      <h1>Versi: {import.meta.env.VITE_REACT_APP_VERSION}</h1>
      <div className="h-48 w-48">
        <img src={profile.imageUrl} className="object-cover w-full h-full rounded-full"/>
      </div>
      <div className="flex justify-end space-x-4 my-4">
        <button
          className="rounded-md border px-4 py-2"
          onClick={() => setOpenCamera(true)}
        >
          Ganti foto profile
        </button>

        <button
          className="rounded-md border px-4 py-2"
          onClick={() => setUbahPassword(true)}
        >
          Ubah kata sandi
        </button>
      </div>

      {ubahPassword && <UpdatePassword setUbahPassword={setUbahPassword} />}

      {openCamera && (
        <LiveCameraCapture
          onCancel={() => setOpenCamera(false)}
          onConfirm={(url) => {
            console.log(url);
            setImageUrl(url);
          }}
        />
      )}
    </div>
  );
}
