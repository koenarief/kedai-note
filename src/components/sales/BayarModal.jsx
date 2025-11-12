import React, { useState } from "react";
import PropTypes from "prop-types";

BayarModal.propTypes = {
  isOpen: PropTypes.object.isRequired,
  onConfirm: PropTypes.object.isRequired,
  onCancel: PropTypes.object.isRequired,
  total: PropTypes.object.isRequired,
};

export default function BayarModal({ isOpen, onConfirm, onCancel, total }) {
  if (!isOpen) return null;
  const [bayar, setBayar] = useState(0);

  const add = (rp) => {
    setBayar(bayar + rp);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
        <div className="w-full">
          <p className="mb-2 flex justify-between">
            <span>Total:</span>
            <span className="font-bold">
              {Intl.NumberFormat("en-US").format(total)}
            </span>
          </p>
          <p className="mb-2 flex justify-between">
            <span>Pembayaran:</span>
            <span className="font-bold">
              {Intl.NumberFormat("en-US").format(bayar)}
            </span>
          </p>
          <p className="mb-2 flex justify-between">
            <span>Kembali:</span>
            <span className="font-bold">
              {Intl.NumberFormat("en-US").format(bayar - total)}
            </span>
          </p>
        </div>
        <div className="flex justify-end space-x-4 mb-6">
          <button className=" border p-4" onClick={() => add(100000)}>
            100k
          </button>
          <button className=" border p-4" onClick={() => add(50000)}>
            50k
          </button>
          <button className=" border p-4" onClick={() => add(20000)}>
            20k
          </button>
          <button className=" border p-4" onClick={() => setBayar(0)}>
            C
          </button>
        </div>
        <div className="flex justify-end space-x-4 mb-6">
          <button className=" border p-4" onClick={() => add(10000)}>
            10k
          </button>
          <button className=" border p-4" onClick={() => add(5000)}>
            5k
          </button>
          <button className=" border p-4" onClick={() => add(2000)}>
            2k
          </button>
          <button className=" border p-4" onClick={() => add(1000)}>
            1k
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
