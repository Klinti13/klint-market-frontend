import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ProfileProps {
  user: User;
  onUpdateUser: (fields: Partial<User>) => void;
}

export default function Profile({ user, onUpdateUser }: ProfileProps) {
  const [orders, setOrders] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(user.address || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    setAddress(user.address || '');
    setPhone(user.phone || '');
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);
        setOrders(data);
      } catch (error) {
        console.error("Gabim gjatë marrjes së porosive:", error);
      }
    };
    if (user.isLoggedIn) fetchOrders();
  }, [user.token, user.isLoggedIn]);

  const saveProfile = async () => {
    if (!address.trim() || !phone.trim()) {
      alert("Ju lutem plotësoni adresën dhe telefonin!");
      return;
    }
    
    setIsSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${API_URL}/api/users/profile`, { address, phone, city: 'Elbasan' }, config);
      onUpdateUser({ address: data.address, phone: data.phone, city: data.city });
      setIsEditing(false);
    } catch (err: any) {
      const serverError = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`❌ SERVERI THOTË: ${serverError}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateCardNumber = () => {
    if (!user._id) return '0000 0000 0000 0000';
    const cleanId = user._id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const sixteenChars = cleanId.slice(-16).padEnd(16, '0');
    return sixteenChars.match(/.{1,4}/g)?.join(' ') || 'XXXX XXXX XXXX XXXX';
  };

  const points = user.points || 0;
  const isVipEligible = points >= 1000;
  const pointsNeeded = 1000 - points;

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-5 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-full text-[10px] font-black uppercase tracking-widest border text-center w-full sm:w-auto transition-all duration-300 shadow-sm";
    switch(status) {
      case 'Porosia u dërgua': return <div className={`${baseClasses} bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]`}>✅ {status}</div>;
      case 'Është Rrugës': return <div className={`${baseClasses} bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]`}>🚚 {status}</div>;
      case 'Po Përgatitet': return <div className={`${baseClasses} bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]`}>📦 {status}</div>;
      default: return <div className={`${baseClasses} bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-[0_0_15px_rgba(245,158,11,0.15)]`}>⏳ {status || 'Në Pritje'}</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 text-slate-900 dark:text-slate-200 relative transition-colors duration-300">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Llogaria <span className="text-emerald-500">Ime</span></h1>
        
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* KARTA VIP (Silver për Ditën, Black për Natën) */}
          <div className="flex-1 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] border border-slate-300 dark:border-slate-700/50 rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden group transition-colors duration-300">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-emerald-500/20"></div>
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[12rem]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-emerald-600 dark:text-emerald-500 font-black tracking-[0.3em] text-[10px] uppercase">E-MARKETI {isVipEligible ? 'BLACK CARD' : 'MEMBER CARD'}</span>
                  <h3 className="text-slate-900 dark:text-white font-black text-2xl mt-2 uppercase tracking-tight">{user.name}</h3>
                </div>
                <svg className="w-10 h-10 text-slate-400 dark:text-slate-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
              </div>
              <div className="mt-8">
                <div className="font-mono text-slate-500 dark:text-slate-300 tracking-[0.2em] sm:tracking-[0.3em] text-lg sm:text-xl mb-6 text-shadow-sm">{generateCardNumber()}</div>
                <div className="flex justify-between items-end border-t border-slate-300 dark:border-slate-700/50 pt-6">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase tracking-widest block mb-1">Pikët totale</span>
                    <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{points}</span>
                  </div>
                  <div className="text-right">
                    {isVipEligible ? (
                      <span className="inline-block px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">✅ 10% Ulje e Hapur</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest">Mungojnë {pointsNeeded} pikë<br/>për -10% Ulje</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center shadow-xl dark:shadow-none transition-colors duration-300">
             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-500/20"><span className="text-xl">💎</span></div>
             <h4 className="text-slate-900 dark:text-white font-black text-lg mb-3">Si funksionon?</h4>
             <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>100 Lekë të shpenzuara = 1 Pikë.</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Kur arrin 1000 pikë, mund t'i përdorësh për 10% ulje në shportë.</li>
             </ul>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Të Dhënat e Dërgesës</h2>
        
        {isEditing ? (
          <div className="bg-white dark:bg-slate-800/40 border border-emerald-200 dark:border-emerald-500/30 p-6 sm:p-8 rounded-[2rem] space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-colors duration-300">
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Adresa e Dërgesës *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all" placeholder="Rruga, Pallati, Kati..." />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Numri i Telefonit *</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all" placeholder="06..." />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Anulo</button>
               <button onClick={saveProfile} disabled={isSaving} className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex-1 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                 {isSaving ? 'Duke ruajtur...' : 'Ruaj Të Dhënat'}
               </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row gap-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xl dark:shadow-none">
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Adresa Zyrtare</span>
              <p className="text-slate-900 dark:text-white font-bold text-lg">{user.address ? `${user.address}, ${user.city || 'Elbasan'}` : 'Nuk keni ruajtur një adresë.'}</p>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Numri i Telefonit</span>
              <p className="text-slate-900 dark:text-white font-bold text-lg">{user.phone || 'Nuk keni ruajtur një numër.'}</p>
            </div>
            <div className="sm:w-40 flex flex-col justify-center">
               <button onClick={() => setIsEditing(true)} className="w-full py-4 sm:py-0 sm:h-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95">✏️ Ndrysho</button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Historiku i Porosive</h2>
        <div className="w-12 h-1 bg-emerald-500 mt-4 rounded-full"></div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 p-12 rounded-[2rem] shadow-sm">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nuk keni asnjë porosi të kryer.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xl dark:shadow-md">
              
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Kodi Faturës: #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{order.totalPrice.toLocaleString()} L</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('sq-AL')} • {order.orderItems.length} produkte</p>
              </div>
              
              <div className="flex flex-col items-end gap-4 w-full sm:w-auto">
                {getStatusBadge(order.status)}
                
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-all shadow-sm active:scale-95 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                >
                  👁️ Shiko Faturën
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DRITARJA E FATURËS (MODAL) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-300">
            
            {/* Header i Faturës */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Fatura Detajuar</h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-1">
                  Kodi: #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-10 h-10 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Përmbajtja e Faturës */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              
              <div className="flex flex-col sm:flex-row gap-6 justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Të dhënat e dërgesës</span>
                  <p className="text-slate-900 dark:text-white font-bold">{user.name}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedOrder.shippingAddress.city}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Tel: {selectedOrder.shippingAddress.phone}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Statusi Aktual</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Produktet e Blera</span>
                <ul className="space-y-4">
                  {selectedOrder.orderItems.map((item: any, index: number) => (
                    <li key={index} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.qty} copë x {item.price.toLocaleString()} L</p>
                      </div>
                      <div className="text-right pr-2">
                        <p className="text-emerald-600 dark:text-emerald-400 font-black">{(item.qty * item.price).toLocaleString()} L</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Fundi (Totali) */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
               <div className="flex justify-between items-end">
                 <div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Data e blerjes</span>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(selectedOrder.createdAt).toLocaleDateString('sq-AL')} {new Date(selectedOrder.createdAt).toLocaleTimeString('sq-AL', {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
                 <div className="text-right">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Totali Final</span>
                   <p className="text-3xl font-black text-slate-900 dark:text-white">{selectedOrder.totalPrice.toLocaleString()} L</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}