import React from "react";
import PropTypes from "prop-types";

ItemCard.propTypes = {
  onAdd: PropTypes.object.isRequired,
  onSub: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  qty: PropTypes.object.isRequired,
};

export default function ItemCard({ onAdd, onSub, item, qty }) {
  return (
    <div
      onClick={onAdd}
      style={{
        backgroundImage: `url(${item.image})`,
      }}
      className="bg-cover bg-center rounded-xl shadow-lg p-6 group relative hover:border-blue-800 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex-1 min-w-[160px]"
    >
      {qty[item.id] > 0 && (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onSub}
            className="absolute bottom-0 right-0 bg-red-500 text-white text-xl font-bold px-4 py-2 rounded cursor-pointer"
          >
            {qty[item.id]}
          </button>
        </div>
      )}

      <div className="p-3 space-y-2 w-full flex flex-col items-center text-center">
        {/* Nama produk */}
        <h3 className="font-semibold text-white text-xl group-hover:text-blue-600 transition-colors">
          {item.name}
        </h3>

        {/* Harga */}
        <div>
          <span className="text-blue-100 font-bold text-sm">
            Rp {item.price.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}
