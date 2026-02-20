import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { User } from '../types';

// API Dinamik (Nuk ka më localhost hardcoded)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/api/orders`, config);
      setOrders(data);
    } catch (err) { 
      console.error("Gabim në marrjen e të dhënave"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (user.isAdmin) fetchOrders(); 
  }, [user.token]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, config);
      fetchOrders(); 
    } catch (err) { 
      alert("Gabim gjatë përditësimit"); 
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Kujdes! Je i sigurt që do ta fshish këtë porosi?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/api/orders/${orderId}`, config);
      fetchOrders(); 
    } catch (err) { 
      alert("Gabim gjatë fshirjes. Sigurohu që ke krijuar rrugën DELETE në Backend!"); 
    }
  };

  // --- LLOGARITJET E STATISTIKAVE ---
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  }, [orders]);

  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  }, [orders]);

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black tracking-widest uppercase">Aksesi i Mohuar!</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">Panel <span className="text-emerald-500">Kryesor</span></h1>
      </div>

      {/* SEKSIONI I STATISTIKAVE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800/60 p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Porosi</p>
          <p className="text-4xl font-black text-white">{orders.length}</p>
        </div>
        <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 shadow-xl">
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Të Ardhurat Totale</p>
          <p className="text-4xl font-black text-emerald-400">{totalRevenue.toLocaleString()} L</p>
        </div>
        <div className="bg-indigo-500/10 p-6 rounded-[2rem] border border-indigo-500/20 shadow-xl">
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Shitjet Këtë Muaj</p>
          <p className="text-4xl font-black text-indigo-400">{currentMonthRevenue.toLocaleString()} L</p>
        </div>
      </div>

      {/* TABELA E POROSIVE */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Klienti</th>
              <th className="p-6">Data</th>
              <th className="p-6">Adresa & Tel</th>
              <th className="p-6">Totali</th>
              <th className="p-6">Statusi</th>
              <th className="p-6">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.map((order: any) => (
              <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-6 text-white font-bold">{order.user?.name || "Klient i panjohur"}</td>
                <td className="p-6 text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('sq-AL')}</td>
                <td className="p-6">
                  <p className="text-white text-sm truncate max-w-[200px]">{order.shippingAddress?.address || "Pa Adresë"}</p>
                  <p className="text-emerald-500 text-xs font-bold">{order.shippingAddress?.phone || "Pa Telefon"}</p>
                </td>
                <td className="p-6 text-white font-black">{order.totalPrice.toLocaleString()} L</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                    order.status === 'Paguar' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    order.status === 'Nisur' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {order.status || 'Në Pritje'}
                  </span>
                </td>
                <td className="p-6 flex gap-2">
                  <button onClick={() => updateStatus(order._id, 'Nisur')} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all" title="Shëno si të Nisur">🚀</button>
                  <button onClick={() => updateStatus(order._id, 'Paguar')} className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all" title="Shëno si të Paguar">💵</button>
                  <button onClick={() => deleteOrder(order._id)} className="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all ml-2" title="Fshi Porosinë">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nuk ka asnjë porosi për momentin</div>
        )}
      </div>
    </div>
  );
}