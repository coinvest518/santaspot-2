import React, { useState, useEffect } from 'react';
import { subscribeToCurrentPrizePool, PrizePool } from '@/lib/firebase';

const LiveCounter: React.FC = () => {
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Subscribe to current prize pool updates
    const unsubscribe = subscribeToCurrentPrizePool((pool) => {
      if (pool && pool.total_amount !== prizePool?.total_amount) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
      setPrizePool(pool);
    });

    return () => unsubscribe();
  }, [prizePool?.total_amount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4 bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl text-center border border-white/30">
      <h2 className="text-2xl font-bold mb-4 text-white">Current Donation Pot</h2>
      <div 
        className={`text-5xl font-extrabold text-white transition-transform duration-500 ${
          isAnimating ? 'scale-110 animate-pulse' : ''
        }`}
      >
        {formatCurrency(prizePool?.total_amount || 100)}
      </div>
      {prizePool && (
        <p className="text-white/80 text-sm mt-2">
          {prizePool.entries} Donations made
        </p>
      )}
    </div>
  );
};

export default LiveCounter;
