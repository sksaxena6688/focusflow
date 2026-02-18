// Card.jsx — surface card wrapper
export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white border border-[#E0DDD6] rounded-xl shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, action }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <p className="text-[0.7rem] font-bold text-[#7A7A8A] uppercase tracking-widest">{title}</p>
            {action}
        </div>
    );
}
