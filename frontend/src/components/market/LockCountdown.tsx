import { useState, useEffect } from 'react';

interface LockCountdownProps {
  lockedUntil: string | null;
  compact?: boolean;
}

export const LockCountdown = ({ lockedUntil, compact = false }: LockCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(100); // 0-100

  useEffect(() => {
    if (!lockedUntil) {
      setTimeRemaining('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const lockDate = new Date(lockedUntil);
      const diff = lockDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Unlocked');
        setProgress(0);
        return;
      }

      // Calculate time components
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format string
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }

      // Calculate progress (7 days = 100%, 0 days = 0%)
      const totalLockTime = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
      const progressPercent = Math.max(0, Math.min(100, (diff / totalLockTime) * 100));
      setProgress(progressPercent);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  if (!lockedUntil || !timeRemaining) {
    return null;
  }

  // Color based on progress
  const getColor = () => {
    if (progress > 66) return 'red';
    if (progress > 33) return 'yellow';
    return 'green';
  };

  const color = getColor();
  const colorClasses = {
    red: 'bg-red-500/20 border-red-500 text-red-300',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    green: 'bg-green-500/20 border-green-500 text-green-300',
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium ${colorClasses[color]}`}>
        🔒 {timeRemaining}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-bold">{timeRemaining}</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            color === 'red' ? 'bg-red-500' : 
            color === 'yellow' ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
