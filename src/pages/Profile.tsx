import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Profile({ user }: { user: User }) {
  const [orders, setOrders] = useState([]);

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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 text-slate-200">
      
      {/* KARTA KRYESORE: Më shumë Padding dhe Hapësirë (gap-8) */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 sm:p-12 rounded-[2.5rem] mb-12 flex flex-col md:flex-row justify-between items-center shadow-2xl gap-8">
        <div className="text-center md:text-left space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Përshëndetje, <br className="hidden sm:block" /> {user.name}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            Anëtar i E-Marketi Elbasan
          </p>
        </div>
        
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 sm:p-10 rounded-[2rem] text-center w-full md:w-auto shadow-inner">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-3">Pikët e Grumbulluara</span>
          <span className="text-6xl font-black text-emerald-400 leading-none">{user.points || 0}</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Statusi i Porosive</h2>
        <div className="w-12 h-1 bg-emerald-500 mt-4 rounded-full"></div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center bg-slate-800/20 border border-slate-800 p-12 rounded-[2rem]">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nuk keni asnjë porosi të kryer.</p>
        </div>
      ) : (
        /* LISTA E POROSIVE: Flex-col ne Celular, Flex-row ne PC */
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 transition-all hover:bg-slate-800/60">
              
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">ID e Porosisë: {order._id.slice(-8)}</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{order.totalPrice.toLocaleString()} L</p>
              </div>
              
              {/* STATUSI: Zë gjithë gjerësinë në celular (w-full) që të duket si buton */}
              <div className={`px-5 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-full text-[10px] font-black uppercase tracking-widest border text-center w-full sm:w-auto ${
                order.status === 'Porosia u dërgua' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                order.status === 'Porosia u mor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {order.status || 'Në Pritje'}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}