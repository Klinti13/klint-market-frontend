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
  
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 px-6 py-4 flex justify-between items-center pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      
      <Link to="/" className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span className="text-[10px] font-black tracking-widest uppercase">Marketi</span>
      </Link>
      
      <Link to="/cart" className={`relative flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/cart' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-slate-900">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black tracking-widest uppercase">Shporta</span>
      </Link>

      <button onClick={user.isLoggedIn ? onLogout : onOpenAuth} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <span className="text-[10px] font-black tracking-widest uppercase">{user.isLoggedIn ? 'Dil' : 'Hyr'}</span>
      </button>

    </div>
  );
}