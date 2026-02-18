// useStudyTimer.js — persistent, timestamp-based study timer
// Survives page navigation, tab refresh, and browser inactivity.
// Uses localStorage to store startTimestamp so elapsed time is always accurate.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getTimerState, saveTimerState, clearTimerState,
    getActiveSession, saveActiveSession,
    completeActiveSession,
} from '../utils/storage';

const TICK_MS = 1000;

function computeElapsed(timerState) {
    if (!timerState) return 0;
    const { status, startTimestamp, accumulatedSeconds } = timerState;
    if (status === 'running' && startTimestamp) {
        return accumulatedSeconds + (Date.now() - startTimestamp) / 1000;
    }
    return accumulatedSeconds || 0;
}

export function useStudyTimer({ onComplete } = {}) {
    // Restore state from localStorage on mount
    const [timerState, setTimerState] = useState(() => getTimerState());
    const [elapsed, setElapsed] = useState(() => computeElapsed(getTimerState()));
    const [laps, setLaps] = useState(() => {
        const session = getActiveSession();
        return session?.laps || [];
    });

    const tickRef = useRef(null);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // Persist timer state to localStorage whenever it changes
    const persistTimer = useCallback((state) => {
        if (state) {
            saveTimerState(state);
        } else {
            clearTimerState();
        }
        setTimerState(state);
    }, []);

    // Tick function — recalculates elapsed from timestamps
    const tick = useCallback(() => {
        const state = getTimerState();
        if (!state || state.status !== 'running') return;

        const newElapsed = computeElapsed(state);
        setElapsed(newElapsed);

        // Check for auto-complete (if a target duration was set)
        if (state.targetSeconds && newElapsed >= state.targetSeconds) {
            // Auto-complete the session
            const session = completeActiveSession(newElapsed, getActiveSession()?.laps || []);
            persistTimer(null);
            setElapsed(0);
            setLaps([]);
            clearInterval(tickRef.current);
            if (onCompleteRef.current) onCompleteRef.current(session);
        }
    }, [persistTimer]);

    // Start/stop the interval based on timer status
    useEffect(() => {
        clearInterval(tickRef.current);

        if (timerState?.status === 'running') {
            // Immediately sync elapsed (handles returning from another page)
            const currentElapsed = computeElapsed(timerState);
            setElapsed(currentElapsed);

            // Check for auto-complete immediately (in case it finished while away)
            if (timerState.targetSeconds && currentElapsed >= timerState.targetSeconds) {
                const session = completeActiveSession(currentElapsed, getActiveSession()?.laps || []);
                persistTimer(null);
                setElapsed(0);
                setLaps([]);
                if (onCompleteRef.current) onCompleteRef.current(session);
                return;
            }

            tickRef.current = setInterval(tick, TICK_MS);
        }

        return () => clearInterval(tickRef.current);
    }, [timerState, tick, persistTimer]);

    // ── Public API ──────────────────────────────────────────────────────────────

    const start = useCallback((sessionData = {}) => {
        const newState = {
            status: 'running',
            startTimestamp: Date.now(),
            accumulatedSeconds: 0,
            targetSeconds: sessionData.targetSeconds || null,
        };
        persistTimer(newState);
        setElapsed(0);
        setLaps([]);

        // Update active session laps
        const session = getActiveSession();
        if (session) {
            saveActiveSession({ ...session, laps: [] });
        }
    }, [persistTimer]);

    const pause = useCallback(() => {
        const state = getTimerState();
        if (!state || state.status !== 'running') return;

        const currentElapsed = computeElapsed(state);
        const newState = {
            ...state,
            status: 'paused',
            accumulatedSeconds: currentElapsed,
            startTimestamp: null,
            pausedAt: Date.now(),
        };
        persistTimer(newState);
        setElapsed(currentElapsed);
        clearInterval(tickRef.current);
    }, [persistTimer]);

    const resume = useCallback(() => {
        const state = getTimerState();
        if (!state || state.status !== 'paused') return;

        const newState = {
            ...state,
            status: 'running',
            startTimestamp: Date.now(),
            pausedAt: null,
        };
        persistTimer(newState);
    }, [persistTimer]);

    const stop = useCallback(() => {
        const state = getTimerState();
        const currentElapsed = computeElapsed(state);
        const currentLaps = getActiveSession()?.laps || laps;

        const completed = completeActiveSession(currentElapsed, currentLaps);
        persistTimer(null);
        setElapsed(0);
        setLaps([]);
        clearInterval(tickRef.current);
        return completed;
    }, [persistTimer, laps]);

    const reset = useCallback(() => {
        clearTimerState();
        persistTimer(null);
        setElapsed(0);
        setLaps([]);
        clearInterval(tickRef.current);
    }, [persistTimer]);

    const addLap = useCallback(() => {
        const currentElapsed = computeElapsed(getTimerState());
        const lap = {
            id: crypto.randomUUID(),
            lapNumber: laps.length + 1,
            elapsed: currentElapsed,
            timestamp: new Date().toISOString(),
        };
        const newLaps = [...laps, lap];
        setLaps(newLaps);

        // Persist laps in active session
        const session = getActiveSession();
        if (session) {
            saveActiveSession({ ...session, laps: newLaps });
        }
        return lap;
    }, [laps]);

    // Format seconds to HH:MM:SS or MM:SS
    const format = useCallback((seconds) => {
        const s = Math.floor(seconds);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [
            h > 0 ? String(h).padStart(2, '0') : null,
            String(m).padStart(2, '0'),
            String(sec).padStart(2, '0'),
        ].filter(Boolean).join(':');
    }, []);

    const status = timerState?.status || 'idle';

    return {
        elapsed,       // seconds (float)
        status,        // 'idle' | 'running' | 'paused'
        laps,
        start,
        pause,
        resume,
        stop,
        reset,
        addLap,
        targetSeconds: timerState?.targetSeconds || null,
        format,
    };
}
