import React, { useState } from "react";
import { Menu, LogOut } from "lucide-react"; // 🔹 tambah icon logout
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import PropTypes from 'prop-types';

NavMenu.propTypes = {
  setPage: PropTypes.object.isRequired,
  page: PropTypes.string,
};

export default function NavMenu({ page, setPage }) {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
  };

  return (
    <div className="relative flex justify-end my-4">
      {/* 🔹 Hamburger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* 🔹 Dropdown menu */}
      {open && (
        <div className="absolute top-12 bg-white shadow-lg rounded-lg border w-40 py-2 z-50">
          <button
            onClick={() => {
              setPage("home");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
              page === "home" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            🏠 Home
          </button>

          <button
            onClick={() => {
              setPage("settings");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
              page === "settings" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            ➕ Kelola Item
          </button>

          {/* 🔹 Separator */}
          <div className="border-t my-2"></div>

          {/* 🔹 Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
