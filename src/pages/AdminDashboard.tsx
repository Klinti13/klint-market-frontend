import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  
  // LOGJIKA E RE E FSHIRJES (SHUMË MË E SIGURT) 🗑️
  const [deleteItem, setDeleteItem] = useState<{ id: string, type: 'order' | 'product' } | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Delivered'>('All');

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); 
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', oldPrice: '', description: '', image: '', category: 'Veshje', badge: ''
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
    } catch (err) { console.error("Gabim në marrjen e të dhënave"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (user.isAdmin) fetchData(); }, [user.token]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, config);
      fetchData(); 
      if (selectedInvoice && selectedInvoice._id === orderId) {
        setSelectedInvoice({ ...selectedInvoice, status: newStatus });
      }
    } catch (err) { alert("Gabim gjatë përditësimit!"); }
  };

  // FUNKSIONI I SIGURT I FSHIRJES
  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = deleteItem.type === 'order' ? 'orders' : 'products';
      await axios.delete(`${API_URL}/api/${endpoint}/${deleteItem.id}`, config);
      setDeleteItem(null); 
      fetchData(); 
    } catch (err) { 
      alert("Gabim gjatë fshirjes."); 
      setDeleteItem(null); 
    }
  };

  const uploadFileHandler = async (e: any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, config);
      setNewProduct({ ...newProduct, image: `${API_URL}${data}` }); 
      setUploadingImage(false);
    } catch (error) {
      console.error(error);
      setUploadingImage(false);
      alert("❌ Gabim gjatë ngarkimit të fotos.");
    }
  };

  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...newProduct, price: Number(newProduct.price), oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : null };

      if (editingProductId) {
        await axios.put(`${API_URL}/api/products/${editingProductId}`, payload, config);
        alert("✅ Produkti u modifikua me sukses!");
      } else {
        await axios.post(`${API_URL}/api/products`, payload, config);
        alert("✅ Produkti u shtua me sukses!");
      }

      setIsProductModalOpen(false);
      setEditingProductId(null);
      setNewProduct({ name: '', price: '', oldPrice: '', description: '', image: '', category: 'Veshje', badge: '' });
      fetchData();
    } catch (err) { alert("❌ Gabim gjatë ruajtjes."); }
  };

  const openEditModal = (p: any) => {
    setEditingProductId(p._id);
    setNewProduct({
      name: p.name, price: p.price.toString(), oldPrice: p.oldPrice ? p.oldPrice.toString() : '',
      description: p.description, image: p.imageUrl, category: p.category, badge: p.badge || ''
    });
    setImageMode(p.imageUrl.startsWith('http') ? 'url' : 'file');
    setIsProductModalOpen(true);
  };

  const toggleProductVisibility = async (p: any) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/api/products/${p._id}`, { isActive: p.isActive === false ? true : false }, config);
      fetchData();
    } catch (err) { alert("Gabim gjatë ndryshimit të statusit."); }
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID Porosise,Data,Klienti,Telefoni,Qyteti,Adresa,Statusi,Totali (Lek)\n";
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('sq-AL');
      const name = order.user?.name || "I panjohur";
      const phone = order.shippingAddress?.phone || "";
      const city = order.shippingAddress?.city || "";
      const address = `"${order.shippingAddress?.address || ""}"`;
      const row = `${order._id},${date},${name},${phone},${city},${address},${order.status},${order.totalPrice}`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bilanci_E_Marketi_${new Date().toLocaleDateString('sq-AL')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = useMemo(() => orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0), [orders]);
  const averageOrderValue = useMemo(() => orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0, [orders, totalRevenue]);
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === 'Në Pritje').length, [orders]);

  const monthlyGoal = 500000;
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return orders.filter(order => new Date(order.createdAt).getMonth() === currentMonth)
                 .reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  }, [orders]);
  const progressPercent = Math.min(Math.round((currentMonthRevenue / monthlyGoal) * 100), 100);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (orderFilter === 'Pending') result = result.filter(o => o.status === 'Në Pritje');
    if (orderFilter === 'Delivered') result = result.filter(o => o.status === 'Porosia u dërgua');
    if (searchTerm) {
      result = result.filter(o => 
        o.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.shippingAddress?.phone.includes(searchTerm) ||
        o._id.includes(searchTerm)
      );
    }
    return result;
  }, [orders, searchTerm, orderFilter]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Porosia u dërgua': return <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{status}</span>;
      case 'Është Rrugës': return <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{status}</span>;
      case 'Po Përgatitet': return <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border bg-blue-500/10 text-blue-400 border-blue-500/20">{status}</span>;
      default: return <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">{status || 'Në Pritje'}</span>;
    }
  };

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black tracking-widest uppercase">Aksesi i Mohuar!</div>;

  return (
    <>
      <div className={`max-w-7xl mx-auto p-4 sm:p-6 pb-24 relative ${selectedInvoice ? 'print:hidden' : ''}`}>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter">Qendra e <span className="text-emerald-500">Komandës</span></h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={exportToExcel} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black uppercase tracking-widest px-6 py-3 rounded-xl border border-slate-700 transition-all text-xs flex items-center justify-center gap-2">📊 Bilanci</button>
            <button onClick={() => { setEditingProductId(null); setNewProduct({ name: '', price: '', oldPrice: '', description: '', image: '', category: 'Veshje', badge: '' }); setImageMode('url'); setIsProductModalOpen(true); }} className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs flex items-center justify-center gap-2">Shto Produkt</button>
          </div>
        </div>

        {/* ... KUTITË E STATISTIKAVE ... */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] p-6 mb-8 shadow-xl">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ecuria e këtij muaji</span>
              <h3 className="text-xl font-black text-white">{currentMonthRevenue.toLocaleString()} L <span className="text-slate-500 text-sm">/ {monthlyGoal.toLocaleString()} L</span></h3>
            </div>
            <span className="text-emerald-400 font-black text-xl">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700/50">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-emerald-500/10 p-5 sm:p-6 rounded-[2rem] border border-emerald-500/20 shadow-xl">
            <p className="text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Të Ardhurat</p>
            <p className="text-2xl sm:text-4xl font-black text-emerald-400">{totalRevenue.toLocaleString()} L</p>
          </div>
          <div className="bg-slate-800/60 p-5 sm:p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
            <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Mesatarja / Porosi</p>
            <p className="text-2xl sm:text-4xl font-black text-white">{averageOrderValue.toLocaleString()} L</p>
          </div>
          <div className="bg-rose-500/10 p-5 sm:p-6 rounded-[2rem] border border-rose-500/20 shadow-xl relative overflow-hidden">
            {pendingOrdersCount > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 rounded-bl-full animate-pulse"></div>}
            <p className="text-rose-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Në Pritje</p>
            <p className="text-2xl sm:text-4xl font-black text-rose-400">{pendingOrdersCount}</p>
          </div>
          <div className="bg-indigo-500/10 p-5 sm:p-6 rounded-[2rem] border border-indigo-500/20 shadow-xl">
            <p className="text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">Produkte Live</p>
            <p className="text-2xl sm:text-4xl font-black text-indigo-400">{products.length}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 border border-slate-800 hover:text-white'}`}>Porositë</button>
            <button onClick={() => setActiveTab('products')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 border border-slate-800 hover:text-white'}`}>Produktet</button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-slate-800/20 p-4 rounded-2xl border border-slate-800">
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
              <button onClick={() => setOrderFilter('All')} className={`px-4 py-2 shrink-0 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${orderFilter === 'All' ? 'bg-slate-700 text-white border-slate-600' : 'border-slate-700 text-slate-400 hover:text-white'}`}>Të Gjitha</button>
              <button onClick={() => setOrderFilter('Pending')} className={`px-4 py-2 shrink-0 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${orderFilter === 'Pending' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'}`}>🔴 Në Pritje</button>
              <button onClick={() => setOrderFilter('Delivered')} className={`px-4 py-2 shrink-0 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${orderFilter === 'Delivered' ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}>✅ Të Dërguara</button>
            </div>
            
            <div className="relative w-full sm:w-64 shrink-0">
              <input type="text" placeholder="Kërko klient ose tel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 pl-10 text-xs text-white focus:border-emerald-500 outline-none transition-all" />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-x-auto shadow-2xl">
          {activeTab === 'orders' ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6">ID Faturës</th>
                  <th className="p-6">Klienti & Tel</th>
                  <th className="p-6">Totali</th>
                  <th className="p-6">Statusi</th>
                  <th className="p-6 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6 font-mono text-xs text-slate-300">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="p-6">
                      <p className="text-white font-bold">{order.user?.name || "I panjohur"}</p>
                      <p className="text-emerald-500 text-xs font-bold">{order.shippingAddress?.phone || "Pa Telefon"}</p>
                    </td>
                    <td className="p-6 text-white font-black">{order.totalPrice.toLocaleString()} L</td>
                    <td className="p-6">{getStatusBadge(order.status)}</td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button onClick={() => setSelectedInvoice(order)} className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-[9px] font-black uppercase tracking-widest">Shiko Faturën</button>
                        
                        {/* KËTU THËRRET MODALIN E RI TË FSHIRJES PËR POROSITË */}
                        <button onClick={() => setDeleteItem({ id: order._id, type: 'order' })} className="w-full sm:w-auto px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">Fshi</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
                  <tr key={p._id} className={`transition-colors group ${p.isActive === false ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0' : 'hover:bg-slate-800/30'}`}>
                    <td className="p-6 flex items-center gap-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shadow-lg shrink-0 relative">
                        {p.isActive === false && <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center"><span className="text-[8px] font-black">FSHEHUR</span></div>}
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <p className="text-white font-bold text-sm">{p.name}</p>
                    </td>
                    <td className="p-6 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{p.category}</span>
                    </td>
                    <td className="p-6 text-white font-black whitespace-nowrap">{p.price.toLocaleString()} L</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleProductVisibility(p)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 w-24">
                          {p.isActive === false ? '👁️ Shfaq' : '🚫 Fshih'}
                        </button>
                        <button onClick={() => openEditModal(p)} className="px-4 py-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95">
                          ✏️ Modifiko
                        </button>
                        
                        {/* KËTU THËRRET MODALIN E RI TË FSHIRJES PËR PRODUKTET */}
                        <button onClick={() => setDeleteItem({ id: p._id, type: 'product' })} className="px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95">
                          Fshi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto print:static print:bg-white print:block print:overflow-visible">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 print:p-0 print:block">
            <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl relative shadow-2xl print:border-none print:shadow-none print:bg-white print:p-0 print:block">
              <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all print:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="border-b border-slate-800 print:border-slate-300 pb-6 mb-6 mt-6 sm:mt-0 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tighter mb-1 print:text-black print:bg-none">E-Marketi</h2>
                  <p className="text-slate-400 print:text-black text-xs font-bold uppercase tracking-widest">Fatura #{selectedInvoice._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-800/30 print:bg-transparent p-6 rounded-2xl border border-slate-800 print:border-slate-300 print:border-2">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-2">Klienti</h4>
                  <p className="text-white print:text-black font-bold">{selectedInvoice.user?.name || "I panjohur"}</p>
                  <p className="text-emerald-400 print:text-black font-medium text-sm mt-1">{selectedInvoice.shippingAddress?.phone}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-2">Adresa</h4>
                  <p className="text-slate-300 print:text-black text-sm leading-relaxed">{selectedInvoice.shippingAddress?.address}</p>
                </div>
              </div>
              
              <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-4">Artikujt</h4>
              <div className="bg-slate-800/50 print:bg-transparent rounded-2xl p-4 border border-slate-700/50 print:border-none mb-8 print:mb-4">
                <ul className="divide-y divide-slate-700/50 print:divide-slate-300">
                  {selectedInvoice.orderItems.map((item: any, index: number) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-700 print:hidden" />
                        <div>
                          <p className="text-white print:text-black font-bold text-sm">{item.name}</p>
                          <p className="text-slate-400 print:text-black text-xs">Sasia: {item.qty}</p>
                        </div>
                      </div>
                      <p className="text-emerald-400 print:text-black font-black">{(item.price * item.qty).toLocaleString()} L</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-800 print:border-slate-300 pt-6 mb-8 print:mb-0">
                <span className="text-slate-400 print:text-black font-bold uppercase tracking-widest text-xs">Totali Final:</span>
                <span className="text-3xl font-black text-white print:text-black">{selectedInvoice.totalPrice.toLocaleString()} L</span>
              </div>

              <div className="bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-700 print:hidden flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Ndrysho Statusin e Porosisë:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Në Pritje')} className={`py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Në Pritje' || !selectedInvoice.status ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-slate-900'}`}>Në Pritje</button>
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Po Përgatitet')} className={`py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Po Përgatitet' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white'}`}>Përgatitet</button>
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Është Rrugës')} className={`py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Është Rrugës' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500 hover:text-white'}`}>Rrugës</button>
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Porosia u dërgua')} className={`py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Porosia u dërgua' ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900'}`}>U Dërgua</button>
                </div>
                <button onClick={() => window.print()} className="w-full mt-2 px-6 py-3.5 bg-white hover:bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">🖨️ Printo Faturën</button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODALI I RI, PREMIUM, PËR FSHIRJEN (A JENI TË SIGURT?) 🚨 */}
      {deleteItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md print:hidden">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
             <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">A jeni i sigurt?</h3>
            <p className="text-slate-400 mb-8 font-medium text-sm">
              Po fshini këtë {deleteItem.type === 'order' ? 'porosi' : 'produkt'} përgjithmonë. Ky veprim nuk kthehet mbrapsht.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeleteItem(null)} className="py-3.5 px-6 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all">Anulo</button>
              <button onClick={confirmDelete} className="py-3.5 px-6 bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all">Po, Fshi</button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:hidden">
           <div className="bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-2xl my-8">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-white tracking-tight">{editingProductId ? 'Modifiko Produkt' : 'Krijo Produkt'}</h3>
               <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
             </div>
             
             <form onSubmit={handleAddOrEditProduct} className="space-y-4">
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Emri i Produktit *</label>
                 <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Çmimi *</label>
                   <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" />
                 </div>
                 <div>
                   <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Çmimi i Vjetër</label>
                   <input type="number" value={newProduct.oldPrice} onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" />
                 </div>
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Përshkrimi *</label>
                 <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 min-h-[80px]" placeholder="Përshkrimi..." />
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kategoria *</label>
                 <input type="text" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" />
               </div>

               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Foto *</label>
                    <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                      <button type="button" onClick={() => setImageMode('url')} className={`text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest transition-all ${imageMode === 'url' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>🔗 URL</button>
                      <button type="button" onClick={() => setImageMode('file')} className={`text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest transition-all ${imageMode === 'file' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>📁 Fajll</button>
                    </div>
                  </div>

                  {imageMode === 'url' ? (
                    <input type="url" required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="https://..." />
                  ) : (
                    <div className="relative">
                      <input type="file" onChange={uploadFileHandler} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all outline-none" />
                      {uploadingImage && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Në pritje...</div>}
                    </div>
                  )}
               </div>
 
               <button type="submit" className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-500/20 transition-all">
                 {editingProductId ? 'Përditëso Produktin' : 'Ruaj Produktin'}
               </button>
             </form>
           </div>
         </div>
       )}
    </>
  );
}