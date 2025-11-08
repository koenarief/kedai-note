import React, { useState } from "react";
import { Menu, LogOut } from "lucide-react"; // 🔹 tambah icon logout
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import PropTypes from "prop-types";
import { ShoppingCart, Wallet, BarChart3, Settings, User } from "lucide-react";

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

  const openPage = (page) => {
    setPage(page);
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
        <div className="absolute top-12 bg-white shadow-lg rounded-lg border w-48 py-2 z-50">
          {/* 🏠 Penjualan */}
          <button
            onClick={() => openPage("home")}
            className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 ${
              page === "home" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Penjualan
          </button>

          {/* 💸 Pengeluaran */}
          <button
            onClick={() => openPage("belanja")}
            className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 ${
              page === "pengeluaran"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Pengeluaran
          </button>

          {/* 🔹 Separator */}
          <div className="border-t my-2"></div>

          {/* 📊 Laba Rugi */}
          <button
            onClick={() => openPage("labarugi")}
            className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 ${
              page === "labarugi" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Laba - Rugi
          </button>

          {/* 🔹 Separator */}
          <div className="border-t my-2"></div>

          <button
            onClick={() => openPage("items")}
            className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 ${
              page === "items" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            Item Produk
          </button>

          {/* 👤 Profile */}
          <button
            onClick={() => openPage("profile")}
            className={`w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 ${
              page === "profile" ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>

          {/* 🔹 Separator */}
          <div className="border-t my-2"></div>

          {/* 🚪 Logout */}
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
