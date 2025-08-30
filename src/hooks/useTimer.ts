import { useState, useRef, useEffect } from 'react';

export function useTimer() {
    const [loadTime, setLoadTime] = useState({
        elapsed: 0,
        isLoading: false,
        totalTime: null
    });

    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    const startTimer = () => {
        startTimeRef.current = Date.now();
        setLoadTime(prev => ({ ...prev, isLoading: true, elapsed: 0 }));

        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setLoadTime(prev => ({ ...prev, elapsed }));
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (startTimeRef.current) {
            const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setLoadTime(prev => ({
                ...prev,
                isLoading: false,
                totalTime
            }));
        }
    };

    const resetTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        startTimeRef.current = null;
        setLoadTime({
            elapsed: 0,
            isLoading: false,
            totalTime: null
        });
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return {
        loadTime,
        startTimer,
        stopTimer,
        resetTimer,
        formatTime
    };
}