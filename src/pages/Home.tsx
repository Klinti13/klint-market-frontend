import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import type { Product } from '../types';

interface HomeProps {
  onAddToCart: (product: Product) => void;
  searchTerm?: string; 
}

export default function Home({ onAddToCart, searchTerm = '' }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // LOGJIKA E TOASTER (SHTUAR)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);        
        const dbProducts = response.data.map((p: any) => ({
          ...p,
          id: p._id,
          image: p.imageUrl
        }));
        
        setProducts(dbProducts);
        setLoading(false);
      } catch (error) {
        console.error("❌ Gabim gjatë marrjes nga Databaza:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FUNKSIONI PËR TË SHTUAR NË SHPORTË DHE PËR TË SHFAQUR TOAST-IN
  const handleAddToCartWithToast = (product: Product) => {
    onAddToCart(product);
    setToastMessage(`Shtuar në shportë: ${product.name}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Zhduket pas 3 sekondash
  };
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.category.toLowerCase().includes(lower)
    );
  }, [products, searchTerm]);

  const offers = useMemo(() => filteredProducts.filter(p => p.oldPrice), [filteredProducts]);
  const regularProducts = useMemo(() => filteredProducts.filter(p => !p.oldPrice), [filteredProducts]);

  const groupedProducts = useMemo(() => {
    return regularProducts.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [regularProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-emerald-500 font-bold animate-pulse tracking-widest uppercase">
          Duke u lidhur me Databazën...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 relative">
      
      {/* TOAST NOTIFICATION (SHTUAR) */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-emerald-500/90 backdrop-blur-sm text-slate-900 font-black px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="uppercase tracking-widest text-xs">{toastMessage}</span>
          </div>
        </div>
      )}

      {!searchTerm && (
        <div className="relative w-full h-72 sm:h-96 rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-emerald-500/10 group">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80" alt="Supermarket" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          <div className="absolute inset-0 p-8 sm:p-16 flex flex-col justify-center max-w-2xl">
            <span className="bg-emerald-500 text-slate-900 font-black uppercase tracking-widest text-xs px-4 py-1.5 rounded-full w-max mb-6">Ekskluzive</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-[1.1]">Zbuloni Ofertat e <br/><span className="text-emerald-400">Produkteve 100% Bio</span></h1>
            <p className="text-slate-300 text-lg sm:text-xl font-medium">Cilësi e garantuar. Zgjidhni më të mirën për familjen tuaj.</p>
          </div>
        </div>
      )}

      {searchTerm && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-xl font-bold">Nuk u gjet asnjë produkt për "{searchTerm}"</p>
        </div>
      )}

      {offers.length > 0 && (
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-rose-400 uppercase tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Ofertat e Ditës
            </h2>
            <div className="h-px bg-gradient-to-r from-rose-500/50 to-transparent flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCartWithToast} isOffer={true} />
            ))}
          </div>
        </div>
      )}

      <div id="kategorite" className="space-y-20 pt-8">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-wider">{category}</h2>
              <div className="h-px bg-slate-800 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCartWithToast} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, isOffer = false }: { product: Product, onAddToCart: (p: Product) => void, isOffer?: boolean }) {
  return (
    <div className={`bg-slate-800/40 rounded-[1.5rem] overflow-hidden hover:bg-slate-800/80 transition-all duration-300 group flex flex-col relative border ${isOffer ? 'border-rose-500/30 hover:border-rose-400' : 'border-slate-700/50 hover:border-emerald-500/50'} hover:shadow-2xl`}>
      
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${isOffer ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          {product.badge}
        </div>
      )}

      <div className="h-56 overflow-hidden relative p-4 pb-0">
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 leading-tight mb-3 line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl font-black ${isOffer ? 'text-rose-400' : 'text-emerald-400'}`}>{product.price} L</span>
            {product.oldPrice && (
              <span className="text-sm font-semibold text-slate-500 line-through">{product.oldPrice} L</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          className={`w-full text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 border ${isOffer ? 'bg-rose-500/10 hover:bg-rose-500 border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white' : 'bg-emerald-500/10 hover:bg-emerald-500 border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white'}`}
        >
          Shto në Shportë
        </button>
      </div>
    </div>
  );
}