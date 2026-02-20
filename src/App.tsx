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

// KJO LINJE LIDH FRONTEND-IN ME BACKEND-IN LIVE
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

  useEffect(() => {
    localStorage.setItem("emarketi_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("emarketi_user", JSON.stringify(user));
  }, [user]);

  const handleUpdatePoints = (newPoints: number) => {
    setUser(prev => ({ ...prev, points: newPoints }));
  };

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const payload = authMode === 'login' 
        ? { email, password } 
        : { name, email, password };

      // PERDORIM API_URL DINAMIKE
      const { data } = await axios.post(`${API_URL}/api/users/${endpoint}`, payload);
      
      setUser({ ...data, isLoggedIn: true });
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
        return prevItems.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...product, qty: 1 }];
    });
  }

  function handleUpdateQty(id: any, newQty: number) {
    if (newQty < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => item.id === id ? { ...item, qty: newQty } : item)
    );
  }

  function handleRemoveFromCart(id: any) {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-emerald-500/30 pb-24 sm:pb-0 relative">
        
        <Navbar 
          cartCount={totalCartCount} 
          user={user} 
          onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); setError(''); }} 
          onLogout={handleLogout} 
        />
        
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/cart" element={
            <Cart 
              items={cartItems} 
              user={user}
              onUpdateQty={handleUpdateQty} 
              onRemove={handleRemoveFromCart}
              onClearCart={() => setCartItems([])}
              onUpdatePoints={handleUpdatePoints}
              onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }}
            />
          } />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>

        <MobileNav 
          cartCount={totalCartCount} 
          user={user} 
          onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }} 
          onLogout={handleLogout} 
        />

        {/* MODALI I LOGIMIT (PA NDRYSHIME NE DIZAJN) */}
        {isAuthOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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
      </div>
    </Router>
  );
}

export default App;