import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import type { CartItem, Product, User } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("emarketi_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("emarketi_user");
    return savedUser ? JSON.parse(savedUser) : { name: '', isLoggedIn: false };
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    localStorage.setItem("emarketi_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("emarketi_user", JSON.stringify(user));
  }, [user]);

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    
    let extractedName = email.split('@')[0];
    extractedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
    
    setUser({ name: extractedName, isLoggedIn: true });
    setIsAuthOpen(false);
    setEmail('');
    setPassword('');
  }

  function handleLogout() {
    setUser({ name: '', isLoggedIn: false });
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

  function handleUpdateQty(id: number, newQty: number) {
    if (newQty < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => item.id === id ? { ...item, qty: newQty } : item)
    );
  }

  function handleRemoveFromCart(id: number) {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-emerald-500/30 pb-24 sm:pb-0 relative">
        
        <Navbar 
          cartCount={totalCartCount} 
          user={user} 
          onOpenAuth={() => setIsAuthOpen(true)} 
          onLogout={handleLogout} 
        />
        
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route path="/cart" element={
            <Cart 
              items={cartItems} 
              user={user}
              onUpdateQty={handleUpdateQty} 
              onRemove={handleRemoveFromCart} 
            />
          } />
        </Routes>

        <MobileNav 
          cartCount={totalCartCount} 
          user={user} 
          onOpenAuth={() => setIsAuthOpen(true)} 
          onLogout={handleLogout} 
        />

        {isAuthOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">
                  {authMode === 'login' ? 'Mirësevini' : 'Krijo Llogari'}
                </h2>
                <p className="text-slate-400 font-medium">
                  {authMode === 'login' ? 'Identifikohu për të vazhduar blerjet' : 'Regjistrohu për të përfituar ofertat'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white transition-colors"
                    placeholder="emri@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Fjalëkalimi</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 mt-4">
                  {authMode === 'login' ? 'Hyr' : 'Regjistrohu'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  {authMode === 'login' ? "S'ke llogari? Regjistrohu" : "Ke llogari? Hyr këtu"}
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