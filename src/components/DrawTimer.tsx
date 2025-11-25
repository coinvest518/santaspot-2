import { useEffect, useState } from 'react';
import { subscribeToCurrentPrizePool, PrizePool } from '@/lib/firebase';

const DrawTimer = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);

  const calculateTimeLeft = () => {
    let drawDate;
    
    if (!prizePool) {
      // Default to Thanksgiving 2025 (2 days away!)
      drawDate = new Date('2025-11-27T18:00:00Z');
    } else {
      drawDate = prizePool.draw_date.toDate();
    }
    
    const now = new Date();
    const difference = drawDate.getTime() - now.getTime();

    if (difference < 0) {
      // If date has passed, show Christmas
      const christmas = new Date('2025-12-25T18:00:00Z');
      const christmasDifference = christmas.getTime() - now.getTime();
      
      return {
        days: Math.floor(christmasDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((christmasDifference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((christmasDifference / 1000 / 60) % 60),
        seconds: Math.floor((christmasDifference / 1000) % 60)
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  useEffect(() => {
    // Subscribe to current prize pool
    const unsubscribe = subscribeToCurrentPrizePool((pool) => {
      setPrizePool(pool);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [prizePool]);

  return (
    <div className="bg-white/90 backdrop-blur rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4">Next Pot Draw In:</h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.days}</div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.hours}</div>
          <div className="text-sm text-gray-600">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.minutes}</div>
          <div className="text-sm text-gray-600">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{timeLeft.seconds}</div>
          <div className="text-sm text-gray-600">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default DrawTimer;