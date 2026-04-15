import { useState, useMemo, FormEvent, useEffect } from 'react';
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

// 1. MAIN APP COMPONENT (Renamed for default export)
export default function App() {
  const [view, setView] = useState<'today' | 'history'>('today');
  // Initialize phone from localStorage so they stay "logged in"
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('userPhone') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // 2. FETCHING DATA (Including phone number to check payment status)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', phoneNumber],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}`, {
        params: { phone: phoneNumber }
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
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

  // 3. PAYMENT HANDLER
  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      // Save phone locally so the query can use it
      localStorage.setItem('userPhone', phoneNumber);
      
      await axios.post(`${API_BASE_URL}/api/pay/`, { phone: phoneNumber });
      
      alert("M-Pesa STK Push Sent! Enter PIN. Please wait 10 seconds then refresh.");
      setIsModalOpen(false);
      
      // Auto-refresh after 15 seconds to check if payment is verified
      setTimeout(() => refetch(), 15000);
    } catch (err) { 
      alert("Payment failed. Please ensure your phone is in 254... format."); 
    } finally { 
      setIsPaying(false); 
    }
  };

  if (isLoading && !data) return <div className="h-screen flex items-center justify-center font-black text-slate-200 animate-pulse text-[10px] tracking-[0.3em]">LOADING...</div>;

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
              {segments.pro.map((game: any) => {
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
                  </div>
                );
              })}

              {segments.free.map((game: any) => (
                <div key={game.id} className="bg-white border border-slate-100 rounded-[2.2rem] p-6 shadow-sm">
                   {/* ... Your existing Free segment rendering code ... */}
                   <h4 className="text-lg font-bold mb-2 italic">{game.title}</h4>
                   <p className="text-blue-600 font-black">{game.predicted_outcome}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="bg-amber-50 p-3 rounded-2xl">
                  <Zap className="text-amber-500" size={24} fill="currentColor" />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><X /></button>
              </div>
              
              <h3 className="text-2xl font-black italic uppercase mb-2">Unlock Pro Board</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Get 24hr access to high-accuracy daily bankers via M-Pesa STK Push.</p>

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="tel" required placeholder="2547XXXXXXXX"
                    value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-amber-500 outline-none"
                  />
                </div>
                <button 
                  disabled={isPaying}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isPaying ? "SENDING PUSH..." : "PAY KES 200 NOW"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
