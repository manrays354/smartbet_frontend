import { useState, FormEvent, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Lock, Crown, Zap, ChevronRight, Phone, X, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.com';

const PaymentModal = memo(({ isOpen, onClose, onPay, isPaying }: any) => {
  const [localPhone, setLocalPhone] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X /></button>
        <Zap className="text-amber-500 mb-6" size={32} fill="currentColor" />
        <h3 className="text-2xl font-black italic uppercase text-white mb-2">Unlock VIP</h3>
        <p className="text-slate-400 text-xs mb-8 font-bold uppercase tracking-widest">Enter M-Pesa Number</p>
        <form onSubmit={(e) => { e.preventDefault(); onPay(localPhone); }} className="space-y-4">
          <input 
            type="tel" required placeholder="2547..." value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-white focus:ring-2 ring-amber-500 outline-none"
          />
          <button type="submit" disabled={isPaying} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
            {isPaying ? "SENDING..." : "PAY KES 200 NOW"}
          </button>
        </form>
      </motion.div>
    </div>
  );
});

export default function App() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', userPhone],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}`, { params: { phone: userPhone } });
      return res.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500 w-5 h-5" />
          <h1 className="text-lg font-black uppercase italic tracking-tighter">SmartBets <span className="text-amber-500">Pro</span></h1>
        </div>
        <button onClick={() => refetch()} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-500 transition-colors">
          <RefreshCw size={18} />
        </button>
      </nav>

      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-grow">
        {/* VIP HERO CARD */}
        {view === 'today' && !data?.has_paid_today && (
          <div className="mb-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2.5rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4 uppercase italic leading-none">VIP<br/>Board</h2>
              <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl">
                Unlock Access <ChevronRight size={16}/>
              </button>
            </div>
            <Crown className="absolute -right-4 -bottom-4 w-32 h-32 text-black/10 rotate-12" />
          </div>
        )}

        {/* MODERN TABS */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl mb-8 border border-slate-800">
          <button onClick={() => setView('today')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'today' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>Today</button>
          <button onClick={() => setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'}`}>History</button>
        </div>

        {/* STATUS BAR */}
        {data?.has_paid_today && (
            <div className="mb-6 flex items-center gap-2 bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">VIP Membership Active</span>
            </div>
        )}

        <div className="grid gap-4">
          {data?.games?.map((game: any) => {
            const isLocked = game.is_premium && !data.has_paid_today;
            return (
              <div key={game.id} className="p-5 bg-slate-900 rounded-[2.2rem] border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">{game.is_premium ? 'VIP Content' : 'Standard'}</span>
                    <h4 className="font-bold text-white text-sm mt-1 leading-tight">{game.title}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                  <div className="bg-slate-950 p-4 rounded-2xl relative">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Tip</p>
                    <p className={`font-black text-white text-xs ${isLocked ? 'blur-md' : ''}`}>
                      {game.is_premium ? game.premium_analysis : game.free_summary}
                    </p>
                    {isLocked && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500/50" size={16} />}
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-2xl relative">
                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Odds</p>
                    <p className={`font-black text-amber-500 text-xs ${isLocked ? 'blur-md' : ''}`}>{game.odds}</p>
                    {isLocked && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500/50" size={16} />}
                  </div>
                </div>
                {isLocked && <button onClick={() => setIsModalOpen(true)} className="absolute inset-0 z-0 bg-transparent w-full" />}
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING STATUS CHECK */}
      {userPhone && !data?.has_paid_today && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center justify-between z-20">
           <div className="flex flex-col pl-2">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest tracking-tighter">Account</span>
              <span className="text-[10px] font-black text-white">{userPhone}</span>
           </div>
           <button onClick={() => refetch()} className="bg-amber-500 text-slate-900 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest">
             Check Status
           </button>
        </div>
      )}

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPay={(phone: string) => { setIsPaying(true); /* API Call Logic */ }} isPaying={isPaying} />
    </div>
  );
}
