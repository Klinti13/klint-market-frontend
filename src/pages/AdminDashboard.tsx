import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'order' | 'product'} | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', oldPrice: '', description: '', image: '', category: 'Bio', badge: ''
  });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`, config),
        axios.get(`${API_URL}/api/products`)
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) { console.error("Gabim"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (user.isAdmin) fetchData(); }, [user.token]);

  const updateStatus = async (id: string, s: string) => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    await axios.put(`${API_URL}/api/orders/${id}/status`, { status: s }, config);
    fetchData();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const path = itemToDelete.type === 'order' ? 'orders' : 'products';
    await axios.delete(`${API_URL}/api/${path}/${itemToDelete.id}`, config);
    setItemToDelete(null); fetchData();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    await axios.post(`${API_URL}/api/products`, { ...newProduct, price: Number(newProduct.price), oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : null }, config);
    setIsProductModalOpen(false);
    setNewProduct({ name: '', price: '', oldPrice: '', description: '', image: '', category: 'Bio', badge: '' });
    fetchData();
  };

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black">AKSESI I MOHUAR!</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">Admin <span className="text-emerald-500">Panel</span></h1>
        <button onClick={() => setIsProductModalOpen(true)} className="bg-emerald-500 text-slate-900 font-black px-6 py-3 rounded-xl uppercase text-xs">➕ Shto Produkt</button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4 text-[10px] font-black uppercase tracking-widest">
        <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'text-emerald-400 border-b-2 border-emerald-500 pb-4' : 'text-slate-500'}>Porositë ({orders.length})</button>
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'text-emerald-400 border-b-2 border-emerald-500 pb-4' : 'text-slate-500'}>Produktet ({products.length})</button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-x-auto">
        {activeTab === 'orders' ? (
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[9px] uppercase font-black">
              <tr><th className="p-6">Klienti</th><th className="p-6">Totali</th><th className="p-6">Statusi</th><th className="p-6 text-right">Veprime</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((o: any) => (
                <tr key={o._id} className="text-sm">
                  <td className="p-6 text-white font-bold">{o.user?.name}</td>
                  <td className="p-6 text-white">{o.totalPrice} L</td>
                  <td className="p-6"><span className="text-amber-400 font-black uppercase text-[9px]">{o.status || 'Pending'}</span></td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => updateStatus(o._id, 'Nisur')} className="bg-blue-500/10 p-2 rounded-lg">🚀</button>
                    <button onClick={() => setItemToDelete({id: o._id, type: 'order'})} className="bg-rose-500/10 p-2 rounded-lg">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[9px] uppercase font-black">
              <tr><th className="p-6">Foto</th><th className="p-6">Emri</th><th className="p-6">Kategoria</th><th className="p-6 text-right">Veprime</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {products.map((p: any) => (
                <tr key={p._id} className="text-sm">
                  <td className="p-6"><img src={p.imageUrl} className="w-10 h-10 object-cover rounded-lg" /></td>
                  <td className="p-6 text-white font-bold">{p.name}</td>
                  <td className="p-6 text-emerald-400 font-black uppercase text-[9px]">{p.category}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => setItemToDelete({id: p._id, type: 'product'})} className="bg-rose-500/10 text-rose-400 p-2 rounded-lg px-4 font-black uppercase text-[9px]">🗑️ Fshi</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 w-full max-w-sm text-center">
            <h3 className="text-xl font-black text-white mb-6">Fshi {itemToDelete.type === 'order' ? 'Porosinë' : 'Produktin'}?</h3>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Anulo</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-rose-500 text-white font-black rounded-xl">Konfirmo</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 w-full max-w-md my-8">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black text-white">Shto Produkt</h3><button onClick={() => setIsProductModalOpen(false)} className="text-slate-400">✕</button></div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" required placeholder="Emri" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required placeholder="Çmimi" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white" />
                <input type="number" placeholder="I vjetri" value={newProduct.oldPrice} onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              </div>
              <textarea required placeholder="Përshkrimi" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white min-h-[80px]" />
              <input type="text" required placeholder="Kategoria (p.sh Bio)" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              <input type="url" required placeholder="Linku i Fotos" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white" />
              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-900 font-black rounded-xl uppercase tracking-widest active:scale-95 shadow-lg">Ruaj Produktin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}