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

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("emarketi_theme");
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('emarketi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('emarketi_theme', 'light');
    }
  }, [isDarkMode]);

  // 🛡️ SHTUAM GJENDJEN "verify" DHE KODIN OTP
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); // Kodi 6-shifror
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Për t'i thënë që "Emaili u nis!"
  
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

  const resetAuthStates = () => {
    setIsAuthOpen(false);
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setError('');
    setSuccessMsg('');
  };

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // 1. REGJISTRIMI
    if (authMode === 'signup') {
      if (password.length < 8) {
        setError('❌ Fjalëkalimi duhet të ketë të paktën 8 karaktere!');
        return;
      }
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      if (!hasLetter || !hasNumber) {
        setError('❌ Fjalëkalimi duhet të ketë të paktën 1 shkronjë dhe 1 numër!');
        return;
      }

      try {
        const { data } = await axios.post(`${API_URL}/api/users/register`, { name, email, password });
        setSuccessMsg(data.message); // Shfaqim "Një kod u nis në email..."
        setAuthMode('verify');       // Kalojmë dritaren te kërkimi i kodit
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ndodhi një gabim gjatë regjistrimit.');
      }
      return;
    }

    // 2. VERIFIKIMI I KODIT OTP
    if (authMode === 'verify') {
      try {
        const { data } = await axios.post(`${API_URL}/api/users/verify-otp`, { email, otp });
        // Sapo verifikohet, e logojmë direkt brenda
        setUser({ ...data, isLoggedIn: true, points: data.points || 0 });      
        resetAuthStates();
      } catch (err: any) {
        setError(err.response?.data?.message || '❌ Kodi është i gabuar ose ka skaduar.');
      }
      return;
    }

    // 3. LOGIMI NORMAL
    if (authMode === 'login') {
      try {
        const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
        setUser({ ...data, isLoggedIn: true, points: data.points || 0 });      
        resetAuthStates();
      } catch (err: any) {
        setError(err.response?.data?.message || '❌ Email ose fjalëkalim i gabuar.');
      }
      return;
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
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-24 sm:pb-0 relative print:bg-white transition-colors duration-300">
        
        <div className="print:hidden">
          <Navbar 
            cartCount={totalCartCount} 
            user={user} 
            onOpenAuth={() => { resetAuthStates(); setIsAuthOpen(true); setAuthMode('login'); }} 
            onLogout={handleLogout} 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        </div>
        
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} searchTerm={searchTerm} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart items={cartItems} user={user} onUpdateQty={handleUpdateQty} onRemove={handleRemoveFromCart} onClearCart={() => setCartItems([])} onUpdatePoints={handleUpdatePoints} onOpenAuth={() => { resetAuthStates(); setIsAuthOpen(true); setAuthMode('login'); }} onUpdateUser={handleUpdateUser} />} />
          <Route path="/profile" element={<Profile user={user} onUpdateUser={handleUpdateUser} />} />
        </Routes>

        <div className="print:hidden">
          <MobileNav cartCount={totalCartCount} user={user} onOpenAuth={() => { resetAuthStates(); setIsAuthOpen(true); setAuthMode('login'); }} onLogout={handleLogout} />
        </div>

        {/* MODAL I HYRJES / REGJISTRIMIT / VERIFIKIMIT */}
        {isAuthOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm print:hidden transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 transition-colors duration-300">
              <button onClick={resetAuthStates} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {authMode === 'login' ? 'Mirësevini' : authMode === 'signup' ? 'Krijo Llogari' : 'Verifiko Emailin'}
                </h2>
                {error && <p className="text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-100 dark:bg-rose-500/10 py-2 rounded-lg mb-2">{error}</p>}
                {successMsg && <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-100 dark:bg-emerald-500/10 py-2 rounded-lg mb-2">{successMsg}</p>}
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                
                {/* FORMA E REGJISTRIMIT & LOGIN */}
                {authMode !== 'verify' && (
                  <>
                    {authMode === 'signup' && (
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors duration-300" placeholder="Emri i Plotë" />
                    )}
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors duration-300" placeholder="Email" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors duration-300" placeholder="••••••••" />
                  </>
                )}

                {/* FORMA E VERIFIKIMIT OTP */}
                {authMode === 'verify' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center font-medium">Shkruani kodin 6-shifror që ju dërguam në <strong className="text-slate-800 dark:text-white">{email}</strong>.</p>
                    <input 
                      type="text" 
                      maxLength={6} 
                      required 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} // Lejon vetëm numra
                      className="w-full p-4 text-center text-3xl tracking-[0.5em] font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" 
                      placeholder="000000" 
                    />
                  </div>
                )}

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                  {authMode === 'login' ? 'Hyr në Llogari' : authMode === 'signup' ? 'Regjistrohu Tani' : 'Verifiko Llogarinë'}
                </button>
              </form>

              {/* BUTONAT E NDËRRIMIT (POSHTË) */}
              {authMode !== 'verify' && (
                <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-800 pt-6 transition-colors duration-300">
                  <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }} className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-sm font-bold">
                    {authMode === 'login' ? "Nuk keni llogari? Regjistrohu" : "Keni llogari? Hyr këtu"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-10 hidden sm:block print:hidden transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 tracking-tighter mb-2">E-Marketi</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} Të gjitha të drejtat e rezervuara.</p>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Privatësia</a>
              <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Kushtet</a>
              <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Kontakti</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;