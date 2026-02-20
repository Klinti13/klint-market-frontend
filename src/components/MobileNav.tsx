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

  // Funksion i blinduar per stilin
  const getLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
      isActive ? 'text-emerald-400' : 'text-slate-500'
    }`;
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/50 z-50 px-2 pt-2 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        
        {/* DYQANI */}
        <Link to="/" className={getLinkStyle('/')}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/' ? 'bg-emerald-500/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Dyqani</span>
        </Link>

        {/* SHPORTA */}
        <Link to="/cart" className={getLinkStyle('/cart')}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-2xl relative transition-all ${location.pathname === '/cart' ? 'bg-emerald-500/10' : ''}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-slate-900">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Shporta</span>
        </Link>

        {/* ADMIN (Vetem nese eshte Klinti Boss) */}
        {user.isAdmin && (
          <Link to="/admin" className={getLinkStyle('/admin')}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-emerald-500/10' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
          </Link>
        )}

        {/* PROFILI - KETU U BASHKUAN TELAT */}
        {user.isLoggedIn ? (
          <Link to="/profile" className={getLinkStyle('/profile')}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${location.pathname === '/profile' ? 'bg-emerald-500/10' : ''}`}>
               <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-900 border border-emerald-400/30 leading-none">
                {user.name[0].toUpperCase()}
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Profili</span>
          </Link>
        ) : (
          <button onClick={onOpenAuth} className="flex flex-col items-center justify-center gap-1 text-slate-500">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Hyr</span>
          </button>
        )}
      </div>
    </div>
  );
}