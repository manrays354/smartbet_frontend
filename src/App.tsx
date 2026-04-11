import { useState, useMemo, FormEvent } from 'react';
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery 
} from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Smartphone, X, Trophy, Crown, ArrowRight, 
  ShieldCheck, Zap, History, CheckCircle2, Mail, 
  Phone, Instagram, Twitter, MessageSquare, 
  AlertTriangle, ExternalLink 
} from 'lucide-react';
import axios from 'axios';

// Initialize the Query Client for silent background updates
const queryClient = new QueryClient();

// --- COMPONENTS ---

function GameAnalysisApp() {
  const [hasPaidToday, setHasPaidToday] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // FETCH LOGIC: React Query handles caching and background refreshing
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await axios.get('https://smartbet-backend-mgqo.onrender.com');
      return res.data;
    },
    refetchInterval: 30000, // Checks for new games every 30 seconds silently
  });

  const isPastDay = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  const groupedGames = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    const sortedGames = [...games].sort((a, b) => 
      new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    );

    sortedGames.forEach((game: any) => {
      const dateLabel = game.match_date 
        ? new Date(game.match_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
        : "Today's Board";
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(game);
    });
    return Object.entries(groups).map(([date, games]) => ({ date, games }));
  }, [games]);

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      const response = await axios.post('https://smartbet-backend-mgqo.onrender.com/', { phone: phoneNumber });
      if (response.status === 200) {
        alert("Check your phone for the M-Pesa STK push!");
        setIsModalOpen(false);
      }
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  // Only show full-screen loader on the very first visit
  if (isLoading && games.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Waking up server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">SmartBets <span className="text-amber-500">Pro</span></h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">
             <ShieldCheck className="w-3 h-3" /> Secure
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-20">
        
        {/* PREMIUM STATUS CARD */}
        {!hasPaidToday && (
          <div className="mb-12 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">Elite Intelligence</h2>
              <p className="text-slate-400 text-xs mb-6 uppercase tracking-widest font-semibold">Unlock 90% accuracy slips — KES 200</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 shadow-amber-500/20"
              >
                UNLOCK PRO BOARD
              </button>
            </div>
            <Zap className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 rotate-12" />
          </div>
        )}

        {/* GAME CARDS */}
        {groupedGames.map((group) => (
          <div key={group.date} className="mb-14">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                {group.date} {isPastDay(group.games[0]?.match_date) && "(HISTORY)"}
              </h3>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="space-y-5">
              {group.games.map((game) => {
                const unlockedByHistory = isPastDay(game.match_date);
                const isLocked = game.is_premium && !hasPaidToday && !unlockedByHistory;

                return (
                  <motion.div 
                    layout
                    key={game.id}
                    onClick={() => isLocked && setIsModalOpen(true)}
                    className={`relative rounded-[2rem] p-6 border transition-all duration-300 ${
                      isLocked 
                      ? 'bg-slate-900 border-slate-800 text-white shadow-xl cursor-pointer hover:border-amber-500/50' 
                      : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex gap-2">
                        {game.is_premium ? (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isLocked ? 'bg-amber-500 text-slate-900' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            <Crown className="w-3 h-3" /> PRO TIP
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                            FREE TIP
                          </span>
                        )}
                        {game.is_finished && (
                          <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> FINAL
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                        {game.is_finished ? 'FT' : (game.match_time || 'TBA')}
                      </span>
                    </div>

                    {game.is_finished ? (
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg md:text-xl font-bold text-slate-800 flex-1 leading-snug">{game.title}</h4>
                        <div className="bg-slate-900 text-amber-500 px-4 py-2 rounded-xl text-xl font-black shadow-lg">
                          {game.home_score} : {game.away_score}
                        </div>
                      </div>
                    ) : (
                      <h4 className={`text-lg md:text-xl font-bold mb-4 pr-10 leading-snug ${isLocked ? 'text-white' : 'text-slate-800'}`}>
                        {game.title}
                      </h4>
                    )}

                    {isLocked ? (
                      <div className="flex items-center justify-between py-4 border-t border-slate-800/50 mt-4 group">
                         <span className="text-sm text-slate-400 flex items-center gap-2 font-medium italic">
                           <Lock className="w-4 h-4 text-amber-500" /> Pay to reveal prediction
                         </span>
                         <div className="bg-amber-500/10 p-2 rounded-full"><ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" /></div>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-2xl border text-sm font-semibold leading-relaxed shadow-inner ${
                        game.is_premium ? 'bg-amber-50/30 border-amber-100 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}>
                        {game.premium_analysis}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* PROFESSIONAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-white">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-black tracking-tighter uppercase italic">SmartBets Pro</span>
              </div>
              <p className="text-xs leading-relaxed opacity-60">Elite football intelligence using data-driven metrics to maximize winning slips.</p>
              <div className="flex justify-center md:justify-start gap-4 pt-2">
                <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-widest text-center md:text-left">Navigation</h4>
              <ul className="space-y-3 text-xs text-center md:text-left">
                <li><a href="#" className="hover:text-white transition-colors">Daily Predictions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Win Rate Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Premium History</a></li>
              </ul>
            </div>

            {/* TELEGRAM SLOT */}
            <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-slate-800">
              <h4 className="text-white font-bold mb-4 text-[10px] uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <MessageSquare className="w-3 h-3 text-sky-400" /> Join Group
              </h4>
              <p className="text-[10px] leading-relaxed mb-5 text-center md:text-left">Get instant alerts for high-value free tips and 24/7 analysis updates.</p>
              <a 
                href="https://t.me" 
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-black px-5 py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
              >
                JOIN TELEGRAM <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> 18+ Warning
              </h4>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-[9px] leading-relaxed italic text-slate-500">Analysis is for informational purposes only. Play responsibly and at your own risk.</p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            <p>© {new Date().getFullYear()} SMARTBETS ANALYSIS GROUP. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE BY MPESA
            </div>
          </div>
        </div>
      </footer>

      {/* STK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X className="w-4 h-4" /></button>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><Smartphone className="text-green-600 w-8 h-8" /></div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-none italic">Lipa na M-Pesa</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4 text-center">Unlock today's <strong>Pro Access</strong> for KES 200.</p>
              <form onSubmit={handlePayment} className="space-y-5">
                <input type="tel" required placeholder="07XXXXXXXX" className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-amber-500 outline-none text-center text-xl font-bold tracking-[0.1em] transition-all shadow-inner" onChange={(e) => setPhoneNumber(e.target.value)} />
                <button disabled={isPaying} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 active:scale-95">{isPaying ? "VERIFYING..." : "ACTIVATE NOW"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper to provide React Query context
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameAnalysisApp />
    </QueryClientProvider>
  );
}

