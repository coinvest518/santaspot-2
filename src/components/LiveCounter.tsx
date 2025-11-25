import React, { useState, useEffect } from 'react';

const LiveCounter: React.FC = () => {
  const [counter, setCounter] = useState<number>(10000);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        return prev + 1;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 shadow-2xl rounded-2xl text-center">
      <h2 className="text-2xl font-bold mb-4 text-white">Prize Pool</h2>
      <div 
        className={`text-5xl font-extrabold text-white transition-transform duration-500 ${
          isAnimating ? 'scale-110 animate-pulse' : ''
        }`}
      >
        {formatCurrency(counter)}
      </div>
    </div>
  );
};

export default LiveCounter;
