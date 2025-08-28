import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const items = [
  { id: 1, name: "Esteh Manis", price: 2500 },
  { id: 2, name: "Teh Hangat", price: 2000 },
  { id: 3, name: "Kopi Hitam", price: 3000 },
  { id: 4, name: "Kopi Susu", price: 3500 },
];

export default function ItemForm() {
  const [qty, setQty] = useState({});

  const sumTotal = () => items.reduce((sum, item) => {
    const jml = qty[item.id] ?? 0;
	return sum + (jml * item.price);
  }, 0);
  
  const addQty = (id) => {
    setQty(prev => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1
    }));
  };

  const minusQty = (id) => {
    const newval = (qty[id] ?? 0) - 1;
    setQty(prev => ({
      ...prev,
      [id]: newval > -1 ? newval : 0
    }));
  };

  const sendQty = () => {
    setQty({});
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4 text-xl">
	  <p>Total:
	    <span className="text-4xl px-4">{Intl.NumberFormat('en-US').format(sumTotal())}</span>
	  </p>
	  {items.map((item) => (
	    <div className="mb-2">
		  <button className="bg-blue-400 text-white px-4 py-1 rounded ml-1" onClick={() => addQty(item.id) }>
		    {qty[item.id] > 0 ? qty[item.id] : ''}
		    {qty[item.id] > 0 ? ' x ' : ''}
		    {item.name} @ {Intl.NumberFormat('en-US').format(item.price)}
		  </button>
		  
		  {qty[item.id] > 0 && (
		    <button className="bg-green-400 text-white px-4 py-1 rounded ml-1" onClick={() => minusQty(item.id) }>-</button>
		  )}
		</div>
	  ))}
	  <button onClick={sendQty} className="bg-blue-600 text-white px-4 py-1 rounded ml-1">Submit</button>
	</div>
  );
}
