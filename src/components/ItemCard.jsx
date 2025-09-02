export default function ItemCard({ onAdd, onSub, item, qty }) {
  return (
    <div
      onClick={onAdd}
      className="mr-2 mb-2 bg-gray-200 inline-flex group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer"
    >
      <div className="p-3 space-y-1 w-48 sm:w-42 flex flex-col items-center text-center">
        {/* Nama produk */}
        <h3 className="font-semibold text-gray-800 text-2lg sm:text-lg group-hover:text-blue-600 transition-colors">
          {item.name}
        </h3>

        {/* Harga */}
        <div>
          <span className="text-blue-600 font-bold text-xs sm:text-sm">
            Rp {item.price.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Qty control */}
        {qty[item.id] > 0 && (
        <div
          className="flex items-center justify-between gap-2 pt-1"
          onClick={(e) => e.stopPropagation()} // biar klik tombol tidak ikut tambah qty
        >
          <button
            onClick={onSub}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition"
          >
            −
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {qty[item.id]}
          </span>
        </div>
        )}
      </div>
    </div>
  );
}
