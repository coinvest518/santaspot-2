import { Loader2, Gift } from 'lucide-react';

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-green-800 to-red-700 flex items-center justify-center z-[9999]">
      <div className="text-center text-white">
        <div className="flex items-center justify-center mb-6">
          <Gift className="w-8 h-8 text-yellow-300 mr-3" />
          <h2 className="text-2xl font-bold text-white">Santa's Pot 🎅</h2>
        </div>
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-yellow-300 mb-4" />
        <p className="text-lg font-semibold">Setting up your giving dashboard...</p>
        <p className="text-sm text-yellow-100/80">Spreading holiday cheer! ✨</p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
