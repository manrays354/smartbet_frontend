import { useState, useMemo, FormEvent } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Lock, Crown, Zap, ShieldCheck, ChevronRight, 
  Phone, X, Mail, Twitter, Instagram, Send, AlertTriangle, 
  CheckCircle2, TrendingUp, Calendar, History
} from 'lucide-react';
import axios from 'axios';

const queryClient = new QueryClient();
const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.com';

function GameAnalysisApp() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await axios.get(`https://smartbet-backend-mgqo.onrender.com/pay/`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,       // Data stays "fresh" for 5 minutes
    refetchInterval: 1000 * 60 * 10, // Only auto-refresh every 10 mins (was 30s)
    refetchOnWindowFocus: false,     // Stop fetching when user switches tabs
  });

  const gamesList = data?.games || [];
  const hasPaidToday = data?.has_paid_today || false;

  const filteredAndGrouped = useMemo(() => {
    if (!Array.isArray(gamesList)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = gamesList.filter(game => {
      const gameDate = new Date(game.match_date);
      const isHistory = gameDate < today;
      return view === 'today' ? !isHistory : isHistory;
    });

    const groups: Record<string, { pro: any[], free: any[] }> = {};
    filtered.forEach(game => {
      const dateLabel = new Date(game.match_date).toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'short' 
      }).toUpperCase();
      if (!groups[dateLabel]) groups[dateLabel] = { pro: [], free: [] };
      if (game.is_premium) groups[dateLabel].pro.push(game);
      else groups[dateLabel].free.push(game);
    });
    return Object.entries(groups);
  }, [gamesList, view]);

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      await axios.post(`https://smartbet-backend-mgqo.onrender.com/pay/`, { phone: phoneNumber });
      alert("M-Pesa STK Push Sent! Enter PIN.");
      setIsModalOpen(false);
    } catch (err) { alert("Try again."); } finally { setIsPaying(false); }
  };

  if (isLoading && !data) return <div className="h-screen flex items-center justify-center font-black text-slate-200 animate-pulse text-[10px] tracking-[0.3em]">SYNCING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans text-slate-900 flex flex-col">
      <nav className="bg-white border-b sticky top-0 z-50 py-3 px-4 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500 w-5 h-5" strokeWidth={3} />
          <h1 className="text-lg font-black tracking-tighter uppercase italic">SmartBets <span className="text-amber-500">Pro</span></h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
          <TrendingUp size={12} className="text-green-600" />
          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">94% ACCURACY</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-grow">
        {/* HERO */}
        {view === 'today' && !hasPaidToday && (
          <div className="mb-10 bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border-b-8 border-amber-500">
            <div className="relative z-10">
              <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">The Daily Banker</span>
              <h2 className="text-3xl font-black mt-3 mb-2 leading-none italic uppercase">VIP Slip</h2>
              <button onClick={() => setIsModalOpen(true)} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase shadow-xl">
                UNLOCK VIP BOARD <ChevronRight size={16}/>
              </button>
            </div>
            <Crown className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
          </div>
        )}

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
          <button onClick={() => setView('today')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Board</button>
          <button onClick={() => setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Results</button>
        </div>

        {filteredAndGrouped.map(([date, segments]) => (
          <div key={date} className="mb-14">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 text-center">{date}</h3>
            
            <div className="space-y-6">
              {/* PRO SECTION: CLICKABLE TO UNLOCK */}
              {segments.pro.map((game) => {
                const isLocked = !hasPaidToday && view === 'today';
                return (
                  <div 
                    key={game.id} 
                    onClick={() => isLocked && setIsModalOpen(true)}
                    className={`rounded-[2.2rem] border p-6 transition-all cursor-pointer ${isLocked ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.02]' : 'bg-white border-slate-100 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase bg-amber-500 text-slate-900">VIP</span>
                      {!isLocked ? (
                        <span className="text-amber-500 font-black text-sm">{game.odds}</span>
                      ) : (
                        <span className="text-slate-700 font-black text-[9px] uppercase tracking-widest bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                          <Lock size={10}/> Odds Hidden
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold mb-5 italic tracking-tight">{game.title}</h4>
                    <div className={`p-5 rounded-3xl border ${isLocked ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Expert Verdict</p>
                      <p className={`font-black text-lg ${isLocked ? 'text-amber-500 blur-md select-none' : 'text-slate-700 italic'}`}>
                        {isLocked ? "LOCKED_WINNER" : game.predicted_outcome}
                      </p>
                    </div>
                    {isLocked && (
                        <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            Click card to reveal slip
                        </div>
                    )}
                  </div>
                );
              })}

              {/* FREE SECTION */}
              {segments.free.map((game) => (
                <div key={game.id} className="bg-white border border-slate-100 rounded-[2.2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">Free Board</span>
                    <span className="text-blue-600 font-black text-sm">{game.odds}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-5 italic leading-tight">{game.title}</h4>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Expert Verdict</p>
                      <p className="font-bold text-slate-700 text-lg uppercase tracking-tight">{game.predicted_outcome}</p>
                    </div>
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <footer className="bg-[#0f172a] text-white pt-20 pb-12 px-6 md:px-16 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div>
            <h2 className="text-lg font-black uppercase italic text-amber-500 mb-6">SmartBets Pro</h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">Daily Banker slips and professional intelligence for Kenyan winners.</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Navigator</h3>
            <ul className="space-y-3 text-xs font-bold text-slate-300">
              <li className="cursor-pointer" onClick={() => setView('today')}>Today's Banker</li>
              <li className="cursor-pointer" onClick={() => setView('history')}>Results</li>
            </ul>
          </div>
          <div>
             <div className="bg-[#1e293b] rounded-[2rem] p-8 border border-slate-800">
                <p className="text-[10px] text-slate-400 mb-4 font-bold uppercase flex items-center justify-center gap-2"><Send size={14} className="text-blue-400" /> Telegram</p>
                <a href="https://t.me/+gCsNNSQh8QMwOTZk" target="_blank" rel="noreferrer" className="w-full bg-[#0088cc] text-white font-black py-3 rounded-2xl text-[10px] uppercase flex items-center justify-center">JOIN NOW</a>
             </div>
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500 mb-4 font-black text-[10px] uppercase"><AlertTriangle size={14}/> 18+ Only</div>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-10">© 2026 SmartBets Pro</p>
          </div>
        </div>
      </footer>

      {/* MPESA MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative border-t-8 border-green-500">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-300"><X size={20}/></button>
              <div className="text-center mb-8 pt-4">
                <Phone size={32} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-black text-slate-900 uppercase italic">M-PESA VIP</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase mt-2">Unlock Banker Board • KES 200</p>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">254</span>
                   <input required type="tel" placeholder="7XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 text-xl font-black outline-none focus:border-green-500 transition-all" />
                </div>
                <button disabled={isPaying} type="submit" className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs">
                  {isPaying ? "Sending Push..." : "Confirm & Unlock"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameAnalysisApp />
    </QueryClientProvider>
  );
}
