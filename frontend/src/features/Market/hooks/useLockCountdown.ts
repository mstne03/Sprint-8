import { useEffect, useState } from "react";

type ColorClasses = {
    red: string,
    yellow: string,
    green: string
}

type Color = 'red' | 'yellow' | 'green'

export const useLockCountDown = (lockedUntil: string | null) => {
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
    
    
    
    // Color based on progress
    const getColor = () => {
        if (progress > 66) return 'red';
        if (progress > 33) return 'yellow';
        return 'green';
    };
    
    const color: Color = getColor();
    const colorClasses: ColorClasses = {
        red: 'bg-red-500/20 border-red-500 text-red-300',
        yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
        green: 'bg-green-500/20 border-green-500 text-green-300',
    };

    return {
        timeRemaining, progress,
        color, colorClasses
    }
}