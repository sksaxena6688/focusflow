// dateHelpers.js — date utilities for FocusFlow

export const toDateStr = (d = new Date()) => d.toISOString().slice(0, 10);
export const today = () => toDateStr(new Date());

export function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(minutes) {
    if (!minutes) return '0m';
    const h = Math.floor(minutes / 60), m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

/** Last N days as YYYY-MM-DD strings, oldest first */
export function lastNDays(n = 7) {
    return Array.from({ length: n }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (n - 1 - i));
        return toDateStr(d);
    });
}

/** Last N months as YYYY-MM strings, oldest first */
export function lastNMonths(n = 6) {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
}

export const dayLabel = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
export const monthLabel = (monthStr) => { const [y, m] = monthStr.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }); };

export function calcStreak(logDates = []) {
    const sorted = [...new Set(logDates)].sort().reverse();
    let streak = 0, check = today();
    for (const d of sorted) {
        if (d !== check) break;
        streak++;
        const prev = new Date(check + 'T00:00:00');
        prev.setDate(prev.getDate() - 1);
        check = toDateStr(prev);
    }
    return streak;
}

export const isOverdue = (dateStr) => !!dateStr && dateStr < today();

export function getDaysInMonth(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) =>
        `${monthStr}-${String(i + 1).padStart(2, '0')}`
    );
}
