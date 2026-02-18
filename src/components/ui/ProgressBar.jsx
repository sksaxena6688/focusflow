// ProgressBar.jsx — thin progress bar
export default function ProgressBar({ value = 0, color = '#4A7C59', className = '' }) {
    const pct = Math.min(100, Math.max(0, value));
    return (
        <div className={`h-1.5 bg-[#E0DDD6] rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    );
}
