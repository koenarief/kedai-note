export default function ItemCard({ onAdd, onSub, item }) {

  return (
    <div className="mr-2 mb-2 bg-gray-200 inline-flex group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      <div className="p-2 space-y-1.5">
        <h3 className="font-medium text-gray-800 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
          {item.name}
        </h3>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-blue-600 font-bold text-xs sm:text-sm">
              Rp {item.price.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={onSub}>-</button>
          <button onClick={onAdd}>+</button>
        </div>
      </div>
    </div>
  );
}

