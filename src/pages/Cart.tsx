import { useState, useEffect } from 'react';
import axios from 'axios';
import type { CartItem, User } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface CartProps {
  items: CartItem[];
  user: User;
  onUpdateQty: (id: any, newQty: number) => void;
  onRemove: (id: any) => void;
  onClearCart: () => void;
  onUpdatePoints: (points: number) => void;
  onOpenAuth: () => void; 
  onUpdateUser: (fields: Partial<User>) => void;
}

export default function Cart({ items, user, onUpdateQty, onRemove, onClearCart, onUpdatePoints, onOpenAuth, onUpdateUser }: CartProps) {
  const navigate = useNavigate();
  
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Elbasan'); 
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [useVipCard, setUseVipCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressError, setAddressError] = useState(false); 

  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [deductedPoints, setDeductedPoints] = useState(0); 

  useEffect(() => {
    if (user.isLoggedIn) {
      if (user.address) setAddress(user.address);
      if (user.city) setCity(user.city);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountPercent = useVipCard ? 0.10 : 0;
  const discountAmount = subtotal * discountPercent;
  const totalPrice = subtotal - discountAmount;

  const userPoints = user.points || 0;
  const canUseVip = userPoints >= 1000;

  const handleCheckout = async () => {
    if (!user.isLoggedIn) {
      onOpenAuth(); 
      return;
    }

    if (!address.trim() || !phone.trim()) {
      setAddressError(true); 
      setTimeout(() => setAddressError(false), 3000);
      return;
    }

    setIsProcessing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const orderData = {
        orderItems: items.map(item => ({ name: item.name, qty: item.qty, image: item.image, price: item.price, product: item.id })),
        shippingAddress: { address, city, phone },
        totalPrice: totalPrice,
        useVipPoints: useVipCard
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, config);      
      
      if (address !== user.address || phone !== user.phone) {
          try {
             const { data: updatedProfile } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, { address, city, phone }, config);
             onUpdateUser({ address: updatedProfile.address, city: updatedProfile.city, phone: updatedProfile.phone });
          } catch (profileErr) {
             console.error("Gabim në ruajtjen e profilit", profileErr);
          }
      }

      if (data.points !== undefined) {
        setEarnedPoints(Math.floor(totalPrice / 100));
        if (useVipCard) setDeductedPoints(1000);
        onUpdatePoints(data.points);
      }
      
      setShowSuccess(true);
      onClearCart();
    } catch (error: any) {
      console.error("Gabim gjatë blerjes");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !showSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-32">
        <h2 className="text-3xl font-black text-slate-300 mb-4 tracking-tighter uppercase">Shporta është bosh</h2>
        <Link to="/" className="inline-block mt-4 bg-emerald-500 text-slate-900 font-black px-10 py-5 rounded-[2rem] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Eksploro Produktet</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-3xl font-black text-white mb-2">Shporta e Blerjeve</h1>
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl">
          <ul className="divide-y divide-slate-700/20">
            {items.map(item => (
              <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-slate-800/60 transition-colors relative">
                
                <div className="flex items-center gap-4 w-full">
                  <img src={item.image} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-slate-700 shadow-lg shrink-0" />
                  
                  <div className="flex-grow min-w-0 pr-8 sm:pr-0"> 
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-2 leading-tight mb-1">{item.name}</h3>
                    <p className="text-emerald-400 font-black text-sm sm:text-base">{item.price.toLocaleString()} L</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pl-24 sm:pl-0">
                  <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700/50">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)} className="px-3 py-1 sm:py-2 text-slate-400 active:scale-95" disabled={item.qty <= 1}>-</button>
                    <span className="w-8 text-center font-bold text-white text-sm">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)} className="px-3 py-1 sm:py-2 text-slate-400 active:scale-95">+</button>
                  </div>
                </div>

                <button 
                  onClick={() => onRemove(item.id)} 
                  className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 sm:p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  aria-label="Fshi produktin"
                >
                   <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={`bg-slate-800/40 border transition-all duration-300 rounded-[2rem] p-6 sm:p-8 shadow-2xl ${addressError ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700/50'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest">Adresa e Dërgesës</h2>
            {addressError && <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest animate-bounce">⚠️ Plotëso fushat</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="md:col-span-2">
              <input 
                type="text" value={address} onChange={e => {setAddress(e.target.value); setAddressError(false);}}
                className={`w-full p-4 bg-slate-900 border rounded-xl text-white outline-none transition-all text-sm sm:text-base ${addressError && !address ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'}`}
                placeholder="Rruga, Pallati, Kati..."
              />
            </div>
            <input type="text" value={city} readOnly className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-500 font-bold text-sm sm:text-base" />
            <input 
              type="tel" value={phone} onChange={e => {setPhone(e.target.value); setAddressError(false);}}
              className={`w-full p-4 bg-slate-900 border rounded-xl text-white outline-none transition-all text-sm sm:text-base ${addressError && !phone ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'}`}
              placeholder="Numri i Telefonit"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 p-6 sm:p-8 rounded-[2rem] border border-slate-700/50 h-max lg:sticky lg:top-28 shadow-2xl mt-8 lg:mt-0">
         <h2 className="text-xl sm:text-2xl font-black text-white mb-6 border-b border-slate-700/50 pb-6">Përmbledhja</h2>
         <div className="space-y-4 text-slate-300 mb-8 border-b border-slate-700/50 pb-8 text-sm sm:text-base">
           <div className="flex justify-between items-center">
             <span className="font-medium">Nëntotali</span>
             <span className="font-bold text-white">{subtotal.toLocaleString()} L</span>
           </div>
           {discountPercent > 0 && (
             <div className="flex justify-between items-center text-emerald-400 font-bold">
               <span>Karta VIP (-10%)</span>
               <span>- {discountAmount.toLocaleString()} L</span>
             </div>
           )}
         </div>

         <div className="mb-8 border border-slate-700/50 rounded-2xl p-4 bg-slate-900/50">
           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">VIP Card</label>
           {user.isLoggedIn ? (
             canUseVip ? (
               <div className="space-y-3">
                 <p className="text-xs text-slate-300 font-medium">Keni <span className="text-emerald-400 font-bold">{userPoints}</span> pikë. Përdorni 1000 për -10% ulje.</p>
                 <button 
                   onClick={() => setUseVipCard(!useVipCard)} 
                   className={`w-full font-black px-4 py-3 rounded-xl text-xs transition-all uppercase tracking-widest border ${
                     useVipCard ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900'
                   }`}
                 >
                   {useVipCard ? 'Hiq Kartën VIP' : 'Aktivizo Kartën VIP'}
                 </button>
               </div>
             ) : (
               <p className="text-xs text-slate-400 font-medium">
                 Keni <span className="text-white font-bold">{userPoints}</span> pikë. Ju duhen edhe <span className="text-emerald-400 font-bold">{1000 - userPoints}</span> për të aktivizuar 10% ulje.
               </p>
             )
           ) : (
             <p className="text-xs text-slate-500">Logohuni për të parë pikët VIP.</p>
           )}
         </div>

         <div className="flex justify-between items-end mb-8">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Totali Final</span>
            <span className="text-3xl sm:text-4xl font-black text-white">{totalPrice.toLocaleString()} L</span>
         </div>

         {user.isLoggedIn ? (
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-900 font-black uppercase tracking-widest py-4 sm:py-5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-base sm:text-lg"
            >
              {isProcessing ? 'Duke procesuar...' : 'Konfirmo Porosinë'}
            </button>
         ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center group">
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">Hyni për të fituar {Math.floor(totalPrice / 100)} pikë</p>
              <button 
                onClick={onOpenAuth}
                className="w-full bg-white text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-slate-200 transition-all shadow-xl active:scale-95 text-xs"
              >
                Hyr në Llogari
              </button>
            </div>
         )}
         
         <p className="text-[10px] text-slate-500 font-bold text-center mt-6 uppercase tracking-widest">Pagesa kryhet CASH në dorëzim</p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-[3rem] p-8 sm:p-12 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight">U krye!</h2>
            <div className="bg-emerald-500/10 rounded-2xl p-4 mb-4">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Pikët e fituara</span>
               <span className="text-2xl sm:text-3xl font-black text-emerald-400">+{earnedPoints}</span>
            </div>
            {deductedPoints > 0 && (
              <div className="bg-rose-500/10 rounded-2xl p-3 mb-8 sm:mb-10 border border-rose-500/20">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Pikë të përdorura: -1000</span>
              </div>
            )}
            <button onClick={() => navigate('/profile')} className="w-full py-4 bg-white text-slate-900 font-black rounded-xl uppercase tracking-widest text-xs mt-4 sm:mt-6">Gjurmo Porosinë</button>
          </div>
        </div>
      )}
    </div>
  );
}