import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // SHTUAR
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders'); // SHTUAR
  
  // NDRYSHUAR: Tani mban ID-në dhe llojin (porosi apo produkt)
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'orders' | 'products'} | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', oldPrice: '', description: '', image: '', category: 'Veshje', badge: ''
  });

  // NDRYSHUAR: Merr te dyja te dhenat
  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`, config),
        axios.get(`${API_URL}/api/products`)
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) { console.error("Gabim në marrjen e të dhënave"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (user.isAdmin) fetchData(); }, [user.token]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, config);
      fetchData(); 
    } catch (err) { alert("Gabim gjatë përditësimit"); }
  };

  // NDRYSHUAR: Modali i fshirjes tani eshte inteligjent
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/api/${itemToDelete.type}/${itemToDelete.id}`, config);
      setItemToDelete(null); 
      fetchData(); 
    } catch (err) { alert("Gabim gjatë fshirjes."); setItemToDelete(null); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/api/products`, {
        ...newProduct,
        price: Number(newProduct.price),
        oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : null
      }, config);
      
      setIsProductModalOpen(false);
      setNewProduct({ name: '', price: '', oldPrice: '', description: '', image: '', category: 'Veshje', badge: '' });
      fetchData();
      alert("✅ Produkti u shtua me sukses!");
    } catch (err) { alert("❌ Gabim gjatë shtimit."); }
  };

  const totalRevenue = useMemo(() => orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0), [orders]);
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return orders.filter(order => new Date(order.createdAt).getMonth() === currentMonth)
                 .reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  }, [orders]);

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black tracking-widest uppercase">Aksesi i Mohuar!</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <h1 className="text-4xl font-black text-white tracking-tighter">Panel <span className="text-emerald-500">Kryesor</span></h1>
        
        <button 
          onClick={() => setIsProductModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm flex items-center gap-2"
        >
          <span>➕</span> Shto Produkt
        </button>
      </div>

      {/* STATISTIKAT (Te paprekura) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800/60 p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Porosi</p>
          <p className="text-4xl font-black text-white">{orders.length}</p>
        </div>
        <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 shadow-xl">
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">Të Ardhurat</p>
          <p className="text-4xl font-black text-emerald-400">{totalRevenue.toLocaleString()} L</p>
        </div>
        <div className="bg-indigo-500/10 p-6 rounded-[2rem] border border-indigo-500/20 shadow-xl">
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Produkte Live</p>
          <p className="text-4xl font-black text-indigo-400">{products.length}</p>
        </div>
      </div>

      {/* BUTONAT PER TE NDRYSHUAR TABELAT */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-500 border border-slate-800 hover:text-white'}`}>📦 Porositë</button>
        <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'text-slate-500 border border-slate-800 hover:text-white'}`}>🏷️ Produktet</button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-x-auto shadow-2xl">
        {activeTab === 'orders' ? (
          /* TABELA E POROSIVE */
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
                  <td className="p-6 text-white font-bold">{order.user?.name || "I panjohur"}</td>
                  <td className="p-6 text-slate-400 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('sq-AL')}</td>
                  <td className="p-6">
                    <p className="text-white text-sm truncate max-w-[200px]">{order.shippingAddress?.address || "Pa Adresë"}</p>
                    <p className="text-emerald-500 text-xs font-bold">{order.shippingAddress?.phone || "Pa Telefon"}</p>
                  </td>
                  <td className="p-6 text-white font-black">{order.totalPrice.toLocaleString()} L</td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">{order.status || 'Në Pritje'}</span>
                  </td>
                  <td className="p-6 flex gap-2">
                    <button onClick={() => updateStatus(order._id, 'Nisur')} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg border hover:bg-blue-500 hover:text-white transition-all">🚀</button>
                    <button onClick={() => setItemToDelete({id: order._id, type: 'orders'})} className="w-8 h-8 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded-lg border hover:bg-rose-500 hover:text-white transition-all ml-2">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* TABELA E PRODUKTEVE (DIZAJNI TOND) */
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Produkti</th>
                <th className="p-6">Kategoria</th>
                <th className="p-6">Çmimi</th>
                <th className="p-6 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="text-white font-bold text-sm">{p.name}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{p.category}</span>
                  </td>
                  <td className="p-6 text-white font-black">{p.price.toLocaleString()} L</td>
                  <td className="p-6 text-right">
                    <button onClick={() => setItemToDelete({id: p._id, type: 'products'})} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">🗑️ Fshi Produktin</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALI I FSHIRJES LUKSOZ (Per te dyja) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Fshi {itemToDelete.type === 'orders' ? 'Porosinë' : 'Produktin'}</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium italic">Ky veprim nuk mund të kthehet mbrapsht.</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl text-sm uppercase">Anulo</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white font-black rounded-xl text-sm uppercase shadow-lg shadow-rose-500/20 active:scale-95">Konfirmo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALI I SHTIMIT (I paprekur) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white tracking-tight">Krijo Produkt</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="Emri" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="Çmimi" />
                <input type="number" value={newProduct.oldPrice} onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="Çmimi Vjetër" />
              </div>
              <textarea required value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none min-h-[80px]" placeholder="Përshkrimi" />
              <input type="text" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="Kategoria" />
              <input type="url" required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="URL e Fotos" />
              <button type="submit" className="w-full mt-6 py-4 bg-emerald-500 text-slate-900 font-black rounded-xl uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-500/20">Ruaj Produktin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}