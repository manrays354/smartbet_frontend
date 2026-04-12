import { useState, useMemo, FormEvent } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Lock, Crown, Zap, ShieldCheck, ChevronRight, 
  Phone, X, Mail, Twitter, Instagram, Send, AlertTriangle, 
  CheckCircle2, TrendingUp, Calendar, History, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const queryClient = new QueryClient();
const API_BASE_URL = 'https://onrender.com';

function GameAnalysisApp() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // OPTIMIZED QUERY: "Cages" the app to prevent server stress
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/`);
      return res.data;
    },
    // --- CACHING STRATEGY ---
    staleTime: 1000 * 60 * 5,       // Data is "fresh" for 5 mins (prevents re-fetch on tab/view switch)
    gcTime: 1000 * 60 * 30,          // Keep data in cache for 30 mins
    refetchInterval: 1000 * 60 * 15, // Auto-refresh only every 15 mins (was 30s)
    refetchOnWindowFocus: false,     // DO NOT fetch when user clicks back into the tab
    refetchOnReconnect: true,        // Only fetch if internet was lost and recovered
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
      await axios.post(`${API_BASE_URL}/pay/`, { phone: phoneNumber });
      alert("M-Pesa STK Push Sent! Enter PIN.");
      setIsModalOpen(false);
    } catch (err) { alert("Try again."); } finally { setIsPaying(false); }
  };

  if (isLoading && !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfcfd]">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-black text-slate-400 text-[10px] tracking-[0.3em] uppercase">Syncing Board...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans text-slate-900 flex flex-col">
      <nav className="bg-white border-b sticky top-0 z-50 py-3 px-4 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500 w-5 h-5" strokeWidth={3} />
          <h1 className="text-lg font-black tracking-tighter uppercase italic">SmartBets <span className="text-amber-500">Pro</span></h1>
        </div>
        
        {/* Manual Refresh Button: Better than auto-polling for the server */}
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <RefreshCw size={18} className={`text-slate-400 ${isFetching ? 'animate-spin text-amber-500' : ''}`} />
        </button>
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

        {filteredAndGrouped.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No games available for this section</div>
        ) : (
          filteredAndGrouped.map(([date, segments]) => (
            <div key={date} className="mb-14">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 text-center">{date}</h3>
              
              <div className="space-y-6">
                {/* PRO SECTION */}
                {segments.pro.map((game: any) => {
                  const isLocked = !hasPaidToday && view === 'today';
                  return (
                    <div 
                      key={game.id} 
                      onClick={() => isLocked && setIsModalOpen(true)}
                      className={`rounded-[2.2rem] border p-6 transition-all cursor-pointer ${isLocked ? 'bg-slate-900 text-white shadow-xl hover:scale-[1.01]' : 'bg-white border-slate-100 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase bg-amber-500 text-slate-900">VIP</span>
                        {!isLocked ? (
                          <span className="text-amber-500 font-black text-sm">{game.odds}</span>
                        ) : (
                          <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest bg-white/5 px-2 py-1 rounded flex items-center gap-1">
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
                {segments.free.map((game: any) => (
                  <div key={game.id} className="bg-white border border-slate-100 rounded-[2.2rem] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">Free Board</span>
                      <span className="text-blue-600 font-black text-sm">{game.odds}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-5 italic leading-tight">{game.title}</h4>
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Prediction</p>
                        <p className="font-black text-slate-700 italic">{game.predicted_outcome}</p>
                      </div>
                      {view === 'history' && (
                          <CheckCircle2 className="text-green-500" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* PAYMENT MODAL (Omitted for brevity, but stays same) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
             {/* Modal Content */}
             <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative overflow-hidden">
                <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-900"><X size={24}/></button>
                <div className="mb-8">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600"><Crown size={24}/></div>
                  <h3 className="text-2xl font-black italic uppercase leading-none">VIP Access</h3>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Unlock all daily banker tips and high-odds slips instantly.</p>
                </div>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">M-Pesa Number</label>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-300""")/>>
                      <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0712345678" required className="bg-transparent w-full font-bold text-slate-800 outline-none placeholder:text-slate-300" />
                    </div>
                  </div>
                  <button type="submit" disabled={isPaying} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xs uppercase shadow-xl hover:bg-slate-800 transition-colors">
                    {isPaying ? "Sending Prompt..." : "Pay KSH 50 Now"}
                  </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper to provide Query Client
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameAnalysisApp />
    </QueryClientProvider>
  );
}
