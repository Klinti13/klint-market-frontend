import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile'; 
import type { CartItem, Product, User } from './types';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("emarketi_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("emarketi_user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    return (parsedUser && parsedUser.token) 
      ? { ...parsedUser, isLoggedIn: true, points: parsedUser.points || 0 } 
      : { name: '', isLoggedIn: false, points: 0, isAdmin: false };
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem("emarketi_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("emarketi_user", JSON.stringify(user));
  }, [user]);

  const handleUpdatePoints = (newPoints: number) => {
    setUser(prev => ({ ...prev, points: newPoints }));
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    // 🛑 DRYNI I RI: Ndaloje direkt nëse ka më pak se 8 karaktere
    if (password.length < 8) {
      setError('❌ Fjalëkalimi duhet të ketë të paktën 8 karaktere!');
      return;
    }

    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const payload = authMode === 'login' ? { email, password } : { name, email, password };
      const { data } = await axios.post(`${API_URL}/api/users/${endpoint}`, payload);
      setUser({ ...data, isLoggedIn: true, points: data.points || 0 });      
      setIsAuthOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ndodhi një gabim. Provo përsëri.');
    }
  }

  function handleLogout() {
    setUser({ name: '', isLoggedIn: false, points: 0, isAdmin: false });
    localStorage.removeItem("emarketi_user");
    window.location.href = '#/';
  }

  function handleAddToCart(product: Product) {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prevItems, { ...product, qty: 1 }];
    });
  }

  function handleUpdateQty(id: any, newQty: number) {
    if (newQty < 1) return;
    setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, qty: newQty } : item));
  }

  function handleRemoveFromCart(id: any) {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-emerald-500/30 pb-24 sm:pb-0 relative print:bg-white">
        
        <div className="print:hidden">
          <Navbar cartCount={totalCartCount} user={user} onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); setError(''); }} onLogout={handleLogout} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} searchTerm={searchTerm} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart items={cartItems} user={user} onUpdateQty={handleUpdateQty} onRemove={handleRemoveFromCart} onClearCart={() => setCartItems([])} onUpdatePoints={handleUpdatePoints} onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }} onUpdateUser={handleUpdateUser} />} />
          
          {/* 👇 KËTU ËSHTË NDRYSHIMI: I dhamë Profilit fuqinë të përditësojë të dhënat */}
          <Route path="/profile" element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
        </Routes>

        <div className="print:hidden">
          <MobileNav cartCount={totalCartCount} user={user} onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }} onLogout={handleLogout} />
        </div>

        {isAuthOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden">
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">{authMode === 'login' ? 'Mirësevini' : 'Krijo Llogari'}</h2>
                {error && <p className="text-rose-400 text-sm font-bold bg-rose-500/10 py-2 rounded-lg mb-2">{error}</p>}
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {authMode === 'signup' && (
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white" placeholder="Emri i Plotë" />
                )}
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white" placeholder="Email" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white" placeholder="••••••••" />
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                  {authMode === 'login' ? 'Hyr në Llogari' : 'Regjistrohu Tani'}
                </button>
              </form>
              <div className="mt-8 text-center border-t border-slate-800 pt-6">
                <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-slate-400 hover:text-emerald-400 text-sm font-medium">
                  {authMode === 'login' ? "Nuk keni llogari? Regjistrohu" : "Keni llogari? Hyr këtu"}
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-10 hidden sm:block print:hidden">
          <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tighter mb-2">E-Marketi</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} Të gjitha të drejtat e rezervuara.</p>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privatësia</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Kushtet</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Kontakti</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;