import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://smartbet-backend-mgqo.onrender.comhttps://smartbet-backend-mgqo.onrender.com';

function GameAnalysisApp() {
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('userPhone') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Fetch games & payment status
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', phoneNumber],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/games/?phone=${phoneNumber}`);
      return res.data;
    },
    enabled: true, // Always fetch, but 'has_paid' depends on phone param
  });

  const hasPaidToday = data?.has_paid_today || false;

  const handlePayment = async (e: any) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      await axios.post(`${API_BASE_URL}/api/pay/`, { phone: phoneNumber });
      localStorage.setItem('userPhone', phoneNumber); // Save phone locally
      alert("STK Push Sent! Enter your M-Pesa PIN. Refresh the page in 10 seconds.");
      setIsModalOpen(false);
      
      // Auto-refresh after 15 seconds to check if status updated to SUCCESS
      setTimeout(() => refetch(), 15000);
    } catch (err) {
      alert("Error initiating payment. Check your phone format.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
       {/* If not paid, show the Unlock Button */}
       {!hasPaidToday && (
         <button onClick={() => setIsModalOpen(true)}>UNLOCK VIP</button>
       )}

       {/* Map your games here */}
       {data?.games.map((game: any) => (
         <div key={game.id}>
           {game.match_name} - {game.is_premium && !hasPaidToday ? "LOCKED" : game.prediction}
         </div>
       ))}

       {/* Modal for Payment */}
       {isModalOpen && (
         <form onSubmit={handlePayment}>
           <input 
             type="text" 
             placeholder="2547..." 
             value={phoneNumber} 
             onChange={(e) => setPhoneNumber(e.target.value)} 
             required 
           />
           <button type="submit" disabled={isPaying}>
             {isPaying ? "Sending..." : "Pay KES 200"}
           </button>
         </form>
       )}
    </div>
  );
}
