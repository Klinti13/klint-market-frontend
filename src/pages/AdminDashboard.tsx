import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); 
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = activeTab === 'orders' ? 'orders' : 'products';
      await axios.delete(`${API_URL}/api/${endpoint}/${orderToDelete}`, config);
      setOrderToDelete(null); 
      fetchData(); 
    } catch (err) { alert("Gabim gjatë fshirjes."); setOrderToDelete(null); }
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
    } catch (err) { alert("❌ Gabim gjatë shtimit të produktit."); }
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
    if (!searchTerm) return orders;
    return orders.filter(o => 
      o.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.shippingAddress?.phone.includes(searchTerm) ||
      o._id.includes(searchTerm)
    );
  }, [orders, searchTerm]);

  if (!user.isAdmin) return <div className="p-20 text-center text-rose-500 font-black tracking-widest uppercase">Aksesi i Mohuar!</div>;

  return (
    // Përdorim Fragment <> për ta ndarë Adminin nga Fatura gjatë printimit
    <>
      {/* 1. PJESA KRYESORE E ADMINIT (Fshihet kur hapim faturën për të printuar) */}
      <div className={`max-w-7xl mx-auto p-4 sm:p-6 pb-24 relative ${selectedInvoice ? 'print:hidden' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter">Qendra e <span className="text-emerald-500">Komandës</span></h1>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={exportToExcel}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-emerald-400 font-black uppercase tracking-widest px-6 py-3 rounded-xl border border-slate-700 transition-all text-xs flex items-center justify-center gap-2"
            >
              📊 Shkarko Bilancin
            </button>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
            >
              Shto Produkt
            </button>
          </div>
        </div>

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
          
          {activeTab === 'orders' && (
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Kërko klient ose tel..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-4 pl-10 text-xs text-white focus:border-emerald-500 outline-none transition-all"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          )}
        </div>

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
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                        order.status === 'Porosia u dërgua' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        order.status === 'Porosia u mor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>{order.status || 'Në Pritje'}</span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button 
                          onClick={() => setSelectedInvoice(order)} 
                          className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          Shiko Faturën
                        </button>
                        <button 
                          onClick={() => setOrderToDelete(order._id)} 
                          className="w-full sm:w-auto px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          Fshi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Nuk u gjet asnjë porosi.</td>
                  </tr>
                )}
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
                  <tr key={p._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-6 flex items-center gap-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shadow-lg shrink-0">
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <p className="text-white font-bold text-sm">{p.name}</p>
                    </td>
                    <td className="p-6 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{p.category}</span>
                    </td>
                    <td className="p-6 text-white font-black whitespace-nowrap">{p.price.toLocaleString()} L</td>
                    <td className="p-6 text-right">
                      <button onClick={() => setOrderToDelete(p._id)} className="px-4 py-2.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest active:scale-95">
                        Fshi Produktin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 2. MODALI I FATURËS - Struktura u rregullua që të bëjë scroll lirshëm në Celular */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto print:static print:bg-white print:block print:overflow-visible">
          {/* Ky div bën të mundur scroll-in pa u prerë lart */}
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 print:p-0 print:block">
            
            <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl relative shadow-2xl print:border-none print:shadow-none print:bg-white print:p-0 print:block">
              
              {/* Butoni i Mbylljes i futur brenda kutisë për të qenë gjithmonë i kapshëm */}
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all print:hidden"
                aria-label="Mbyll Faturën"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="border-b border-slate-800 print:border-slate-300 pb-6 mb-6 mt-6 sm:mt-0">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tighter mb-1 print:text-black print:bg-none">E-Marketi</h2>
                <p className="text-slate-400 print:text-black text-xs font-bold uppercase tracking-widest">Fatura #{selectedInvoice._id.slice(-8).toUpperCase()}</p>
                <p className="text-slate-500 print:text-black text-[10px] mt-1">{new Date(selectedInvoice.createdAt).toLocaleString('sq-AL')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-800/30 print:bg-transparent p-6 rounded-2xl border border-slate-800 print:border-slate-300 print:border-2">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-2">Të dhënat e Klientit</h4>
                  <p className="text-white print:text-black font-bold">{selectedInvoice.user?.name || "I panjohur"}</p>
                  <p className="text-emerald-400 print:text-black font-medium text-sm mt-1">{selectedInvoice.shippingAddress?.phone}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-2">Adresa e Dërgesës</h4>
                  <p className="text-slate-300 print:text-black text-sm leading-relaxed">{selectedInvoice.shippingAddress?.address}</p>
                  <p className="text-slate-400 print:text-black text-xs mt-1">{selectedInvoice.shippingAddress?.city}</p>
                </div>
              </div>

              <h4 className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest mb-4">Artikujt e Porositur</h4>
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

              {/* ZGJIDHJA 3: BUTONI I PRINTIMIT TANI ËSHTË NË FUND BASHKË ME STATUSIN */}
              <div className="bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <button 
                  onClick={() => window.print()} 
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  🖨️ Printo Faturën
                </button>
                
                <div className="flex w-full sm:w-auto gap-2">
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Porosia u mor')} className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Porosia u mor' ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500 hover:text-white'}`}>U Mor</button>
                  <button onClick={() => updateStatus(selectedInvoice._id, 'Porosia u dërgua')} className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedInvoice.status === 'Porosia u dërgua' ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-900'}`}>U Dërgua</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modalet e tjera */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Fshi {activeTab === 'orders' ? 'Porosinë' : 'Produktin'}</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Ky veprim nuk mund të kthehet mbrapsht.</p>
            <div className="flex gap-4">
              <button onClick={() => setOrderToDelete(null)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl text-sm uppercase">Anulo</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white font-black rounded-xl text-sm uppercase shadow-lg shadow-rose-500/20 active:scale-95">Konfirmo</button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:hidden">
           <div className="bg-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 w-full max-w-md shadow-2xl my-8">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-black text-white tracking-tight">Krijo Produkt</h3>
               <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
             </div>
             
             <form onSubmit={handleAddProduct} className="space-y-4">
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Emri i Produktit *</label>
                 <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="p.sh. Këmishë..." />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Çmimi *</label>
                   <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="1500" />
                 </div>
                 <div>
                   <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Çmimi i Vjetër</label>
                   <input type="number" value={newProduct.oldPrice} onChange={e => setNewProduct({...newProduct, oldPrice: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="2000" />
                 </div>
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Përshkrimi *</label>
                 <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 min-h-[80px]" placeholder="Përshkrimi..." />
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Kategoria *</label>
                 <input type="text" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="Veshje, Bio..." />
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Etiketa (Badge)</label>
                 <input type="text" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="E Re, Ekskluzive..." />
               </div>
 
               <div>
                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Linku i Fotos (URL) *</label>
                 <input type="url" required value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="https://..." />
               </div>
 
               <button type="submit" className="w-full mt-6 py-4 bg-emerald-500 text-slate-900 font-black rounded-xl uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-500/20">
                 Ruaj Produktin
               </button>
             </form>
           </div>
         </div>
       )}

    </>
  );
}