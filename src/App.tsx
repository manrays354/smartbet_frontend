import { useState, FormEvent, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Lock, ChevronRight, Phone, X, Timer } from 'lucide-react';

const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.com';

// 1. IMPROVED PAYMENT MODAL
const PaymentModal = memo(({ isOpen, onClose, onPay, isPaying }: any) => {
  const [localPhone, setLocalPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localPhone.length < 10) return alert("Enter valid phone number (e.g. 2547...)");
    onPay(localPhone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600"><X size={24}/></button>
        <h3 className="text-2xl font-black italic uppercase mb-2 text-slate-900">Unlock VIP Tips</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="tel" required placeholder="2547..." value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
          <button type="submit" disabled={isPaying} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl">{isPaying ? "SENDING..." : "PAY KES 200"}</button>
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
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', userPhone, view],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api`, { params: { phone: userPhone, type: view } });
      return res.data;
    },
  });

  const handleSTKPush = async (phone: string) => {
    setIsPaying(true);
    try {
      localStorage.setItem('userPhone', phone);
      setUserPhone(phone);
      await axios.post(`${API_BASE_URL}/pay`, { phone }); 
      alert("STK Push Sent!");
      setIsModalOpen(false);
      setTimeout(() => refetch(), 10000); 
    } catch (err) {
      alert("Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4">
      <nav className="flex justify-between items-center pb-6">
        <h1 className="text-lg font-black uppercase italic">SmartBets <span className="text-amber-500">Pro</span></h1>
      </nav>

      {/* Conditional Unlock UI */}
      {view === 'today' && !data?.has_paid_today && (
        <button onClick={() => setIsModalOpen(true)} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl mb-6 flex items-center justify-center gap-2">
          UNLOCK TODAY'S TIPS <ChevronRight size={16}/>
        </button>
      )}

      {/* GAMES LIST (Fixed Layout) */}
      <div className="space-y-4">
        {data?.games?.map((game: any) => (
          <div key={game.id} className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between mb-4">
              <h4 className="font-bold text-sm">{game.teams}</h4>
              <div className="flex items-center gap-1 text-slate-500 text-xs"><Timer size={12} /> {game.time}</div>
            </div>

            {/* Lockable Grid */}
            <div className="grid grid-cols-2 gap-3">
              {data.has_paid_today || view === 'history' ? (
                <>
                  <div className="bg-slate-900 p-3 rounded-2xl text-center"><p className="text-white text-xs">{game.prediction}</p></div>
                  <div className="bg-amber-50 p-3 rounded-2xl text-center"><p className="text-slate-900 text-xs">{game.odds}</p></div>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border-dashed border"><Lock size={14} className="mx-auto text-slate-400" /></div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border-dashed border"><Lock size={14} className="mx-auto text-slate-400" /></div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPay={handleSTKPush} isPaying={isPaying} />
    </div>
  );
}
