import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

export default function Profile({ user }: { user: User }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5001/api/orders/myorders', config);
      setOrders(data);
    };
    if (user.isLoggedIn) fetchOrders();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-200">
      <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Përshëndetje, {user.name}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Anëtar i E-Marketi Elbasan</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] text-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Pikët e Grumbulluara</span>
          <span className="text-5xl font-black text-emerald-400">{user.points || 0}</span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white mb-6">Statusi i Porosive</h2>
      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div key={order._id} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">ID: {order._id.slice(-8)}</p>
              <p className="text-xl font-black text-white">{order.totalPrice.toLocaleString()} L</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {order.status === 'Pending' ? 'Në Pritje' : order.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}