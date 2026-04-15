import { useState, useMemo, FormEvent, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Crown, Zap, ChevronRight, Phone, X } from 'lucide-react';

const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.com';

// 1. PAYMENT MODAL COMPONENT (Prevents Flickering)
const PaymentModal = memo(({ isOpen, onClose, onPay, isPaying }: any) => {
  const [localPhone, setLocalPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // STOPS PAGE REFRESH
    if (localPhone.length < 10) return alert("Enter valid phone number");
    onPay(localPhone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between mb-8">
          <Zap className="text-amber-500" size={24} fill="currentColor" />
          <button onClick={onClose} className="text-slate-300"><X /></button>
        </div>
        <h3 className="text-2xl font-black italic uppercase mb-2">Unlock Pro</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="tel" required placeholder="2547..." value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-amber-500 outline-none"
            />
          </div>
          <button type="submit" disabled={isPaying} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-50">
            {isPaying ? "SENDING PUSH..." : "PAY KES 200 NOW"}
          </button>
        </form>
      </motion.div>
    </div>
  );
});

// 2. MAIN APP COMPONENT
export default function App() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  // Persist phone number locally
  const currentPhone = localStorage.getItem('userPhone') || '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', currentPhone],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/games/`, { params: { phone: currentPhone } });
      return res.data;
    },
  });

  const handleSTKPush = async (phone: string) => {
    setIsPaying(true);
    try {
      localStorage.setItem('userPhone', phone);
      // Ensure path matches your Django urls.py exactly
      await axios.post(`${API_BASE_URL}/pay`, { phone }); 
      alert("STK Push Sent! Check your phone.");
      setIsModalOpen(false);
      setTimeout(() => refetch(), 10000); // Check status after 10s
    } catch (err) {
      alert("Error initiating payment. Check if your phone format is 254...");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading && !data) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
      <nav className="bg-white border-b py-3 px-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500 w-5 h-5" />
          <h1 className="text-lg font-black uppercase italic">SmartBets <span className="text-amber-500">Pro</span></h1>
        </div>
      </nav>

      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-grow">
        {/* VIP UNLOCK HERO */}
        {view === 'today' && !data?.has_paid_today && (
          <div className="mb-10 bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl font-black mb-4 uppercase italic">VIP Board</h2>
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-xs">
              UNLOCK NOW <ChevronRight size={16}/>
            </button>
            <Crown className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
          </div>
        )}

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
          <button onClick={() => setView('today')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'today' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Today</button>
          <button onClick={() => setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>History</button>
        </div>

        {/* GAMES MAPPING (Maintains original styling) */}
        {/* Map your data.games here following your initial design */}
      </main>

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPay={handleSTKPush} 
        isPaying={isPaying} 
      />
    </div>
  );
}
