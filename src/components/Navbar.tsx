import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../types';

interface NavbarProps {
  cartCount: number;
  user: User;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export default function Navbar({ cartCount, user, onOpenAuth, onLogout, searchTerm, onSearchChange }: NavbarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // FUNKSIONI QE BEN SCROLL-IN INTELIGJENT
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 1. Nëse nuk jemi në faqen kryesore, shkojmë njëherë atje
    if (location.pathname !== '/') {
      navigate('/');
      // I japim pak kohë faqes të ngarkohet para se të zbresim poshtë
      setTimeout(() => {
        const element = document.getElementById('kategorite');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      // 2. Nëse jemi te Home, thjesht zbresim poshtë "Smooth"
      const element = document.getElementById('kategorite');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tighter shrink-0">
          E-Marketi
        </Link>
        
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative group">
            <input 
              type="text" 
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Kërko produkte..." 
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-full py-2.5 px-5 pl-12 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all focus:bg-slate-800 placeholder:text-slate-500 shadow-inner"
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-bold mr-2">
            <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">Marketi</Link>
            
            {/* KETU NDRYSHUAM LINKUN E KATEGORIVE */}
            <button 
              onClick={handleCategoryClick} 
              className="text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px] font-bold"
            >
              Kategoritë
            </button>

            <Link to="/about" className="text-slate-300 hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">Historia</Link>
          </div>
          
          <div className="hidden lg:block h-6 w-px bg-slate-700"></div>

          {user.isLoggedIn ? (
            <div className="flex items-center gap-4 sm:gap-6">
              {user.isAdmin && (
                <Link to="/admin" className="hidden sm:block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-all shadow-lg">
                  Admin
                </Link>
              )}

              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/5">
                  <span className="text-emerald-400 group-hover:text-slate-900 font-black text-sm uppercase">{user.name[0]}</span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-slate-300 text-sm font-bold group-hover:text-emerald-400 transition-colors">{user.name}</span>
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{user.points || 0} Pikë</span>
                </div>
              </Link>

              <button onClick={() => setShowConfirm(true)} className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors">
                Dil
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full border border-slate-700 transition-all shadow-lg">
              Hyr
            </button>
          )}

          <Link to="/cart" className="relative flex items-center bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full transition-all border border-emerald-500/20 group">
            <svg className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="mt-4 md:hidden">
        <div className="relative group">
          <input 
            type="text" 
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Kërko produkte..." 
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 pl-12 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
          />
          <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2">A jeni i sigurt?</h3>
            <p className="text-slate-400 mb-8 font-medium italic">Do të shkëputeni nga llogaria juaj.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirm(false)} className="py-3 px-6 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 font-bold rounded-xl text-sm">Anulo</button>
              <button onClick={() => { onLogout(); setShowConfirm(false); }} className="py-3 px-6 bg-rose-600 hover:bg-rose-500 transition-colors text-white font-bold rounded-xl text-sm">Po, Dil</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}