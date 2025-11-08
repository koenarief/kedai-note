import React, { useState } from 'react';
import { Search, X } from 'lucide-react'; // Import ikon X untuk tombol hapus

const SearchInput = ({ placeholder = "Cari...", onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Panggil fungsi pencarian
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // Fungsi untuk menghapus input pencarian
  const handleClear = () => {
    setSearchTerm('');
    // Panggil onSearch dengan string kosong untuk mereset hasil
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-sm">
      
      {/* 1. Ikon Pencarian di Kiri */}
      <Search className="absolute left-3 w-5 h-5 text-gray-400" />
      
      {/* 2. Input Teks */}
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        // Styling Tailwind CSS - Perhatikan 'pr-10' untuk memberi ruang tombol hapus
        className="
          w-full 
          py-2 
          pl-10           
          pr-10           // Memberi ruang di kanan untuk tombol hapus
          border 
          border-gray-300 
          rounded-lg 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500
          focus:border-blue-500
          shadow-sm
        "
      />
      
      {/* 3. Tombol Hapus (Hanya muncul jika ada teks) */}
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Hapus Pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
