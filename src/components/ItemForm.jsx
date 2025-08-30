import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import short from 'short-uuid';

const itemsSample = [
  { id: 1, name: "Esteh Manis", price: 2500, kategori: "Minuman"},
  { id: 2, name: "Teh Hangat", price: 2000, kategori: "Minuman" },
  { id: 3, name: "Kopi Hitam", price: 3000, kategori: "Minuman" },
  { id: 4, name: "Kopi Susu", price: 3500, kategori: "Minuman" },
];

export default function ItemForm({ user }) {
  const [qty, setQty] = useState({});
  const translator = short();
  const [items, setItems] = useState(itemsSample);
  let running = false;

  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "items")
    );
	const unsub = onSnapshot(q, (snap) => {
	  if(running) {
	    return;
	  }
	  running = true;
      if(snap.empty) {
        itemsSample.forEach(async (item) => {
	      await addDoc(collection(db, "users", user.uid, "items"), {
            name: item.name,
            price: item.price,
		    kategori: item.kategori,
            createdAt: serverTimestamp(),
          });
	    });
	  } else {
	    console.log('items sudah terisi');
	  }
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    const q = query(
      collection(db, "users", user.uid, "items"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

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

  const submitForm = () => {
    if (!user) return;
	const shortId = translator.generate();
	items.forEach(async (item) => {
	  if(qty[item.id] > 0) {
	    await addDoc(collection(db, "users", user.uid, "sales"), {
          flavor: item.name,
          price: parseInt(item.price),
          qty: parseInt(qty[item.id]),
		  subTotal: item.price * qty[item.id],
          note: shortId,
          createdAt: serverTimestamp(),
        });
	  }
	});
    setQty({});
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-4 text-2xl">
	  <p className="mb-4 text-4xl">Total:
	    <span className="px-2">{Intl.NumberFormat('en-US').format(sumTotal())}</span>
	  </p>
	  {items.map((item) => (
	    <div className="mb-2 flex justify-between" key={item.id}>
		  {qty[item.id] > 0 ? (
		  <div>
          <span className="mr-2">✅</span>
		  <button className="bg-blue-500 text-white px-4 py-1 rounded ml-1" onClick={() => addQty(item.id) }>
		    {qty[item.id] > 0 ? qty[item.id] : ''}
		    {qty[item.id] > 0 ? ' x ' : ''}
		    {item.name} @ {Intl.NumberFormat('en-US').format(item.price/1000)}k
		  </button>
		  </div>
		  ) : (
		  <button className="bg-blue-500 text-white px-4 py-1 rounded ml-1" onClick={() => addQty(item.id) }>
		    {qty[item.id] > 0 ? qty[item.id] : ''}
		    {qty[item.id] > 0 ? ' x ' : ''}
		    {item.name} @ {Intl.NumberFormat('en-US').format(item.price/1000)}k
		  </button>
		  )}

		  
          <div className="space-x-2">
		  {qty[item.id] > 0 && (
		    <button className="bg-red-500 text-white px-1 py-1 rounded hover:bg-red-600 ml-1" onClick={() => minusQty(item.id) }>
			  <MinusIcon />
			</button>
		  )}
		  </div>
		</div>
	  ))}
	  <div className="flex justify-between">
	    <button onClick={submitForm} className="bg-green-600 text-white px-4 py-1 rounded ml-1">Submit</button>
	  </div>
	</div>
  );
}

const ItemsListIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1" />
    <circle cx="3" cy="12" r="1" />
    <circle cx="3" cy="18" r="1" />
  </svg>
);

const MinusIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
