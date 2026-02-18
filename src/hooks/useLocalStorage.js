// useLocalStorage.js — generic hook for localStorage-backed state
import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue = []) {
    const [state, setState] = useState(() => {
        try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? initialValue; }
        catch { return initialValue; }
    });

    const set = useCallback((value) => {
        const next = typeof value === 'function' ? value(state) : value;
        setState(next);
        localStorage.setItem(key, JSON.stringify(next));
    }, [key, state]);

    return [state, set];
}
