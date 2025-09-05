import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputModal({
  isOpen,
  onConfirm,
  onCancel,
  item,
  value,
}) {
  const [data, setData] = useState(value);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="grid gap-4 bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold">Input {item}</h2>

            <input
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Masukkan ${item}`}
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(data)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
