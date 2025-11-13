import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase";
import PropTypes from "prop-types";
import { useAuthState } from "react-firebase-hooks/auth";

ImageUploaderTailwind.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  setImageUrl: PropTypes.func.isRequired,
};

function ImageUploaderTailwind({ imageUrl, setImageUrl }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);
  const fileInputRef = useRef(null);

  const handleButtonClick = (e) => {
    // Pastikan ref ada sebelum memanggil klik
    e.preventDefault();
    fileInputRef.current.click();
  };

  // --- Fungsi Upload Utama ---
  const handleUpload = (file) => {
    if (!file) return;

    // Reset state sebelumnya
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setImageUrl("");

    // 1. Buat referensi storage
    const storageRef = ref(
      storage,
      `users/${user.uid}/${Date.now()}_${file.name}`,
    );

    // 2. Mulai proses upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Pantau kemajuan upload
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setUploadProgress(progress);
      },
      (uploadError) => {
        // Tangani error
        console.error("Upload error:", uploadError);
        setError("Gagal mengunggah file. Silakan coba lagi.");
        setIsUploading(false);
      },
      () => {
        // 3. Ambil URL publik setelah upload selesai
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setImageUrl(downloadURL);
            setIsUploading(false);
          })
          .catch((urlError) => {
            console.error("Error getting download URL:", urlError);
            setError("Gagal mendapatkan URL publik.");
            setIsUploading(false);
          });
      },
    );
  };

  // --- Handler Perubahan File (Instant Upload) ---
  const handleFileChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Panggil fungsi upload saat file dipilih
      handleUpload(selectedFile);
      // Reset input agar pengguna dapat memilih file yang sama lagi
      e.target.value = null;
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white">
      <div className="p-2 text-center">
        {/* Hasil Unggahan (URL dan Gambar) */}
        {imageUrl && !isUploading && (
          <div className="">
            {/* Preview Gambar */}
            <img
              src={imageUrl}
              alt="Uploaded Preview"
              className="mt-4 max-h-48 w-full object-contain"
            />
          </div>
        )}
        {/* Input File */}
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUploading ? "Mengunggah..." : "Pilih File untuk Diunggah"}
        </button>

        <div className="mb-6">
          <input
            ref={fileInputRef}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2 
                       file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                       file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 
                       hover:file:bg-indigo-100 disabled:opacity-50 hidden"
            type="file"
            id="imageUpload"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </div>

        {/* Status Upload dan Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <p className="text-indigo-600 text-sm mb-1">
              Mengunggah... ({uploadProgress}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Pesan Error */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploaderTailwind;
