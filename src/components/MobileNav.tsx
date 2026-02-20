import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../types';

interface MobileNavProps {
  cartCount: number;
  user: User;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function MobileNav({ cartCount, user, onOpenAuth, onLogout }: MobileNavProps) {
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false); 

  const getLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
      isActive ? 'text-emerald-400' : 'text-slate-500'
    }`;
  };

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/50 z-50 px-1 pt-2 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <div className="flex justify-around items-center max-w-md mx-auto h-16">
          
          {/* DYQANI */}
          <Link to="/" className={getLinkStyle('/')}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/' ? 'bg-emerald-500/10' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Dyqani</span>
          </Link>

          {/* HISTORIA (SHTUAR KËTU) */}
          <Link to="/about" className={getLinkStyle('/about')}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/about' ? 'bg-emerald-500/10' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Historia</span>
          </Link>

          {/* SHPORTA */}
          <Link to="/cart" className={getLinkStyle('/cart')}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-2xl relative transition-all ${location.pathname === '/cart' ? 'bg-emerald-500/10' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-slate-900">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Shporta</span>
          </Link>

          {/* ADMIN */}
          {user.isAdmin && (
            <Link to="/admin" className={getLinkStyle('/admin')}>
              <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-emerald-500/10' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
            </Link>
          )}

          {/* PROFILI & DIL */}
          {user.isLoggedIn ? (
            <>
              <Link to="/profile" className={getLinkStyle('/profile')}>
                <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/profile' ? 'bg-emerald-500/10' : ''}`}>
                   <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-slate-900 border border-emerald-400/30 leading-none uppercase">
                    {user.name[0]}
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Profili</span>
              </Link>
              
              <button onClick={() => setShowConfirm(true)} className="flex flex-col items-center justify-center gap-1 text-slate-500">
                <div className="w-9 h-9 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-500/80">Dil</span>
              </button>
            </>
          ) : (
            <button onClick={onOpenAuth} className="flex flex-col items-center justify-center gap-1 text-slate-500">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Hyr</span>
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md sm:hidden">
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
             <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">A jeni i sigurt?</h3>
            <p className="text-slate-400 mb-8 font-medium text-sm">Do të shkëputeni nga llogaria juaj e E-Marketit.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirm(false)} className="py-3.5 px-6 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest">Anulo</button>
              <button onClick={() => { onLogout(); setShowConfirm(false); }} className="py-3.5 px-6 bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20">Po, Dil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}