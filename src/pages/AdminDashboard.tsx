import { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

export default function AdminDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5001/api/orders', config);
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
      await axios.put(`http://localhost:5001/api/orders/${orderId}/status`, { status: newStatus }, config);
      fetchOrders(); 
    } catch (err) { 
      alert("Gabim gjatë përditësimit"); 
    }
  };

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black tracking-widest uppercase">Aksesi i Mohuar!</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">Admin <span className="text-emerald-500">Panel</span></h1>
        <div className="bg-slate-800 px-6 py-2 rounded-full border border-slate-700 text-sm font-bold text-slate-400">
           {orders.length} Porosi në total
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Klienti</th>
              <th className="p-6">Data</th>
              <th className="p-6">Adresa / Telefon</th>
              <th className="p-6">Totali</th>
              <th className="p-6">Statusi</th>
              <th className="p-6">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.map((order: any) => (
              <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-6 text-white font-bold">{order.user?.name || "Klient i fshirë"}</td>
                <td className="p-6 text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                
                {/* KETU ISHTE GABIMI - SHTUAM ?. DHE FALLBACK */}
                <td className="p-6">
                  <p className="text-white text-sm">{order.shippingAddress?.address || "Pa Adresë"}</p>
                  <p className="text-emerald-500 text-xs font-bold">{order.shippingAddress?.phone || "Pa Telefon"}</p>
                </td>

                <td className="p-6 text-white font-black">{order.totalPrice.toLocaleString()} L</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                    order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </td>
                <td className="p-6 flex gap-2">
                  <button onClick={() => updateStatus(order._id, 'Shipped')} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-lg" title="Nis Porosinë">🚀</button>
                  <button onClick={() => updateStatus(order._id, 'Delivered')} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg" title="Dorëzo Porosinë">✅</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Nuk ka asnjë porosi për momentin</div>}
      </div>
    </div>
  );
}