import  { useState } from 'react';
import type { CartItem, User } from '../types';
import { Link } from 'react-router-dom';

interface CartProps {
  items: CartItem[];
  user: User;
  onUpdateQty: (id: number, newQty: number) => void;
  onRemove: (id: number) => void;
}

export default function Cart({ items, user, onUpdateQty, onRemove }: CartProps) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = subtotal * discountPercent;
  const totalPrice = subtotal - discountAmount;

  function applyPromoCode() {
    if (!user.isLoggedIn) {
      setPromoMessage('Duhet të hysh në llogari për të përdorur bonuset.');
      return;
    }

    const code = promoCode.trim().toUpperCase();
    if (code === 'KLINT10' || code === 'BONUS') {
      setDiscountPercent(0.10);
      setPromoMessage('Karta e bonusit u aplikua! (-10%)');
    } else {
      setDiscountPercent(0);
      setPromoMessage('Kodi nuk është i vlefshëm.');
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-32">
        <h2 className="text-3xl font-black text-slate-300 mb-4">Shporta juaj është bosh</h2>
        <Link to="/" className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black tracking-wide uppercase px-8 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-emerald-500/20">Zbuloni Ofertat</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black text-white mb-8">Shporta e Blerjeve</h1>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] overflow-hidden">
          <ul className="divide-y divide-slate-700/30">
            {items.map(item => (
              <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:bg-slate-800/60 transition-colors">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl border border-slate-700" />
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">{item.name}</h3>
                  <p className="text-emerald-400 font-semibold">{item.price} L / copë</p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700/50 p-1">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50" disabled={item.qty <= 1}>-</button>
                    <span className="w-10 text-center font-bold text-white">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">+</button>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                     <p className="text-xl font-black text-white">{item.price * item.qty} L</p>
                  </div>

                  <button onClick={() => onRemove(item.id)} className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800/60 p-6 sm:p-8 rounded-[2rem] border border-slate-700/50 h-max sticky top-28">
         <h2 className="text-2xl font-black text-white mb-6 border-b border-slate-700/50 pb-6">Përmbledhja</h2>
         
         <div className="space-y-4 text-slate-300 mb-8 border-b border-slate-700/50 pb-8">
           <div className="flex justify-between items-center">
             <span className="font-medium">Nëntotali</span>
             <span className="font-bold text-lg text-white">{subtotal.toLocaleString()} L</span>
           </div>
           
           {discountPercent > 0 && (
             <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
               <span className="font-bold">Zbritje ({discountPercent * 100}%)</span>
               <span className="font-black">- {discountAmount.toLocaleString()} L</span>
             </div>
           )}
         </div>

         <div className="mb-10">
           <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Karta e Klientit</label>
           <div className="flex flex-col sm:flex-row gap-3">
             <input 
               type="text" 
               value={promoCode}
               onChange={(e) => setPromoCode(e.target.value)}
               placeholder="Kodi i Ofertës" 
               className="w-full sm:flex-grow p-4 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white placeholder-slate-600 font-bold uppercase transition-colors"
             />
             <button onClick={applyPromoCode} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-6 py-4 rounded-xl transition-colors uppercase tracking-widest">Apliko</button>
           </div>
           {promoMessage && (
             <p className={`text-sm font-bold mt-3 ${discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{promoMessage}</p>
           )}
         </div>

         <div className="flex justify-between items-end mb-8">
            <span className="text-slate-400 font-bold uppercase tracking-widest">Totali</span>
            <span className="text-4xl font-black text-white">{totalPrice.toLocaleString()} L</span>
         </div>

         <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-lg">
           Përfundo Blerjen
         </button>
      </div>
    </div>
  );
}