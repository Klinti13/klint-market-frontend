import { Link } from 'react-router-dom';
import type { User } from '../types';

interface NavbarProps {
  cartCount: number;
  user: User;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Navbar({ cartCount, user, onOpenAuth, onLogout }: NavbarProps) {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-center sm:justify-between items-center">
        
        <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tighter">
          E-Marketi
        </Link>
        
        <div className="hidden sm:flex items-center gap-8">
          <Link to="/" className="text-slate-300 hover:text-emerald-400 transition-colors font-semibold tracking-wide">
            Marketi
          </Link>
          
          <div className="h-6 w-px bg-slate-700"></div>

          {user.isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-300 font-medium">
                Përshëndetje, <span className="text-emerald-400 font-bold">{user.name}</span>
              </span>
              <button 
                onClick={onLogout}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors"
              >
                Dil
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-slate-700 transition-all"
            >
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
      
    </nav>
  );
} 