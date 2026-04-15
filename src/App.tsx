import { useState, useMemo, FormEvent, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Trophy, Lock, Crown, Zap, ChevronRight, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'import { useState, useMemo, FormEvent, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Trophy, Lock, Crown, Zap, ChevronRight, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.com';

// 1. DEDICATED MODAL COMPONENT (Stops the flickering)
const PaymentModal = memo(({ isOpen, onClose, onPay, isPaying }: any) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // STOPS PAGE RELOAD
    onPay(phone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <Zap className="text-amber-500" size={24} />
          <button onClick={onClose}><X /></button>
        </div>
        <h3 className="text-2xl font-black italic uppercase mb-2">Unlock Pro</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="tel" required placeholder="2547..." value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-amber-500 outline-none"
            />
          </div>
          <button 
            type="submit" disabled={isPaying}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-50"
          >
            {isPaying ? "SENDING PUSH..." : "PAY KES 200 NOW"}
          </button>
        </form>
      </div>
    </div>
  );
});

// 2. MAIN APP
export default function App() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const userPhone = localStorage.getItem('userPhone') || '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', userPhone],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/`, { params: { phone: userPhone } });
      return res.data;
    },
  });

  const handleSTKPush = async (phone: string) => {
    setIsPaying(true);
    try {
      localStorage.setItem('userPhone', phone);
      await axios.post(`${API_BASE_URL}/pay/`, { phone });
      alert("Check your phone for the M-Pesa popup!");
      setIsModalOpen(false);
      setTimeout(() => refetch(), 10000);
    } catch (err) {
      alert("CORS or Network Error. Check backend settings.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* ... Nav and Hero CSS same as before ... */}
      {!data?.has_paid_today && (
        <button onClick={() => setIsModalOpen(true)}>UNLOCK VIP</button>
      )}

      {/* Render Games Here */}

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPay={handleSTKPush}
        isPaying={isPaying}
      />
    </div>
  );
}
;

// 1. DEDICATED MODAL COMPONENT (Stops the flickering)
const PaymentModal = memo(({ isOpen, onClose, onPay, isPaying }: any) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // STOPS PAGE RELOAD
    onPay(phone);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <Zap className="text-amber-500" size={24} />
          <button onClick={onClose}><X /></button>
        </div>
        <h3 className="text-2xl font-black italic uppercase mb-2">Unlock Pro</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="tel" required placeholder="2547..." value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-amber-500 outline-none"
            />
          </div>
          <button 
            type="submit" disabled={isPaying}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg disabled:opacity-50"
          >
            {isPaying ? "SENDING PUSH..." : "PAY KES 200 NOW"}
          </button>
        </form>
      </div>
    </div>
  );
});

// 2. MAIN APP
export default function App() {
  const [view, setView] = useState<'today' | 'history'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const userPhone = localStorage.getItem('userPhone') || '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', userPhone],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/`, { params: { phone: userPhone } });
      return res.data;
    },
  });

  const handleSTKPush = async (phone: string) => {
    setIsPaying(true);
    try {
      localStorage.setItem('userPhone', phone);
      await axios.post(`${API_BASE_URL}/pay/`, { phone });
      alert("Check your phone for the M-Pesa popup!");
      setIsModalOpen(false);
      setTimeout(() => refetch(), 10000);
    } catch (err) {
      alert("CORS or Network Error. Check backend settings.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* ... Nav and Hero CSS same as before ... */}
      {!data?.has_paid_today && (
        <button onClick={() => setIsModalOpen(true)}>UNLOCK VIP</button>
      )}

      {/* Render Games Here */}

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPay={handleSTKPush}
        isPaying={isPaying}
      />
    </div>
  );
}
