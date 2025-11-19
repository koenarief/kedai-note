import React, { useState } from "react";
import PropTypes from "prop-types";

import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { useUserContext } from "../context/UserContext";

// Asumsi Anda memiliki AuthContext atau cara lain untuk mendapatkan objek auth dan user

const UpdatePassword = ({ setUbahPassword }) => {
  const user = useUserContext();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Pastikan user tersedia
  if (!user) {
    return <p>Silakan login untuk mengubah kata sandi.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("Kata sandi baru dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal harus 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      // 1. Buat kredensial dari password saat ini
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      // 2. Re-autentikasi pengguna
      await reauthenticateWithCredential(user, credential);

      // 3. Update Password
      await updatePassword(user, newPassword);

      setMessage("Kata sandi berhasil diubah!");
      setUbahPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      // Tangani error, terutama auth/requires-recent-login
      if (err.code === "auth/wrong-password") {
        setError("Password saat ini salah.");
      } else if (err.code === "auth/requires-recent-login") {
        setError(
          "Operasi ini sensitif. Silakan keluar dan masuk kembali, lalu coba ubah kata sandi Anda.",
        );
      } else {
        setError(`Gagal mengubah password: ${err.message}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Ubah Kata Sandi
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Password Saat Ini */}
        <div>
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-gray-700"
          >
            Password Saat Ini
          </label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Input Password Baru */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Password Baru (min. 6 karakter)
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
        >
          {loading ? "Memproses..." : "Ubah Password"}
        </button>
        <button
          className="w-full bg-gray-200 py-2 px-4 border rounded-md"
          onClick={() => setUbahPassword(false)}
        >
          Batal
        </button>
      </form>

      {/* Area Pesan/Error */}
      {error && (
        <p className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          ⚠️ **Error:** {error}
        </p>
      )}
      {message && (
        <p className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
          ✅ **Berhasil:** {message}
        </p>
      )}
    </div>
  );
};

UpdatePassword.propTypes = {
  setUbahPassword: PropTypes.func.isRequired,
};

export default UpdatePassword;
