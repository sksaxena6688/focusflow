// useTimer.js — study session timer hook
import { useState, useEffect, useRef } from 'react';

export function useTimer() {
    const [seconds, setSeconds] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | running | paused
    const ref = useRef(null);

    useEffect(() => {
        if (status === 'running') {
            ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            clearInterval(ref.current);
        }
        return () => clearInterval(ref.current);
    }, [status]);

    const start = () => setStatus('running');
    const pause = () => setStatus('paused');
    const resume = () => setStatus('running');
    const reset = () => { setStatus('idle'); setSeconds(0); };

    const format = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(sec).padStart(2, '0')]
            .filter(Boolean).join(':');
    };

    return { seconds, status, start, pause, resume, reset, format };
}
