import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 transition-colors duration-300">
      {/* HEADER ME FOTO DHE GRADIENT (Ky mbetet gjithmonë i Errët për efekt Premium) */}
      <div className="relative w-full h-80 sm:h-[30rem] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl border border-slate-200 dark:border-slate-700/50 transition-colors">
        <img 
          src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1600&auto=format&fit=crop" 
          alt="E-Market Store" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-transparent dark:from-[#0b1120] dark:via-[#0b1120]/60 dark:to-transparent transition-colors duration-300"></div>
        <div className="absolute inset-0 p-8 sm:p-16 flex flex-col justify-end">
          <span className="text-emerald-400 dark:text-emerald-500 font-black uppercase tracking-[0.3em] text-xs mb-4 block shadow-sm">Historia Jonë</span>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tighter drop-shadow-md">
            Cilësi e Parakaluar.
          </h1>
        </div>
      </div>

      {/* HISTORIA DHE VIZIONI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 items-center">
        <div className="space-y-8">
          <p className="text-slate-700 dark:text-slate-300 text-lg sm:text-xl leading-relaxed font-medium transition-colors">
            E-Market lindi nga një nevojë e thjeshtë: t'i ofrojmë tregut produkte të një standardi elitar, pa kompromis. Ne nuk jemi thjesht një dyqan online, jemi një standard i ri i tregtisë.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
            Nga produktet 100% Bio e deri te veshjet me prerje ekskluzive, çdo artikull në platformën tonë kalohet nën një filtër të rreptë cilësie. Synimi ynë është t'ju sjellim luksin e qëndrueshëm dhe estetikën e pastër ("Old Money") direkt në shtëpinë tuaj.
          </p>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="text-slate-900 dark:text-white font-black text-xl mb-4 transition-colors">Pse të zgjidhni ne?</h3>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
                Selektojmë vetëm materialet më premium.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
                Shërbim klienti dhe dorëzim prioritar.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
                Program besnikërie me pikë për çdo blerje.
              </li>
            </ul>
          </div>
          
          <Link to="/" className="inline-block mt-8 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            Eksploro Produktet
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 mt-8">
            <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Detail 1" className="w-full h-48 sm:h-64 object-cover rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl transition-all" />
            <img src="https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Detail 2" className="w-full h-32 sm:h-48 object-cover rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl transition-all" />
          </div>
          <div className="space-y-4">
            <img src="https://images.unsplash.com/photo-1601599561213-832382fd07ba?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Detail 3" className="w-full h-32 sm:h-48 object-cover rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl transition-all" />
            <img src="https://images.unsplash.com/photo-1770392171407-28f7de0aa258?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Detail 4" className="w-full h-48 sm:h-64 object-cover rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}