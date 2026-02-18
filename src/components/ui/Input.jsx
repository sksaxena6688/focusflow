// Input.jsx — reusable form input / textarea / select
export function Input({ label, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            {label && <label className="text-[0.75rem] font-semibold text-[#4A4A5A] uppercase tracking-wider">{label}</label>}
            <input
                className={`w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg bg-white text-[#1A1A2E] placeholder:text-[#7A7A8A] focus:outline-none focus:border-[#2C4A7C] focus:ring-2 focus:ring-[#EBF0F8] transition-colors ${className}`}
                {...props}
            />
        </div>
    );
}

export function Textarea({ label, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            {label && <label className="text-[0.75rem] font-semibold text-[#4A4A5A] uppercase tracking-wider">{label}</label>}
            <textarea
                className={`w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg bg-white text-[#1A1A2E] placeholder:text-[#7A7A8A] focus:outline-none focus:border-[#2C4A7C] focus:ring-2 focus:ring-[#EBF0F8] transition-colors resize-y min-h-[80px] ${className}`}
                {...props}
            />
        </div>
    );
}

export function Select({ label, children, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            {label && <label className="text-[0.75rem] font-semibold text-[#4A4A5A] uppercase tracking-wider">{label}</label>}
            <select
                className={`w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg bg-white text-[#1A1A2E] focus:outline-none focus:border-[#2C4A7C] focus:ring-2 focus:ring-[#EBF0F8] transition-colors ${className}`}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}
