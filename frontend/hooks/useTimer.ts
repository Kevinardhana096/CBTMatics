'use client';

// Custom hook untuk countdown timer
import { useState, useEffect, useRef } from 'react';

interface UseTimerOptions {
    initialSeconds: number;
    onComplete?: () => void;
    autoStart?: boolean;
}

export function useTimer({ initialSeconds, onComplete, autoStart = true }: UseTimerOptions) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(autoStart);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        stop();
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, seconds, onComplete]);

    const start = () => setIsRunning(true);

    const pause = () => setIsRunning(false);

    const stop = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const reset = (newSeconds?: number) => {
        stop();
        setSeconds(newSeconds ?? initialSeconds);
    };

    const formatTime = () => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        seconds,
        isRunning,
        start,
        pause,
        stop,
        reset,
        formatTime,
    };
}
