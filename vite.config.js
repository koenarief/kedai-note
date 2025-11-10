import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // Impor plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Mengatur bagaimana Service Worker didaftarkan dan diperbarui
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"], // Aset statis yang akan di-cache
      manifest: {
        name: "Jurnal Harian Kasir",
        short_name: "ID Kasir",
        description: "Aplikasi untuk input data penjualan",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
